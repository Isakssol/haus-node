import { Worker, type Job as BullJob } from "bullmq";
import { fal } from "@fal-ai/client";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { createRedis } from "../lib/redis.js";
import { jobs } from "../lib/schema.js";
import { getNode } from "@haus-node/node-registry";
import { mirrorUrl, uploadFile } from "../lib/storage.js";
import { deductCredits } from "../services/credits.js";
import type { WorkflowNode, WorkflowEdge, JobOutput } from "@haus-node/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

fal.config({ credentials: process.env.FAL_KEY ?? "" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

// ─── Job payload ──────────────────────────────────────────────────────────────

export interface JobPayload {
  jobId: string;
  workspaceId: string;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  inputs: Record<string, unknown>;
}

// ─── Topological sort with cycle detection ────────────────────────────────────

function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const inDegree  = new Map<string, number>();
  const adjList   = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    adjList.get(edge.source)?.push(edge.target);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node   = nodes.find((n) => n.id === nodeId)!;
    sorted.push(node);
    for (const neighbor of adjList.get(nodeId) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // Cycle detection
  if (sorted.length !== nodes.length) {
    const missing = nodes
      .filter((n) => !sorted.find((s) => s.id === n.id))
      .map((n) => n.id)
      .join(", ");
    throw new Error(
      `Workflow contains a cycle — cannot execute. Affected nodes: ${missing}`
    );
  }

  return sorted;
}

// ─── Resolve node inputs from upstream outputs + own parameters ───────────────
//
// Priority (highest first):
//   1. Values wired in via edges  (upstream node output → this node input port)
//   2. Node's own saved parameters  (set by user in the inspector)
//   3. Global run-time inputs  (passed when calling the API, e.g. batch runs)

function resolveNodeInputs(
  node: WorkflowNode,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, Record<string, unknown>>,
  globalInputs: Record<string, unknown>
): Record<string, unknown> {
  // Start with the node's own parameter values
  const resolved: Record<string, unknown> = { ...node.data.parameters };

  // Override with connected outputs from upstream nodes.
  for (const edge of edges) {
    if (edge.target !== node.id) continue;
    const upstreamOutput = nodeOutputs.get(edge.source);
    if (!upstreamOutput) continue;

    const value = upstreamOutput[edge.sourceHandle];
    if (value !== undefined) {
      resolved[edge.targetHandle] = value;
    }
  }

  // Apply any global / API-level overrides (format: "nodeId.paramId")
  for (const [key, val] of Object.entries(globalInputs)) {
    if (key.startsWith(`${node.id}.`)) {
      const paramKey = key.split(".").slice(1).join(".");
      resolved[paramKey] = val;
    }
  }

  return resolved;
}

// ─── Execute a single node ────────────────────────────────────────────────────

async function executeNode(
  node: WorkflowNode,
  resolvedInputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const def = getNode(node.type);
  if (!def) throw new Error(`Unknown node type: ${node.type}`);

  if (def.provider === "internal") {
    return executeInternalNode(def.providerModel, resolvedInputs);
  }

  if (def.provider === "fal") {
    return executeFalNode(def.providerModel, resolvedInputs);
  }

  if (def.provider === "openai") {
    return executeOpenAINode(def, resolvedInputs);
  }

  if (def.provider === "gemini") {
    return executeGeminiNode(def.providerModel, resolvedInputs);
  }

  throw new Error(`Unknown provider: ${def.provider}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function executeInternalNode(
  model: string,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (model) {
    case "internal/text":
      return { text: inputs["value"] ?? "" };

    case "internal/number":
      return { number: Number(inputs["value"] ?? 0) };

    case "internal/seed":
      return {
        seed:
          inputs["value"] === -1 || !inputs["value"]
            ? Math.floor(Math.random() * 2_147_483_647)
            : inputs["value"],
      };

    case "internal/import":
      // Import exposes the same URL on both image and video ports
      return { image: inputs["url"], video: inputs["url"] };

    case "internal/export":
      return inputs;

    case "internal/preview": {
      // Re-expose the received media value as a "media" output so the
      // frontend's mergeNodeOutput is called and the node can render it.
      const mediaVal = inputs["media"] ?? inputs["image"] ?? inputs["video"] ?? inputs["audio"];
      return { media: mediaVal };
    }

    case "internal/text-iterator":
      return { text: inputs["items"] };

    default:
      return inputs;
  }
}

// ── fal.ai ────────────────────────────────────────────────────────────────────

/**
 * Coerce string values that look like pure integers or decimals to numbers.
 * fal.ai rejects parameters like num_images="1" — they must be numeric.
 * We leave strings that contain non-numeric characters (aspect ratios,
 * image_size presets, etc.) untouched.
 */
function coerceFalInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) {
      out[k] = Number(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function executeFalNode(
  modelId: string,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // Coerce "1", "4", "0.5" etc. → numbers (fal rejects string numerics)
  inputs = coerceFalInputs(inputs);

  // Replace -1 seeds with a real random value
  if ("seed" in inputs && inputs["seed"] === -1) {
    inputs = { ...inputs, seed: Math.floor(Math.random() * 2_147_483_647) };
  }

  // fal.ai endpoints universally expect `image_url` (and `mask_url`), not bare `image`/`mask`.
  // Kling v3 I2V specifically uses `start_image_url` instead of `image_url`.
  // Our node graph uses `image` / `mask` as port names — remap them here before sending to fal.
  if ("image" in inputs) {
    const { image, ...rest } = inputs;
    if (modelId.includes("kling-video/v3") && modelId.includes("image-to-video")) {
      inputs = { ...rest, start_image_url: image };
    } else if (!("image_url" in inputs)) {
      inputs = { ...rest, image_url: image };
    }
  }
  if ("mask" in inputs && !("mask_url" in inputs)) {
    const { mask, ...rest } = inputs;
    inputs = { ...rest, mask_url: mask };
  }

  const result = await fal.subscribe(modelId, {
    input: inputs as Record<string, unknown>,
  });
  // fal.subscribe() wraps the response in { data: {...}, requestId: "..." }
  // We need to unwrap it — fall back to the raw result if .data is missing.
  const raw = result as Record<string, unknown>;
  const output = (raw["data"] && typeof raw["data"] === "object"
    ? raw["data"]
    : raw) as Record<string, unknown>;
  // Mirror generated files to our own S3/R2 storage
  if (Array.isArray(output["images"]) && output["images"].length > 0) {
    const first = output["images"][0] as { url: string };
    const { url } = await mirrorUrl(first.url, {
      folder: "outputs/images",
      contentType: "image/png",
    });
    return { image: url, images: output["images"] };
  }

  if (output["video"] && typeof output["video"] === "object") {
    const vid = output["video"] as { url: string };
    const { url } = await mirrorUrl(vid.url, {
      folder: "outputs/videos",
      contentType: "video/mp4",
    });
    return { video: url };
  }

  if (typeof output["image"] === "object" && output["image"]) {
    const img = output["image"] as { url: string };
    const { url } = await mirrorUrl(img.url, {
      folder: "outputs/images",
      contentType: "image/png",
    });
    return { image: url };
  }

  return output;
}

// ── Gemini / Imagen ───────────────────────────────────────────────────────────

async function executeGeminiNode(
  modelId: string,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const prompt      = String(inputs["prompt"] ?? "");
  const sampleCount = Number(inputs["sampleCount"] ?? 1);
  const aspectRatio = String(inputs["aspectRatio"] ?? "1:1");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${GEMINI_API_KEY}`;

  const body = {
    instances: [{ prompt }],
    parameters: { sampleCount, aspectRatio },
  };

  const res = await fetch(endpoint, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json() as {
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
  };

  const predictions = json.predictions ?? [];
  if (predictions.length === 0) {
    throw new Error("Gemini API returned no images");
  }

  // Take the first image, decode base64, upload to R2/S3
  const first  = predictions[0]!;
  const base64 = first.bytesBase64Encoded ?? "";
  const mime   = first.mimeType ?? "image/png";
  const buffer = Buffer.from(base64, "base64");

  const { url } = await uploadFile(buffer, {
    folder:      "outputs/images",
    contentType: mime,
  });

  return { image: url };
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function executeOpenAINode(
  def: ReturnType<typeof getNode>,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (!def) throw new Error("Node definition missing");

  // Prompt Enhancer
  if (def.id === "prompt-enhancer") {
    const style = inputs["style"] ?? "detailed";
    const systemPrompts: Record<string, string> = {
      detailed:
        "You are an expert image prompt writer. Expand and improve the given prompt to be more detailed and descriptive. Return only the improved prompt, nothing else.",
      cinematic:
        "You are a cinematographer. Rewrite this prompt in cinematic terms with camera angles, lighting, and mood. Return only the improved prompt.",
      artistic:
        "You are an art director. Enhance this prompt with artistic style, technique, and aesthetic details. Return only the improved prompt.",
      photography:
        "You are a professional photographer. Add technical photography details like lens, aperture, lighting setup. Return only the improved prompt.",
      minimal:
        "Clean up and slightly improve this prompt. Keep it concise. Return only the improved prompt.",
    };
    const system =
      systemPrompts[style as string] ?? systemPrompts["detailed"]!;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user",   content: String(inputs["text"] ?? "") },
      ],
      max_tokens: 500,
    });
    return { text: completion.choices[0]?.message?.content ?? "" };
  }

  // Image Describer
  if (def.id === "image-describer") {
    const imageUrl  = inputs["image"] as string;
    const style     = inputs["style"] ?? "prompt";
    const stylePrompts: Record<string, string> = {
      prompt:
        "Describe this image as a detailed AI image generation prompt. Be specific about style, subject, colors, lighting, composition.",
      descriptive:
        "Describe what you see in this image in natural language.",
      technical:
        "Provide a technical analysis of this image: composition, lighting, color palette, style, and technique.",
    };
    const userPrompt =
      stylePrompts[style as string] ?? stylePrompts["prompt"]!;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text",      text: userPrompt },
          ],
        },
      ],
      max_tokens: 500,
    });
    return { text: completion.choices[0]?.message?.content ?? "" };
  }

  // DALL-E 3
  if (def.id === "dalle-3") {
    const prompt  = String(inputs["prompt"] ?? "");
    const size    = (inputs["size"]    as "1024x1024" | "1792x1024" | "1024x1792") ?? "1024x1024";
    const quality = (inputs["quality"] as "standard" | "hd") ?? "standard";
    const style   = (inputs["style"]   as "vivid" | "natural") ?? "vivid";

    const response = await openai.images.generate({
      model:   "dall-e-3",
      prompt,
      n:       1,
      size,
      quality,
      style,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error("DALL-E 3 returned no image URL");

    const { url } = await mirrorUrl(imageUrl, {
      folder:      "outputs/images",
      contentType: "image/png",
    });
    return { image: url };
  }

  throw new Error(`Unhandled OpenAI node: ${def.id}`);
}

// ─── WebSocket broadcast helper ───────────────────────────────────────────────

async function broadcast(
  jobId: string,
  event: string,
  payload: unknown
): Promise<void> {
  const redis = createRedis();
  await redis.publish(
    `job:${jobId}`,
    JSON.stringify({ event, payload, timestamp: new Date().toISOString() })
  );
  await redis.quit();
}

// ─── Main Worker ──────────────────────────────────────────────────────────────

export function createJobWorker() {
  const connection = createRedis();

  const worker = new Worker<JobPayload>(
    "jobs",
    async (bullJob: BullJob<JobPayload>) => {
      const { jobId, workspaceId, userId, nodes, edges, inputs } =
        bullJob.data;

      // Mark job as running in DB
      await db
        .update(jobs)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(jobs.id, jobId));

      await broadcast(jobId, "job:status", { status: "running" });

      // Topological sort (throws if cycle detected)
      const sortedNodes = topologicalSort(nodes, edges);
      const nodeOutputs = new Map<string, Record<string, unknown>>();
      const allOutputs: JobOutput[] = [];
      let totalCreditsUsed = 0;

      try {
        for (const node of sortedNodes) {
          const def = getNode(node.type);
          if (!def) continue;

          const resolved = resolveNodeInputs(
            node,
            edges,
            nodeOutputs,
            inputs
          );

          // Tell the frontend this node is now running
          await broadcast(jobId, "job:status", {
            nodeId:     node.id,
            nodeStatus: "running",
          });

          let output: Record<string, unknown>;
          try {
            output = await executeNode(node, resolved);
          } catch (nodeErr) {
            const msg =
              nodeErr instanceof Error ? nodeErr.message : String(nodeErr);

            // Broadcast a node-level error so the frontend can mark
            // exactly which node failed
            await broadcast(jobId, "job:node_error", {
              nodeId: node.id,
              error:  msg,
            });

            // Re-throw so the job itself is marked as failed
            throw new Error(`Node "${def.label}" failed: ${msg}`);
          }

          nodeOutputs.set(node.id, output);

          // Deduct credits for non-free nodes
          if (def.creditCost > 0) {
            await deductCredits(
              workspaceId,
              userId,
              def.creditCost,
              `Node: ${def.label}`,
              jobId
            );
            totalCreditsUsed += def.creditCost;
          }

          // Broadcast each output port individually so the frontend can
          // accumulate them without one overwriting another
          for (const outPort of def.outputs) {
            const value = output[outPort.id];
            if (value !== undefined) {
              const jobOutput: JobOutput = {
                nodeId: node.id,
                portId: outPort.id,
                type:   outPort.type,
                url:    typeof value === "string" ? value : undefined,
                value:  typeof value !== "string" ? value : undefined,
              };
              allOutputs.push(jobOutput);
              await broadcast(jobId, "job:output", jobOutput);
            }
          }

          // Tell the frontend this node is complete
          await broadcast(jobId, "job:status", {
            nodeId:     node.id,
            nodeStatus: "completed",
          });
        }

        // ── All nodes done ──────────────────────────────────
        await db
          .update(jobs)
          .set({
            status:       "completed",
            outputs:      allOutputs,
            creditsUsed:  totalCreditsUsed,
            completedAt:  new Date(),
          })
          .where(eq(jobs.id, jobId));

        await broadcast(jobId, "job:complete", {
          outputs:      allOutputs,
          creditsUsed:  totalCreditsUsed,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err);

        await db
          .update(jobs)
          .set({
            status:      "failed",
            error:       message,
            creditsUsed: totalCreditsUsed,
            completedAt: new Date(),
          })
          .where(eq(jobs.id, jobId));

        await broadcast(jobId, "job:error", { error: message });
        throw err;
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail:     { count: 50  },
    }
  );

  worker.on("error", console.error);
  return worker;
}

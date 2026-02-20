import type { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db.js";
import { getRedis } from "../lib/redis.js";
import { jobs, workflows } from "../lib/schema.js";
import { NODE_MAP } from "@haus-node/node-registry";
import { getBalance, calculateWorkflowCost } from "../services/credits.js";
import type { JobPayload } from "../workers/job.worker.js";

let jobQueue: Queue<JobPayload> | null = null;

function getQueue(): Queue<JobPayload> {
  if (!jobQueue) {
    jobQueue = new Queue("jobs", {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }
  return jobQueue;
}

const RunWorkflowSchema = z.object({
  workflowId: z.string().uuid().nullish(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  inputs: z.record(z.unknown()).default({}),
});

export async function jobRoutes(app: FastifyInstance) {
  // Run a workflow
  app.post("/workspaces/:workspaceId/jobs", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = RunWorkflowSchema.parse(req.body);

    let nodes = body.nodes ?? [];
    let edges = body.edges ?? [];

    // Load from saved workflow if workflowId provided
    if (body.workflowId) {
      const [wf] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, body.workflowId))
        .limit(1);

      if (!wf) return reply.status(404).send({ error: "Workflow not found" });
      nodes = wf.nodes as typeof nodes;
      edges = wf.edges as typeof edges;
    }

    if (nodes.length === 0) {
      return reply.status(400).send({ error: "No nodes in workflow" });
    }

    // Pre-flight: check credits
    const cost = calculateWorkflowCost(nodes, NODE_MAP);
    const balance = await getBalance(workspaceId);

    if (balance < cost) {
      return reply.status(402).send({
        error: "Insufficient credits",
        required: cost,
        available: balance,
      });
    }

    // Create job record
    const [job] = await db
      .insert(jobs)
      .values({
        workflowId: body.workflowId,
        workspaceId,
        userId,
        status: "queued",
        workflowSnapshot: { nodes, edges },
        inputs: body.inputs,
        creditsUsed: 0,
      })
      .returning();

    // Enqueue
    const queue = getQueue();
    await queue.add(
      "run-workflow",
      {
        jobId: job.id,
        workspaceId,
        userId,
        nodes,
        edges,
        inputs: body.inputs,
      } satisfies JobPayload,
      { jobId: job.id }
    );

    return reply.status(202).send({
      data: {
        jobId: job.id,
        status: "queued",
        estimatedCredits: cost,
      },
    });
  });

  // Get job status
  app.get("/jobs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!job) return reply.status(404).send({ error: "Job not found" });
    return { data: job };
  });

  // List jobs for workspace
  app.get("/workspaces/:workspaceId/jobs", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const query = req.query as { limit?: string; offset?: string };
    const limit = Math.min(Number(query.limit ?? 20), 100);
    const offset = Number(query.offset ?? 0);

    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.workspaceId, workspaceId))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return { data: rows, limit, offset };
  });
}

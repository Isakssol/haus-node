import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db.js";
import { workflows } from "../lib/schema.js";
import { nanoid } from "nanoid";

const WorkflowBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export async function workflowRoutes(app: FastifyInstance) {
  // List workflows for workspace
  app.get("/workspaces/:workspaceId/workflows", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = (req as any).auth?.userId;

    const rows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.workspaceId, workspaceId))
      .orderBy(desc(workflows.updatedAt));

    return { data: rows };
  });

  // Get single workflow
  app.get("/workflows/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const [wf] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    if (!wf) return reply.status(404).send({ error: "Workflow not found" });
    return { data: wf };
  });

  // Create workflow
  app.post("/workspaces/:workspaceId/workflows", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = WorkflowBodySchema.parse(req.body);

    const [wf] = await db
      .insert(workflows)
      .values({
        workspaceId,
        ownerId: userId,
        name: body.name ?? "Untitled Workflow",
        description: body.description,
        nodes: body.nodes ?? [],
        edges: body.edges ?? [],
        isPublic: body.isPublic ?? false,
        isTemplate: body.isTemplate ?? false,
        tags: body.tags ?? [],
      })
      .returning();

    return reply.status(201).send({ data: wf });
  });

  // Update workflow
  app.patch("/workflows/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = WorkflowBodySchema.parse(req.body);

    const [wf] = await db
      .update(workflows)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id))
      .returning();

    if (!wf) return reply.status(404).send({ error: "Workflow not found" });
    return { data: wf };
  });

  // Delete workflow
  app.delete("/workflows/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    await db.delete(workflows).where(eq(workflows.id, id));
    return { success: true };
  });

  // Get template workflows
  app.get("/templates", async (req, reply) => {
    const rows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.isTemplate, true))
      .orderBy(desc(workflows.updatedAt));

    return { data: rows };
  });
}

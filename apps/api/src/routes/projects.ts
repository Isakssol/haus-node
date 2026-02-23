import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db.js";
import { projects, workflows, jobs, assets } from "../lib/schema.js";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  clientName: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  tags: z.array(z.string()).optional(),
});

const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
  brandingAssets: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(["logo", "color_palette", "font", "guideline", "image", "other"]),
      name: z.string(),
    })
  ).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function projectRoutes(app: FastifyInstance) {
  // ── List projects in workspace ─────────────────────────────────────────────
  app.get("/workspaces/:workspaceId/projects", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };

    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt));

    return { data: rows };
  });

  // ── Get single project ─────────────────────────────────────────────────────
  app.get("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) return reply.status(404).send({ error: "Project not found" });
    return { data: project };
  });

  // ── Create project ─────────────────────────────────────────────────────────
  app.post("/workspaces/:workspaceId/projects", async (req, reply) => {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = CreateProjectSchema.parse(req.body);

    const [project] = await db
      .insert(projects)
      .values({
        workspaceId,
        ownerId: userId,
        name: body.name,
        description: body.description,
        clientName: body.clientName,
        color: body.color ?? "#7C3AED",
        tags: body.tags ?? [],
        brandingAssets: [],
      })
      .returning();

    return reply.status(201).send({ data: project });
  });

  // ── Update project ─────────────────────────────────────────────────────────
  app.patch("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateProjectSchema.parse(req.body);

    const [project] = await db
      .update(projects)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!project) return reply.status(404).send({ error: "Project not found" });
    return { data: project };
  });

  // ── Delete project ─────────────────────────────────────────────────────────
  app.delete("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  });

  // ── Get project workflows ──────────────────────────────────────────────────
  app.get("/projects/:id/workflows", async (req, reply) => {
    const { id } = req.params as { id: string };

    const rows = await db
      .select()
      .from(workflows)
      .where(eq(workflows.projectId, id))
      .orderBy(desc(workflows.updatedAt));

    return { data: rows };
  });

  // ── Get project jobs ───────────────────────────────────────────────────────
  app.get("/projects/:id/jobs", async (req, reply) => {
    const { id } = req.params as { id: string };

    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.projectId, id))
      .orderBy(desc(jobs.createdAt))
      .limit(50);

    return { data: rows };
  });

  // ── Get project assets ─────────────────────────────────────────────────────
  app.get("/projects/:id/assets", async (req, reply) => {
    const { id } = req.params as { id: string };

    const rows = await db
      .select()
      .from(assets)
      .where(eq(assets.projectId, id))
      .orderBy(desc(assets.createdAt));

    return { data: rows };
  });
}

import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db.js";
import { workspaces, workspaceMembers, creditTransactions } from "../lib/schema.js";
import { getBalance, addCredits } from "../services/credits.js";
import { PLAN_CREDITS } from "../services/credits.js";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

export async function workspaceRoutes(app: FastifyInstance) {
  // Create workspace
  app.post("/workspaces", async (req, reply) => {
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = CreateWorkspaceSchema.parse(req.body);

    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);

    const [ws] = await db
      .insert(workspaces)
      .values({
        name: body.name,
        slug: body.slug,
        ownerId: userId,
        plan: "free",
        credits: PLAN_CREDITS.free,
        monthlyCredits: PLAN_CREDITS.free,
        creditsResetAt: resetDate,
      })
      .returning();

    // Add owner as member
    await db.insert(workspaceMembers).values({
      workspaceId: ws.id,
      userId,
      role: "owner",
    });

    return reply.status(201).send({ data: ws });
  });

  // Get workspace
  app.get("/workspaces/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const [ws] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!ws) return reply.status(404).send({ error: "Workspace not found" });
    return { data: ws };
  });

  // Get workspace credits + transaction history
  app.get("/workspaces/:id/credits", async (req, reply) => {
    const { id } = req.params as { id: string };

    const balance = await getBalance(id);
    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.workspaceId, id))
      .orderBy(creditTransactions.createdAt)
      .limit(50);

    return { data: { balance, transactions } };
  });

  // Top up credits (in production, this would go through Stripe)
  app.post("/workspaces/:id/credits/topup", async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = (req as any).auth?.userId ?? "dev-user";
    const body = z
      .object({ amount: z.number().int().positive().max(100000) })
      .parse(req.body);

    const newBalance = await addCredits(id, userId, body.amount, "manual-topup");
    return { data: { balance: newBalance } };
  });
}

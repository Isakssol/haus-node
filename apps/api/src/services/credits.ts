import { eq, sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { workspaces, creditTransactions } from "../lib/schema.js";
import type { PlanType } from "@haus-node/types";

// ─── Plan credit allocations ──────────────────────────────────────────────────

export const PLAN_CREDITS: Record<PlanType, number> = {
  free: 150,
  starter: 1500,
  pro: 4000,
  team: 4500,
  enterprise: 999999,
};

// ─── Credit operations ────────────────────────────────────────────────────────

/**
 * Check if a workspace has enough credits.
 * Returns the current balance.
 */
export async function getBalance(workspaceId: string): Promise<number> {
  const [ws] = await db
    .select({ credits: workspaces.credits })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws) throw new Error(`Workspace ${workspaceId} not found`);
  return ws.credits;
}

/**
 * Atomically deduct credits from a workspace.
 * Throws if insufficient balance.
 * Returns the new balance.
 */
export async function deductCredits(
  workspaceId: string,
  userId: string,
  amount: number,
  reason: string,
  jobId?: string
): Promise<number> {
  if (amount <= 0) throw new Error("Amount must be positive");

  return await db.transaction(async (tx) => {
    // Lock the row and check balance atomically
    const [ws] = await tx
      .select({ credits: workspaces.credits })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .for("update");

    if (!ws) throw new Error("Workspace not found");
    if (ws.credits < amount) {
      throw new Error(
        `Insufficient credits: need ${amount}, have ${ws.credits}`
      );
    }

    const newBalance = ws.credits - amount;

    // Deduct
    await tx
      .update(workspaces)
      .set({ credits: newBalance, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId));

    // Log transaction
    await tx.insert(creditTransactions).values({
      workspaceId,
      userId,
      amount: -amount,
      reason,
      jobId,
    });

    return newBalance;
  });
}

/**
 * Add credits to a workspace (top-up or monthly reset).
 */
export async function addCredits(
  workspaceId: string,
  userId: string,
  amount: number,
  reason: string
): Promise<number> {
  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(workspaces)
      .set({
        credits: sql`${workspaces.credits} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning({ credits: workspaces.credits });

    await tx.insert(creditTransactions).values({
      workspaceId,
      userId,
      amount,
      reason,
    });

    return updated.credits;
  });
}

/**
 * Calculate how many credits a workflow will cost (pre-flight check).
 */
export function calculateWorkflowCost(
  nodes: Array<{ type: string }>,
  nodeRegistry: Map<string, { creditCost: number }>
): number {
  return nodes.reduce((total, node) => {
    const def = nodeRegistry.get(node.type);
    return total + (def?.creditCost ?? 0);
  }, 0);
}

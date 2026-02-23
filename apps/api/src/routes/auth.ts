import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { db } from "../lib/db.js";
import { users, sessions, workspaces, workspaceMembers } from "../lib/schema.js";
import { PLAN_CREDITS } from "../services/credits.js";

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_DAYS = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function sessionExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_TTL_DAYS);
  return d;
}

function creditsResetDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z
    .string()
    .email()
    .refine((e) => e.toLowerCase().endsWith("@haus.se"), {
      message: "Registration is restricted to @haus.se email addresses",
    }),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post("/auth/register", async (req, reply) => {
    const body = RegisterSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.errors[0]?.message ?? "Invalid input" });
    }

    const { email, name, password } = body.data;
    const emailLower = email.toLowerCase();

    // Check if already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existing) {
      return reply.status(409).send({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user + workspace + session atomically
    const user = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({ email: emailLower, name, passwordHash })
        .returning();

      // Auto-create personal workspace
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + randomBytes(3).toString("hex");
      const [ws] = await tx
        .insert(workspaces)
        .values({
          name: `${name}'s Workspace`,
          slug,
          ownerId: newUser!.id,
          plan: "free",
          credits: PLAN_CREDITS.free,
          monthlyCredits: PLAN_CREDITS.free,
          creditsResetAt: creditsResetDate(),
        })
        .returning();

      await tx.insert(workspaceMembers).values({
        workspaceId: ws!.id,
        userId: newUser!.id,
        role: "owner",
      });

      return newUser!;
    });

    // Create session
    const token = generateToken();
    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt: sessionExpiry(),
      userAgent: req.headers["user-agent"] ?? null,
      ipAddress: req.ip,
    });

    // Get workspace for response
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.id))
      .limit(1);

    return reply.status(201).send({
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
        workspace,
      },
    });
  });

  // POST /auth/login
  app.post("/auth/login", async (req, reply) => {
    const body = LoginSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Invalid input" });
    }

    const { email, password } = body.data;
    const emailLower = email.toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    // Create session
    const token = generateToken();
    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt: sessionExpiry(),
      userAgent: req.headers["user-agent"] ?? null,
      ipAddress: req.ip,
    });

    // Get primary workspace
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.id))
      .limit(1);

    return reply.send({
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
        workspace,
      },
    });
  });

  // POST /auth/logout
  app.post("/auth/logout", async (req, reply) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    return reply.send({ success: true });
  });

  // GET /auth/me
  app.get("/auth/me", async (req, reply) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session || session.expiresAt < new Date()) {
      return reply.status(401).send({ error: "Session expired or invalid" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Update lastSeenAt
    await db
      .update(sessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(sessions.token, token));

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.id))
      .limit(1);

    return reply.send({
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
        workspace,
      },
    });
  });
}

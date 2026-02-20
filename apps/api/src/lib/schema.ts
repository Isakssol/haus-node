import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum("plan", [
  "free",
  "starter",
  "pro",
  "team",
  "enterprise",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "editor",
  "viewer",
]);

// ─── Workspaces ───────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: planEnum("plan").notNull().default("free"),
  credits: integer("credits").notNull().default(150),
  monthlyCredits: integer("monthly_credits").notNull().default(150),
  creditsResetAt: timestamp("credits_reset_at").notNull(),
  ownerId: text("owner_id").notNull(), // Clerk user ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Workspace Members ────────────────────────────────────────────────────────

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // Clerk user ID
    role: memberRoleEnum("role").notNull().default("editor"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [index("workspace_members_user_idx").on(t.userId)]
);

// ─── Workflows ────────────────────────────────────────────────────────────────

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull().default("Untitled Workflow"),
    description: text("description"),
    // Serialized React Flow graph
    nodes: jsonb("nodes").notNull().default("[]"),
    edges: jsonb("edges").notNull().default("[]"),
    isPublic: boolean("is_public").notNull().default(false),
    isTemplate: boolean("is_template").notNull().default(false),
    thumbnailUrl: text("thumbnail_url"),
    tags: text("tags").array().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("workflows_workspace_idx").on(t.workspaceId),
    index("workflows_owner_idx").on(t.ownerId),
  ]
);

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id").references(() => workflows.id, {
      onDelete: "set null",
    }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    status: jobStatusEnum("status").notNull().default("queued"),
    // Workflow snapshot at time of run
    workflowSnapshot: jsonb("workflow_snapshot").notNull(),
    // User-provided input overrides
    inputs: jsonb("inputs").notNull().default("{}"),
    // Generated outputs
    outputs: jsonb("outputs").notNull().default("[]"),
    creditsUsed: integer("credits_used").notNull().default(0),
    error: text("error"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("jobs_workspace_idx").on(t.workspaceId),
    index("jobs_user_idx").on(t.userId),
    index("jobs_status_idx").on(t.status),
  ]
);

// ─── Credit Transactions ──────────────────────────────────────────────────────

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    amount: integer("amount").notNull(), // negative = spent, positive = added
    reason: text("reason").notNull(),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("credit_tx_workspace_idx").on(t.workspaceId)]
);

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    type: text("type").notNull(), // "image" | "video" | "audio" | "3d"
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(), // S3/R2 key
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes"),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"), // seconds for video/audio
    metadata: jsonb("metadata").default("{}"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("assets_workspace_idx").on(t.workspaceId),
    index("assets_job_idx").on(t.jobId),
  ]
);

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(), // bcrypt hash of the key
    keyPrefix: text("key_prefix").notNull(), // first 8 chars for display
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("api_keys_workspace_idx").on(t.workspaceId)]
);

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Asset = typeof assets.$inferSelect;

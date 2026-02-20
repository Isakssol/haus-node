import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";

import { workflowRoutes } from "./routes/workflows.js";
import { jobRoutes } from "./routes/jobs.js";
import { nodeRoutes } from "./routes/nodes.js";
import { workspaceRoutes } from "./routes/workspaces.js";
import { wsRoutes } from "./routes/ws.js";
import { uploadRoutes } from "./routes/uploads.js";
import { createJobWorker } from "./workers/job.worker.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "info",
  },
});

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(fastifyCors, {
  origin: [
    process.env.APP_URL ?? "http://localhost:3000",
    "http://localhost:3000",
  ],
  credentials: true,
});

await app.register(fastifyWebsocket);

await app.register(fastifyMultipart, {
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

await app.register(fastifyRateLimit, {
  max: 200,
  timeWindow: "1 minute",
});

// ─── Auth middleware (dev bypass) ─────────────────────────────────────────────
// In production, replace with: await app.register(clerkPlugin)
app.addHook("preHandler", async (req) => {
  if (process.env.NODE_ENV !== "production") {
    (req as any).auth = { userId: "dev-user-001" };
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────

await app.register(wsRoutes);

await app.register(async (api) => {
  await api.register(workspaceRoutes);
  await api.register(workflowRoutes);
  await api.register(jobRoutes);
  await api.register(nodeRoutes);
  await api.register(uploadRoutes, { prefix: "/uploads" });
}, { prefix: "/api/v1" });

// Health check
app.get("/health", async () => ({
  status: "ok",
  version: "0.1.0",
  timestamp: new Date().toISOString(),
}));

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001);

try {
  // Start job worker
  const worker = createJobWorker();
  app.log.info("Job worker started");

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`haus-node API running on http://localhost:${PORT}`);

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    app.log.info("SIGTERM received, shutting down...");
    await worker.close();
    await app.close();
    process.exit(0);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

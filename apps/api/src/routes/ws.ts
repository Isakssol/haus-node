import type { FastifyInstance } from "fastify";
import { createRedis } from "../lib/redis.js";

/**
 * WebSocket route: /ws/jobs/:jobId
 *
 * Clients connect and receive real-time job status updates.
 * The worker broadcasts events to Redis pub/sub channel `job:<jobId>`,
 * and this handler subscribes and forwards to the WebSocket client.
 */
export async function wsRoutes(app: FastifyInstance) {
  app.get("/ws/jobs/:jobId", { websocket: true }, async (socket, req) => {
    const { jobId } = req.params as { jobId: string };
    const channel = `job:${jobId}`;

    // Create a dedicated subscriber connection
    const subscriber = createRedis();
    await subscriber.subscribe(channel);

    subscriber.on("message", (_chan: string, message: string) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    });

    // Send initial ping
    socket.send(
      JSON.stringify({
        event: "ping",
        payload: { jobId },
        timestamp: new Date().toISOString(),
      })
    );

    socket.on("close", async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    });

    socket.on("error", async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    });
  });
}

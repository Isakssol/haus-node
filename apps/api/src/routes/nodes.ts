import type { FastifyInstance } from "fastify";
import { ALL_NODES, CATEGORY_META, getNodesByCategory } from "@haus-node/node-registry";

export async function nodeRoutes(app: FastifyInstance) {
  // Get all node definitions
  app.get("/nodes", async () => {
    return {
      data: ALL_NODES,
      categories: CATEGORY_META,
      total: ALL_NODES.length,
    };
  });

  // Get nodes by category
  app.get("/nodes/category/:category", async (req, reply) => {
    const { category } = req.params as { category: string };
    const nodes = getNodesByCategory(category as any);
    return { data: nodes };
  });

  // Get single node definition
  app.get("/nodes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const node = ALL_NODES.find((n) => n.id === id);
    if (!node) return reply.status(404).send({ error: "Node not found" });
    return { data: node };
  });
}

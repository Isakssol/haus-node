import type { FastifyInstance } from "fastify";
import { uploadFile, getPresignedUploadUrl } from "../lib/storage.js";

/**
 * POST /api/v1/uploads/presigned
 * Returns a pre-signed S3/R2 URL so the browser can upload directly.
 * Body: { contentType: string; folder?: string }
 */
async function presignedRoute(app: FastifyInstance) {
  app.post<{
    Body: { contentType: string; folder?: string };
  }>("/presigned", {
    schema: {
      body: {
        type: "object",
        required: ["contentType"],
        properties: {
          contentType: { type: "string" },
          folder:      { type: "string" },
        },
      },
    },
  }, async (req, reply) => {
    const { contentType, folder = "user-uploads" } = req.body;
    const result = await getPresignedUploadUrl(folder, contentType);
    return reply.send(result);
  });
}

/**
 * POST /api/v1/uploads/direct
 * Accepts a multipart file upload and stores it server-side.
 * Useful as a fallback when presigned URLs are not accessible (CORS, MinIO dev).
 */
async function directRoute(app: FastifyInstance) {
  app.post("/direct", async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ error: "No file provided" });
    }

    const buffer = await data.toBuffer();
    const contentType = data.mimetype || "application/octet-stream";

    const result = await uploadFile(buffer, {
      folder: "user-uploads",
      filename: data.filename,
      contentType,
    });

    return reply.send({ publicUrl: result.url, key: result.key });
  });
}

export async function uploadRoutes(app: FastifyInstance) {
  await app.register(presignedRoute);
  await app.register(directRoute);
}

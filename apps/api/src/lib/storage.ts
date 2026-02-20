import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  // Required for MinIO and other S3-compatible stores — prevents the SDK
  // from prepending the bucket name as a subdomain (bucket.localhost → 404).
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;
const PUBLIC_URL = process.env.S3_PUBLIC_URL!;

export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType: string;
}

/**
 * Upload a file buffer to S3/R2 and return the public URL + storage key
 */
export async function uploadFile(
  buffer: Buffer,
  opts: UploadOptions
): Promise<{ url: string; key: string }> {
  const ext = opts.contentType.split("/")[1] ?? "bin";
  const key = `${opts.folder ?? "uploads"}/${nanoid()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: opts.contentType,
      CacheControl: "public, max-age=31536000",
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  };
}

/**
 * Download a remote URL and re-upload it to our storage.
 * In development (when S3_ENDPOINT points to localhost), falls back to
 * returning the original remote URL if the S3 upload fails so the app
 * works without a running MinIO instance.
 */
export async function mirrorUrl(
  remoteUrl: string,
  opts: Omit<UploadOptions, "contentType"> & { contentType?: string }
): Promise<{ url: string; key: string }> {
  // Always attempt the upload, but fall back to the original URL on any error.
  // This means dev environments without MinIO/S3 still work — images are served
  // directly from the provider (fal.ai, etc.) instead of our own storage.
  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${remoteUrl}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType =
      opts.contentType ??
      response.headers.get("content-type") ??
      "application/octet-stream";
    return await uploadFile(buffer, { ...opts, contentType });
  } catch (err) {
    console.warn("[storage] mirrorUrl failed, using original URL:", (err as Error).message);
    return { url: remoteUrl, key: "" };
  }
}

/**
 * Generate a pre-signed upload URL for direct client uploads
 */
export async function getPresignedUploadUrl(
  folder: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const ext = contentType.split("/")[1] ?? "bin";
  const key = `${folder}/${nanoid()}.${ext}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 3600 }
  );

  return {
    uploadUrl,
    key,
    publicUrl: `${PUBLIC_URL}/${key}`,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

import type { NodeDefinition } from "@haus-node/types";
import { imageGenNodes } from "./nodes/image-gen.js";
import { videoGenNodes } from "./nodes/video-gen.js";
import { imageEditNodes } from "./nodes/image-edit.js";
import { helperNodes } from "./nodes/helper.js";

// ─── Full Registry ────────────────────────────────────────────────────────────

export const ALL_NODES: NodeDefinition[] = [
  ...imageGenNodes,
  ...videoGenNodes,
  ...imageEditNodes,
  ...helperNodes,
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const NODE_MAP = new Map<string, NodeDefinition>(
  ALL_NODES.map((n) => [n.id, n])
);

export function getNode(id: string): NodeDefinition | undefined {
  return NODE_MAP.get(id);
}

export function getNodesByCategory(category: NodeDefinition["category"]): NodeDefinition[] {
  return ALL_NODES.filter((n) => n.category === category);
}

// ─── Category metadata ────────────────────────────────────────────────────────

export const CATEGORY_META = {
  "image-gen": { label: "Image Generation", icon: "🖼️", order: 1 },
  "video-gen": { label: "Video Generation", icon: "🎬", order: 2 },
  "image-edit": { label: "Image Editing", icon: "✂️", order: 3 },
  "video-edit": { label: "Video Editing", icon: "🎞️", order: 4 },
  audio: { label: "Audio", icon: "🎵", order: 5 },
  "3d": { label: "3D", icon: "🧊", order: 6 },
  lipsync: { label: "Lip Sync", icon: "💬", order: 7 },
  vector: { label: "Vector / SVG", icon: "✦", order: 8 },
  text: { label: "Text & LLM", icon: "📝", order: 9 },
  data: { label: "Data", icon: "⚙️", order: 10 },
  helper: { label: "Helper", icon: "🔧", order: 11 },
} as const;

// Re-exports
export { imageGenNodes, videoGenNodes, imageEditNodes, helperNodes };
export type { NodeDefinition };

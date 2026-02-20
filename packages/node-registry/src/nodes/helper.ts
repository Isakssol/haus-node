import type { NodeDefinition } from "@haus-node/types";

export const helperNodes: NodeDefinition[] = [
  // ── Text Input ────────────────────────────────────────────────────────────
  {
    id: "text-input",
    label: "Text",
    description: "A text value to use as input to other nodes",
    category: "data",
    color: "#374151",
    inputs: [],
    outputs: [
      { id: "text", label: "Text", type: "text" },
    ],
    parameters: [
      {
        id: "value",
        label: "Text",
        type: "text",
        multiline: true,
        placeholder: "Enter text...",
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/text",
    tags: ["helper", "input"],
  },

  // ── Number Input ──────────────────────────────────────────────────────────
  {
    id: "number-input",
    label: "Number",
    description: "A numeric value",
    category: "data",
    color: "#374151",
    inputs: [],
    outputs: [
      { id: "number", label: "Number", type: "number" },
    ],
    parameters: [
      {
        id: "value",
        label: "Value",
        type: "number",
        default: 0,
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/number",
    tags: ["helper", "input"],
  },

  // ── Seed Input ────────────────────────────────────────────────────────────
  {
    id: "seed-input",
    label: "Seed",
    description: "A seed value for reproducible generation",
    category: "data",
    color: "#374151",
    inputs: [],
    outputs: [
      { id: "seed", label: "Seed", type: "seed" },
    ],
    parameters: [
      {
        id: "value",
        label: "Seed (-1 = random)",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/seed",
    tags: ["helper", "seed"],
  },

  // ── Import (File / URL) ───────────────────────────────────────────────────
  {
    id: "import",
    label: "Import",
    description: "Import an image, video or audio from file or URL",
    category: "helper",
    color: "#1F2937",
    inputs: [],
    outputs: [
      { id: "image", label: "Image", type: "image" },
      { id: "video", label: "Video", type: "video" },
      { id: "audio", label: "Audio", type: "audio" },
    ],
    parameters: [
      {
        id: "url",
        label: "File or URL",
        type: "file",
        accept: "image/*,video/*,audio/*",
        placeholder: "https://...",
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/import",
    tags: ["helper", "import", "input"],
  },

  // ── Export ────────────────────────────────────────────────────────────────
  {
    id: "export",
    label: "Export",
    description: "Export/download the final output",
    category: "helper",
    color: "#1F2937",
    inputs: [
      { id: "image", label: "Image", type: "image", required: false },
      { id: "video", label: "Video", type: "video", required: false },
      { id: "audio", label: "Audio", type: "audio", required: false },
    ],
    outputs: [],
    parameters: [
      {
        id: "filename",
        label: "Filename",
        type: "text",
        placeholder: "output",
      },
      {
        id: "format",
        label: "Format",
        type: "select",
        default: "png",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPEG", value: "jpg" },
          { label: "WebP", value: "webp" },
          { label: "MP4", value: "mp4" },
        ],
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/export",
    tags: ["helper", "export", "output"],
  },

  // ── Preview ───────────────────────────────────────────────────────────────
  {
    id: "preview",
    label: "Preview",
    description: "Preview any media inline on the canvas",
    category: "helper",
    color: "#111827",
    inputs: [
      { id: "media", label: "Media", type: "any", required: true },
    ],
    // "media" output allows the worker to call mergeNodeOutput → frontend renders it
    outputs: [
      { id: "media", label: "Preview", type: "any" },
    ],
    parameters: [],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/preview",
    tags: ["helper", "preview"],
  },

  // ── Prompt Enhancer ───────────────────────────────────────────────────────
  {
    id: "prompt-enhancer",
    label: "Prompt Enhancer",
    description: "Use GPT-4o to improve and expand a prompt",
    category: "text",
    color: "#065F46",
    inputs: [
      { id: "text", label: "Raw Prompt", type: "text", required: true },
    ],
    outputs: [
      { id: "text", label: "Enhanced Prompt", type: "text" },
    ],
    parameters: [
      {
        id: "style",
        label: "Enhancement Style",
        type: "select",
        default: "detailed",
        options: [
          { label: "Detailed", value: "detailed" },
          { label: "Cinematic", value: "cinematic" },
          { label: "Artistic", value: "artistic" },
          { label: "Photography", value: "photography" },
          { label: "Minimal", value: "minimal" },
        ],
      },
    ],
    creditCost: 1,
    provider: "openai",
    providerModel: "gpt-4o-mini",
    tags: ["text", "prompt", "llm"],
  },

  // ── Image Describer ───────────────────────────────────────────────────────
  {
    id: "image-describer",
    label: "Image Describer",
    description: "Generate a text description of an image using GPT-4o Vision",
    category: "text",
    color: "#064E3B",
    inputs: [
      { id: "image", label: "Image", type: "image", required: true },
    ],
    outputs: [
      { id: "text", label: "Description", type: "text" },
    ],
    parameters: [
      {
        id: "style",
        label: "Description Style",
        type: "select",
        default: "prompt",
        options: [
          { label: "As image prompt", value: "prompt" },
          { label: "Descriptive", value: "descriptive" },
          { label: "Technical", value: "technical" },
        ],
      },
    ],
    creditCost: 2,
    provider: "openai",
    providerModel: "gpt-4o",
    tags: ["text", "vision", "llm"],
  },

  // ── Text Iterator ─────────────────────────────────────────────────────────
  {
    id: "text-iterator",
    label: "Text Iterator",
    description: "Batch run a workflow for each item in a text list",
    category: "data",
    color: "#1E3A5F",
    inputs: [],
    outputs: [
      { id: "text", label: "Current Text", type: "text" },
    ],
    parameters: [
      {
        id: "items",
        label: "Items (one per line)",
        type: "text",
        multiline: true,
        placeholder: "a cat in space\na dog on the moon\na robot in a forest",
      },
    ],
    creditCost: 0,
    provider: "internal",
    providerModel: "internal/text-iterator",
    tags: ["iterator", "batch", "data"],
  },
];

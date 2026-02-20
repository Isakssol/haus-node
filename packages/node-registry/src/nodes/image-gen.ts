import type { NodeDefinition } from "@haus-node/types";

export const imageGenNodes: NodeDefinition[] = [
  // ── Flux Pro ──────────────────────────────────────────────────────────────
  {
    id: "flux-pro",
    label: "Flux Pro",
    description: "High-quality image generation with Flux Pro 1.1",
    category: "image-gen",
    color: "#7C3AED",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image you want to create...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
        placeholder: "What to avoid in the image...",
      },
      {
        id: "image_size",
        label: "Image Size",
        type: "select",
        default: "landscape_4_3",
        options: [
          { label: "Square (1:1)", value: "square" },
          { label: "Square HD", value: "square_hd" },
          { label: "Portrait 3:4", value: "portrait_4_3" },
          { label: "Portrait 9:16", value: "portrait_16_9" },
          { label: "Landscape 4:3", value: "landscape_4_3" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
        ],
      },
      {
        id: "num_inference_steps",
        label: "Steps",
        type: "slider",
        default: 28,
        min: 1,
        max: 50,
        step: 1,
      },
      {
        id: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 3.5,
        min: 1,
        max: 20,
        step: 0.5,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
        description: "-1 for random",
      },
      {
        id: "num_images",
        label: "Number of Images",
        type: "select",
        default: "1",
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "4", value: "4" },
        ],
      },
    ],
    creditCost: 4,
    provider: "fal",
    providerModel: "fal-ai/flux-pro/v1.1",
    tags: ["flux", "text-to-image", "premium"],
  },

  // ── Flux Dev ──────────────────────────────────────────────────────────────
  {
    id: "flux-dev",
    label: "Flux Dev",
    description: "Fast image generation with Flux Dev — great for iteration",
    category: "image-gen",
    color: "#6D28D9",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Reference Image", type: "image", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image...",
      },
      {
        id: "image_size",
        label: "Image Size",
        type: "select",
        default: "landscape_4_3",
        options: [
          { label: "Square (1:1)", value: "square" },
          { label: "Square HD", value: "square_hd" },
          { label: "Portrait 3:4", value: "portrait_4_3" },
          { label: "Landscape 4:3", value: "landscape_4_3" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
        ],
      },
      {
        id: "num_inference_steps",
        label: "Steps",
        type: "slider",
        default: 28,
        min: 1,
        max: 50,
      },
      {
        id: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 3.5,
        min: 1,
        max: 20,
        step: 0.5,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 2,
    provider: "fal",
    providerModel: "fal-ai/flux/dev",
    tags: ["flux", "text-to-image", "fast"],
  },

  // ── Flux Schnell ──────────────────────────────────────────────────────────
  {
    id: "flux-schnell",
    label: "Flux Schnell",
    description: "Ultra-fast image generation — best for prototyping",
    category: "image-gen",
    color: "#5B21B6",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image...",
      },
      {
        id: "image_size",
        label: "Image Size",
        type: "select",
        default: "landscape_4_3",
        options: [
          { label: "Square (1:1)", value: "square" },
          { label: "Landscape 4:3", value: "landscape_4_3" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
          { label: "Portrait 3:4", value: "portrait_4_3" },
        ],
      },
      {
        id: "num_inference_steps",
        label: "Steps",
        type: "slider",
        default: 4,
        min: 1,
        max: 12,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
      {
        id: "num_images",
        label: "Number of Images",
        type: "select",
        default: "1",
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "4", value: "4" },
        ],
      },
    ],
    creditCost: 1,
    provider: "fal",
    providerModel: "fal-ai/flux/schnell",
    tags: ["flux", "text-to-image", "fast", "cheap"],
  },

  // ── Ideogram V3 ───────────────────────────────────────────────────────────
  {
    id: "ideogram-v3",
    label: "Ideogram V3",
    description: "Best-in-class text rendering in images",
    category: "image-gen",
    color: "#DC2626",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe your image, include text you want rendered...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "image_size",
        label: "Image Size",
        type: "select",
        default: "square_hd",
        options: [
          { label: "Square HD (1:1)", value: "square_hd" },
          { label: "Square (1:1)", value: "square" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
          { label: "Landscape 4:3", value: "landscape_4_3" },
          { label: "Portrait 9:16", value: "portrait_16_9" },
          { label: "Portrait 3:4", value: "portrait_4_3" },
        ],
      },
      {
        id: "style",
        label: "Style",
        type: "select",
        default: "AUTO",
        options: [
          { label: "Auto", value: "AUTO" },
          { label: "General", value: "GENERAL" },
          { label: "Realistic", value: "REALISTIC" },
          { label: "Design", value: "DESIGN" },
        ],
      },
      {
        id: "rendering_speed",
        label: "Quality",
        type: "select",
        default: "BALANCED",
        options: [
          { label: "Turbo (fast)", value: "TURBO" },
          { label: "Balanced", value: "BALANCED" },
          { label: "Quality (best)", value: "QUALITY" },
        ],
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 6,
    provider: "fal",
    providerModel: "fal-ai/ideogram/v3",
    tags: ["ideogram", "text-rendering", "design"],
  },

  // ── DALL-E 3 ──────────────────────────────────────────────────────────────
  {
    id: "dalle-3",
    label: "DALL·E 3",
    description: "OpenAI's DALL-E 3 — follows prompts extremely well",
    category: "image-gen",
    color: "#059669",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image...",
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        default: "1024x1024",
        options: [
          { label: "1024×1024 (Square)", value: "1024x1024" },
          { label: "1792×1024 (Landscape)", value: "1792x1024" },
          { label: "1024×1792 (Portrait)", value: "1024x1792" },
        ],
      },
      {
        id: "quality",
        label: "Quality",
        type: "select",
        default: "standard",
        options: [
          { label: "Standard", value: "standard" },
          { label: "HD", value: "hd" },
        ],
      },
      {
        id: "style",
        label: "Style",
        type: "select",
        default: "vivid",
        options: [
          { label: "Vivid", value: "vivid" },
          { label: "Natural", value: "natural" },
        ],
      },
    ],
    creditCost: 8,
    provider: "openai",
    providerModel: "dall-e-3",
    tags: ["openai", "text-to-image"],
  },

  // ── Recraft V3 ────────────────────────────────────────────────────────────
  {
    id: "recraft-v3",
    label: "Recraft V3",
    description: "State-of-the-art image generation with style control",
    category: "image-gen",
    color: "#0891B2",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
      },
      {
        id: "style",
        label: "Style",
        type: "select",
        default: "realistic_image",
        options: [
          { label: "Realistic Image", value: "realistic_image" },
          { label: "Digital Illustration", value: "digital_illustration" },
          { label: "Vector Illustration", value: "vector_illustration" },
          { label: "Realistic Image (B&W)", value: "realistic_image/b_and_w" },
          { label: "Realistic Image (Hard Flash)", value: "realistic_image/hard_flash" },
        ],
      },
      {
        id: "image_size",
        label: "Image Size",
        type: "select",
        default: "landscape_16_9",
        options: [
          { label: "Square HD (1:1)", value: "square_hd" },
          { label: "Square (1:1)", value: "square" },
          { label: "Landscape 16:9", value: "landscape_16_9" },
          { label: "Landscape 4:3", value: "landscape_4_3" },
          { label: "Portrait 9:16", value: "portrait_16_9" },
          { label: "Portrait 3:4", value: "portrait_4_3" },
        ],
      },
    ],
    creditCost: 4,
    provider: "fal",
    providerModel: "fal-ai/recraft-v3",
    tags: ["recraft", "text-to-image", "style"],
  },

  // ── Imagen 4 Flash (Nano Banana) ──────────────────────────────────────────
  {
    id: "imagen-4-flash",
    label: "Imagen 4 Flash",
    description: "Google Imagen 4 — fast, high-quality image generation via Gemini API",
    category: "image-gen",
    color: "#1A73E8",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image you want to generate...",
      },
      {
        id: "aspectRatio",
        label: "Aspect Ratio",
        type: "select",
        default: "1:1",
        options: [
          { label: "Square (1:1)", value: "1:1" },
          { label: "Landscape (16:9)", value: "16:9" },
          { label: "Portrait (9:16)", value: "9:16" },
          { label: "Landscape (4:3)", value: "4:3" },
          { label: "Portrait (3:4)", value: "3:4" },
        ],
      },
      {
        id: "sampleCount",
        label: "Number of Images",
        type: "select",
        default: "1",
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "4", value: "4" },
        ],
      },
    ],
    creditCost: 3,
    provider: "gemini",
    providerModel: "imagen-4.0-fast-generate-001",
    tags: ["imagen", "google", "gemini", "text-to-image", "fast"],
  },

  // ── Imagen 4 (Standard, Nano Banana) ──────────────────────────────────────
  {
    id: "imagen-4",
    label: "Imagen 4",
    description: "Google Imagen 4 — premium quality image generation via Gemini API",
    category: "image-gen",
    color: "#1565C0",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", label: "Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the image you want to generate...",
      },
      {
        id: "aspectRatio",
        label: "Aspect Ratio",
        type: "select",
        default: "1:1",
        options: [
          { label: "Square (1:1)", value: "1:1" },
          { label: "Landscape (16:9)", value: "16:9" },
          { label: "Portrait (9:16)", value: "9:16" },
          { label: "Landscape (4:3)", value: "4:3" },
          { label: "Portrait (3:4)", value: "3:4" },
        ],
      },
      {
        id: "sampleCount",
        label: "Number of Images",
        type: "select",
        default: "1",
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "4", value: "4" },
        ],
      },
    ],
    creditCost: 5,
    provider: "gemini",
    providerModel: "imagen-4.0-generate-001",
    tags: ["imagen", "google", "gemini", "text-to-image", "premium"],
  },
];

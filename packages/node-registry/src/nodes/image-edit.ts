import type { NodeDefinition } from "@haus-node/types";

export const imageEditNodes: NodeDefinition[] = [
  // ── Background Remover ────────────────────────────────────────────────────
  {
    id: "background-remover",
    label: "Background Remover",
    description: "Remove background from images with AI precision",
    category: "image-edit",
    color: "#0369A1",
    inputs: [
      { id: "image", label: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image", label: "Image (no bg)", type: "image" },
    ],
    parameters: [
      {
        id: "model",
        label: "Model",
        type: "select",
        default: "bria",
        options: [
          { label: "Bria RMBG (Best Quality)", value: "bria" },
          { label: "BiRefNet (Fast)", value: "birefnet" },
        ],
      },
    ],
    creditCost: 2,
    provider: "fal",
    providerModel: "fal-ai/bria/background/remove",
    tags: ["background", "remove", "edit"],
  },

  // ── Image Upscaler ────────────────────────────────────────────────────────
  {
    id: "image-upscaler",
    label: "Image Upscaler",
    description: "Upscale images up to 4x with AI enhancement",
    category: "image-edit",
    color: "#0284C7",
    inputs: [
      { id: "image", label: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image", label: "Upscaled Image", type: "image" },
    ],
    parameters: [
      {
        id: "model",
        label: "Upscale Model",
        type: "select",
        default: "esrgan",
        options: [
          { label: "Real-ESRGAN (General)", value: "esrgan" },
          { label: "Real-ESRGAN (Anime)", value: "esrgan-anime" },
          { label: "Clarity Upscaler", value: "clarity" },
        ],
      },
      {
        id: "scale",
        label: "Scale Factor",
        type: "select",
        default: "2",
        options: [
          { label: "2x", value: "2" },
          { label: "4x", value: "4" },
        ],
      },
    ],
    creditCost: 3,
    provider: "fal",
    providerModel: "fal-ai/esrgan",
    tags: ["upscale", "enhance", "edit"],
  },

  // ── Inpainting ────────────────────────────────────────────────────────────
  {
    id: "inpainting",
    label: "Inpainting",
    description: "Fill masked regions of an image with AI-generated content",
    category: "image-edit",
    color: "#0891B2",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Input Image", type: "image", required: true },
      { id: "mask", label: "Mask", type: "image", required: true },
    ],
    outputs: [
      { id: "image", label: "Result Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "What to fill in the masked area...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "num_inference_steps",
        label: "Steps",
        type: "slider",
        default: 28,
        min: 10,
        max: 50,
      },
      {
        id: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 7.5,
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
    creditCost: 3,
    provider: "fal",
    providerModel: "fal-ai/flux/dev/image-to-image",
    tags: ["inpainting", "edit", "fill"],
  },

  // ── Outpainting ───────────────────────────────────────────────────────────
  {
    id: "outpainting",
    label: "Outpainting / Expand",
    description: "Extend the borders of an image with AI-generated content",
    category: "image-edit",
    color: "#0E7490",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image", label: "Expanded Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        placeholder: "Describe what to add beyond the edges...",
      },
      {
        id: "expand_left",
        label: "Expand Left (px)",
        type: "number",
        default: 256,
        min: 0,
        max: 1024,
      },
      {
        id: "expand_right",
        label: "Expand Right (px)",
        type: "number",
        default: 256,
        min: 0,
        max: 1024,
      },
      {
        id: "expand_top",
        label: "Expand Top (px)",
        type: "number",
        default: 0,
        min: 0,
        max: 1024,
      },
      {
        id: "expand_bottom",
        label: "Expand Bottom (px)",
        type: "number",
        default: 0,
        min: 0,
        max: 1024,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 4,
    provider: "fal",
    providerModel: "fal-ai/flux-lora/outpainting",
    tags: ["outpainting", "expand", "edit"],
  },

  // ── Image to Image ────────────────────────────────────────────────────────
  {
    id: "image-to-image",
    label: "Image to Image",
    description: "Transform an existing image guided by a prompt",
    category: "image-edit",
    color: "#1D4ED8",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image", label: "Output Image", type: "image" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the transformation...",
      },
      {
        id: "strength",
        label: "Strength",
        type: "slider",
        default: 0.75,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: "How much to change the image (0=same, 1=fully new)",
      },
      {
        id: "num_inference_steps",
        label: "Steps",
        type: "slider",
        default: 28,
        min: 10,
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
    creditCost: 3,
    provider: "fal",
    providerModel: "fal-ai/flux/dev/image-to-image",
    tags: ["img2img", "transform", "edit"],
  },
];

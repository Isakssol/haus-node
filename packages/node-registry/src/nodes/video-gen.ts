import type { NodeDefinition } from "@haus-node/types";

export const videoGenNodes: NodeDefinition[] = [
  // ── Kling v3 Standard T2V ─────────────────────────────────────────────────
  {
    id: "kling-v3",
    label: "Kling v3",
    description: "Latest Kling v3 — text to video with native audio generation",
    category: "video-gen",
    color: "#EA580C",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the video scene...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "duration",
        label: "Duration",
        type: "select",
        default: "5",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
        ],
      },
      {
        id: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        default: "16:9",
        options: [
          { label: "16:9 (Landscape)", value: "16:9" },
          { label: "9:16 (Portrait)", value: "9:16" },
          { label: "1:1 (Square)", value: "1:1" },
        ],
      },
      {
        id: "generate_audio",
        label: "Generate Audio",
        type: "boolean",
        default: false,
      },
      {
        id: "cfg_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
    creditCost: 40,
    provider: "fal",
    providerModel: "fal-ai/kling-video/v3/standard/text-to-video",
    tags: ["kling", "video", "text-to-video", "v3"],
  },

  // ── Kling v3 Image-to-Video ────────────────────────────────────────────────
  {
    id: "kling-v3-i2v",
    label: "Kling v3 (Image→Video)",
    description: "Latest Kling v3 — animate an image with native audio support",
    category: "video-gen",
    color: "#C2410C",
    inputs: [
      { id: "prompt", label: "Motion Prompt", type: "text", required: false },
      { id: "image", label: "Start Image", type: "image", required: true },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Motion Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe how the image should animate...",
      },
      {
        id: "duration",
        label: "Duration",
        type: "select",
        default: "5",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
        ],
      },
      {
        id: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        default: "16:9",
        options: [
          { label: "16:9 (Landscape)", value: "16:9" },
          { label: "9:16 (Portrait)", value: "9:16" },
          { label: "1:1 (Square)", value: "1:1" },
        ],
      },
      {
        id: "generate_audio",
        label: "Generate Audio",
        type: "boolean",
        default: false,
      },
      {
        id: "cfg_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
    creditCost: 40,
    provider: "fal",
    providerModel: "fal-ai/kling-video/v3/standard/image-to-video",
    tags: ["kling", "video", "image-to-video", "v3"],
  },

  // ── Kling 1.6 Standard T2V ────────────────────────────────────────────────
  {
    id: "kling-2-5",
    label: "Kling Standard",
    description: "High-quality video generation — text to video",
    category: "video-gen",
    color: "#EA580C",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Start Image", type: "image", required: false },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the video motion and scene...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "duration",
        label: "Duration",
        type: "select",
        default: "5",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
        ],
      },
      {
        id: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        default: "16:9",
        options: [
          { label: "16:9 (Landscape)", value: "16:9" },
          { label: "9:16 (Portrait)", value: "9:16" },
          { label: "1:1 (Square)", value: "1:1" },
        ],
      },
      {
        id: "cfg_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 40,
    provider: "fal",
    providerModel: "fal-ai/kling-video/v1.6/standard/text-to-video",
    tags: ["kling", "video", "text-to-video"],
  },

  // ── Kling 2.1 Image to Video ──────────────────────────────────────────────
  {
    id: "kling-2-5-i2v",
    label: "Kling (Image→Video)",
    description: "Animate a still image into a video with Kling 2.1",
    category: "video-gen",
    color: "#C2410C",
    inputs: [
      { id: "prompt", label: "Motion Prompt", type: "text", required: false },
      { id: "image", label: "Source Image", type: "image", required: true },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Motion Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe how the image should animate...",
      },
      {
        id: "duration",
        label: "Duration",
        type: "select",
        default: "5",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
        ],
      },
      {
        id: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        default: "16:9",
        options: [
          { label: "16:9 (Landscape)", value: "16:9" },
          { label: "9:16 (Portrait)", value: "9:16" },
          { label: "1:1 (Square)", value: "1:1" },
        ],
      },
      {
        id: "cfg_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
    creditCost: 40,
    provider: "fal",
    providerModel: "fal-ai/kling-video/v1.6/pro/image-to-video",
    tags: ["kling", "video", "image-to-video"],
  },

  // ── Kling Pro T2V ─────────────────────────────────────────────────────────
  {
    id: "kling-2-5-pro",
    label: "Kling Pro",
    description: "Highest-quality Kling video generation — pro tier",
    category: "video-gen",
    color: "#9A3412",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Reference Image", type: "image", required: false },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the video scene in detail...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "duration",
        label: "Duration",
        type: "select",
        default: "5",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
        ],
      },
      {
        id: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        default: "16:9",
        options: [
          { label: "16:9 (Landscape)", value: "16:9" },
          { label: "9:16 (Portrait)", value: "9:16" },
          { label: "1:1 (Square)", value: "1:1" },
        ],
      },
      {
        id: "cfg_scale",
        label: "Guidance Scale",
        type: "slider",
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
    creditCost: 50,
    provider: "fal",
    providerModel: "fal-ai/kling-video/v1.6/pro/text-to-video",
    tags: ["kling", "video", "text-to-video", "premium"],
  },

  // ── Wan 2.2 ───────────────────────────────────────────────────────────────
  {
    id: "wan-2-2",
    label: "Wan 2.2",
    description: "Cost-effective video generation by Alibaba",
    category: "video-gen",
    color: "#B45309",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Reference Image", type: "image", required: false },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the video...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "num_frames",
        label: "Duration (frames)",
        type: "select",
        default: "81",
        options: [
          { label: "~3 sec (81 frames)", value: "81" },
          { label: "~5 sec (121 frames)", value: "121" },
        ],
      },
      {
        id: "resolution",
        label: "Resolution",
        type: "select",
        default: "480p",
        options: [
          { label: "480p", value: "480p" },
          { label: "720p", value: "720p" },
        ],
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 24,
    provider: "fal",
    providerModel: "fal-ai/wan/v2.2-a14b/text-to-video",
    tags: ["wan", "video", "budget"],
  },

  // ── Wan 2.2 Image-to-Video ────────────────────────────────────────────────
  {
    id: "wan-2-2-i2v",
    label: "Wan 2.2 (Image→Video)",
    description: "Animate a still image into a video with Wan 2.2",
    category: "video-gen",
    color: "#92400E",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Source Image", type: "image", required: true },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
    ],
    parameters: [
      {
        id: "prompt",
        label: "Prompt",
        type: "text",
        multiline: true,
        required: true,
        placeholder: "Describe the motion and animation...",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
      },
      {
        id: "num_frames",
        label: "Duration (frames)",
        type: "select",
        default: "81",
        options: [
          { label: "~3 sec (81 frames)", value: "81" },
          { label: "~5 sec (121 frames)", value: "121" },
        ],
      },
      {
        id: "resolution",
        label: "Resolution",
        type: "select",
        default: "480p",
        options: [
          { label: "480p", value: "480p" },
          { label: "720p", value: "720p" },
        ],
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 24,
    provider: "fal",
    providerModel: "fal-ai/wan/v2.2-a14b/image-to-video",
    tags: ["wan", "video", "image-to-video"],
  },

  // ── LTX Video ─────────────────────────────────────────────────────────────
  {
    id: "ltx-video",
    label: "LTX Video",
    description: "Real-time capable video generation",
    category: "video-gen",
    color: "#7E22CE",
    inputs: [
      { id: "prompt", label: "Prompt", type: "text", required: false },
      { id: "image", label: "Start Image", type: "image", required: false },
    ],
    outputs: [
      { id: "video", label: "Video", type: "video" },
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
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        multiline: true,
        default: "worst quality, inconsistent motion, blurry, jittery",
      },
      {
        id: "num_frames",
        label: "Frames",
        type: "slider",
        default: 121,
        min: 25,
        max: 257,
        step: 8,
      },
      {
        id: "width",
        label: "Width",
        type: "number",
        default: 768,
      },
      {
        id: "height",
        label: "Height",
        type: "number",
        default: 512,
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
      },
    ],
    creditCost: 20,
    provider: "fal",
    providerModel: "fal-ai/ltx-video",
    tags: ["ltx", "video", "fast"],
  },
];

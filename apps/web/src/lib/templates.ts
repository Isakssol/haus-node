/**
 * Built-in professional workflow templates.
 * Each template defines nodes + edges that get loaded into the canvas.
 */

export interface TemplateNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    nodeDefId: string;
    label: string;
    parameters: Record<string, unknown>;
  };
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  previewGradient: string;
  estimatedCredits: number;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function n(
  id: string,
  nodeDefId: string,
  label: string,
  x: number,
  y: number,
  parameters: Record<string, unknown> = {}
): TemplateNode {
  return { id, type: "hausNode", position: { x, y }, data: { nodeDefId, label, parameters } };
}

function e(
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string
): TemplateEdge {
  return { id, source, target, sourceHandle, targetHandle };
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [

  // ── 1. Multi-Video Generator ────────────────────────────────────────────────
  // One prompt → three different video models running in parallel.
  // Compare Kling 2.5, Kling Pro and Wan 2.2 side by side in one run.
  {
    id: "multi-video-generator",
    name: "Multi-Video Generator",
    description: "One prompt → three video models running in parallel. Kling 2.5 standard, Kling Pro, and Wan 2.2 simultaneously. Compare quality, style and speed across all three in a single run.",
    category: "Video",
    tags: ["multi-video", "kling", "wan", "comparison", "parallel"],
    icon: "🎞️",
    previewGradient: "from-orange-600/20 to-red-500/20",
    estimatedCredits: 114,
    nodes: [
      n("text-1",   "text-input",      "Video Brief",      100, 340, { value: "A cinematic aerial shot of a dense jungle waterfall at golden hour, mist rising, birds flying" }),
      n("enh-1",    "prompt-enhancer", "Prompt Enhancer",  380, 340, { style: "cinematic" }),
      n("kling-1",  "kling-2-5",       "Kling 2.5 Std",    680, 120, { duration: "5", aspect_ratio: "16:9", cfg_scale: 0.5, seed: -1 }),
      n("kling-2",  "kling-2-5-pro",   "Kling Pro",        680, 340, { duration: "5", aspect_ratio: "16:9", cfg_scale: 0.5 }),
      n("wan-1",    "wan-2-2",         "Wan 2.2",          680, 560, { num_frames: "121", resolution: "720p", seed: -1 }),
      n("exp-1",    "export",          "Export A",         1020, 120, { filename: "kling-std", format: "mp4" }),
      n("exp-2",    "export",          "Export B",         1020, 340, { filename: "kling-pro", format: "mp4" }),
      n("exp-3",    "export",          "Export C",         1020, 560, { filename: "wan-result", format: "mp4" }),
    ],
    edges: [
      e("e1", "text-1",  "enh-1",   "text",  "text"),
      e("e2", "enh-1",   "kling-1", "text",  "prompt"),
      e("e3", "enh-1",   "kling-2", "text",  "prompt"),
      e("e4", "enh-1",   "wan-1",   "text",  "prompt"),
      e("e5", "kling-1", "exp-1",   "video", "video"),
      e("e6", "kling-2", "exp-2",   "video", "video"),
      e("e7", "wan-1",   "exp-3",   "video", "video"),
    ],
  },

  // ── 2. 4-Image Style Variants ───────────────────────────────────────────────
  // Generate 4 versions of the same subject in different artistic styles.
  // Realistic, cinematic, artistic and minimal — all from one brief.
  {
    id: "4-style-variants",
    name: "4 Image Style Variants",
    description: "Generate 4 versions of the same subject in different styles simultaneously — realistic photography, cinematic, artistic illustration, and minimal. Perfect for choosing direction.",
    category: "Creative",
    tags: ["variants", "style", "flux", "comparison", "multi-image"],
    icon: "🎨",
    previewGradient: "from-violet-600/20 to-purple-500/20",
    estimatedCredits: 5,
    nodes: [
      n("text-1",  "text-input",      "Subject Brief",  100, 360, { value: "A lone wolf standing on a snowy mountain peak at twilight" }),
      n("enh-r",   "prompt-enhancer", "→ Realistic",    380, 120, { style: "photography" }),
      n("enh-c",   "prompt-enhancer", "→ Cinematic",    380, 300, { style: "cinematic" }),
      n("enh-a",   "prompt-enhancer", "→ Artistic",     380, 480, { style: "artistic" }),
      n("enh-m",   "prompt-enhancer", "→ Minimal",      380, 660, { style: "minimal" }),
      n("flux-r",  "flux-schnell",    "Realistic",      680, 120, { image_size: "landscape_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("flux-c",  "flux-schnell",    "Cinematic",      680, 300, { image_size: "landscape_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("flux-a",  "flux-schnell",    "Artistic",       680, 480, { image_size: "landscape_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("flux-m",  "flux-schnell",    "Minimal",        680, 660, { image_size: "landscape_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("prev-r",  "preview",         "Realistic",      980, 120, {}),
      n("prev-c",  "preview",         "Cinematic",      980, 300, {}),
      n("prev-a",  "preview",         "Artistic",       980, 480, {}),
      n("prev-m",  "preview",         "Minimal",        980, 660, {}),
    ],
    edges: [
      e("e1", "text-1", "enh-r",  "text",  "text"),
      e("e2", "text-1", "enh-c",  "text",  "text"),
      e("e3", "text-1", "enh-a",  "text",  "text"),
      e("e4", "text-1", "enh-m",  "text",  "text"),
      e("e5", "enh-r",  "flux-r", "text",  "prompt"),
      e("e6", "enh-c",  "flux-c", "text",  "prompt"),
      e("e7", "enh-a",  "flux-a", "text",  "prompt"),
      e("e8", "enh-m",  "flux-m", "text",  "prompt"),
      e("e9",  "flux-r", "prev-r", "image", "media"),
      e("e10", "flux-c", "prev-c", "image", "media"),
      e("e11", "flux-a", "prev-a", "image", "media"),
      e("e12", "flux-m", "prev-m", "image", "media"),
    ],
  },

  // ── 3. Image → 3 Animated Videos ───────────────────────────────────────────
  // Take one generated image and animate it three different ways.
  // Three Kling I2V nodes, each with a different motion prompt.
  {
    id: "image-to-3-videos",
    name: "Image → 3 Motion Variants",
    description: "Generate a hero image with Flux Pro, then animate it three different ways with Kling I2V — slow cinematic, dramatic action, and subtle ambient. Three videos from one image.",
    category: "Video",
    tags: ["image-to-video", "kling", "animation", "variants", "flux"],
    icon: "🎬",
    previewGradient: "from-red-600/20 to-orange-500/20",
    estimatedCredits: 124,
    nodes: [
      n("text-1",   "text-input",      "Scene Brief",       100, 360, { value: "Futuristic Tokyo street at night, neon signs reflecting in rain puddles, lone figure with umbrella" }),
      n("enh-1",    "prompt-enhancer", "Prompt Enhancer",   380, 360, { style: "cinematic" }),
      n("flux-1",   "flux-pro",        "Generate Image",    660, 360, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("prev-1",   "preview",         "Source Image",      960, 160, {}),
      n("kling-a",  "kling-2-5-i2v",   "Slow & Cinematic",  960, 380, { prompt: "Slow cinematic dolly forward, rain falling gently, neon lights flickering", duration: "5", cfg_scale: 0.5 }),
      n("kling-b",  "kling-2-5-i2v",   "Dramatic Action",   960, 580, { prompt: "Camera rushes forward dramatically, wind blows strongly, figure starts walking away", duration: "5", cfg_scale: 0.7 }),
      n("kling-c",  "kling-2-5-i2v",   "Subtle Ambient",    960, 780, { prompt: "Gentle breathing motion, rain drops rippling in puddles, steam rising from vents", duration: "5", cfg_scale: 0.3 }),
      n("exp-a",    "export",          "Export A",         1280, 380, { filename: "cinematic", format: "mp4" }),
      n("exp-b",    "export",          "Export B",         1280, 580, { filename: "dramatic", format: "mp4" }),
      n("exp-c",    "export",          "Export C",         1280, 780, { filename: "ambient", format: "mp4" }),
    ],
    edges: [
      e("e1", "text-1",  "enh-1",    "text",  "text"),
      e("e2", "enh-1",   "flux-1",   "text",  "prompt"),
      e("e3", "flux-1",  "prev-1",   "image", "media"),
      e("e4", "flux-1",  "kling-a",  "image", "image"),
      e("e5", "flux-1",  "kling-b",  "image", "image"),
      e("e6", "flux-1",  "kling-c",  "image", "image"),
      e("e7", "kling-a", "exp-a",    "video", "video"),
      e("e8", "kling-b", "exp-b",    "video", "video"),
      e("e9", "kling-c", "exp-c",    "video", "video"),
    ],
  },

  // ── 4. Concept to Video (Text → Image → Video) ─────────────────────────────
  {
    id: "concept-to-video",
    name: "Concept to Video",
    description: "Full text-to-video pipeline: enhance your brief, generate a cinematic still with Flux Dev, then animate it into a video with Kling. The gold standard for AI content creation.",
    category: "Video",
    tags: ["text-to-video", "flux", "kling", "animation", "cinematic"],
    icon: "🚀",
    previewGradient: "from-violet-600/20 to-indigo-500/20",
    estimatedCredits: 44,
    nodes: [
      n("text-1",   "text-input",      "Creative Brief",   100, 300, { value: "A lone astronaut walking on a red Martian surface, dramatic sunset, dust storm approaching in the distance" }),
      n("enh-1",    "prompt-enhancer", "Prompt Enhancer",  380, 300, { style: "cinematic" }),
      n("flux-1",   "flux-dev",        "Flux Dev",         660, 300, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, seed: -1 }),
      n("prev-1",   "preview",         "Still Preview",    960, 120, {}),
      n("kling-1",  "kling-2-5-i2v",   "Kling I2V",        960, 380, { duration: "5", cfg_scale: 0.5 }),
      n("export-1", "export",          "Export Video",    1260, 380, { filename: "concept-video", format: "mp4" }),
    ],
    edges: [
      e("e1", "text-1",  "enh-1",   "text",  "text"),
      e("e2", "enh-1",   "flux-1",  "text",  "prompt"),
      e("e3", "flux-1",  "prev-1",  "image", "media"),
      e("e4", "flux-1",  "kling-1", "image", "image"),
      e("e5", "enh-1",   "kling-1", "text",  "prompt"),
      e("e6", "kling-1", "export-1","video", "video"),
    ],
  },

  // ── 5. Multi-Model Image Race ───────────────────────────────────────────────
  {
    id: "multi-model-race",
    name: "Multi-Model Image Race",
    description: "Run the same prompt through Flux Pro, Ideogram V3 and Recraft V3 simultaneously. Compare three industry-leading models side-by-side to find the best result for your use case.",
    category: "Creative",
    tags: ["comparison", "flux", "ideogram", "recraft", "multi-model"],
    icon: "⚡",
    previewGradient: "from-yellow-500/20 to-orange-500/20",
    estimatedCredits: 14,
    nodes: [
      n("text-1",  "text-input",      "Prompt",           100, 320, { value: "Futuristic city skyline at dusk, neon reflections on wet streets, cyberpunk atmosphere" }),
      n("enh-1",   "prompt-enhancer", "Prompt Enhancer",  360, 320, { style: "detailed" }),
      n("flux-1",  "flux-pro",        "Flux Pro",         640, 100, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("idea-1",  "ideogram-v3",     "Ideogram V3",      640, 300, { image_size: "landscape_16_9", style: "REALISTIC", rendering_speed: "BALANCED", seed: -1 }),
      n("rec-1",   "recraft-v3",      "Recraft V3",       640, 500, { style: "realistic_image" }),
      n("prev-1",  "preview",         "Flux Result",      960, 100, {}),
      n("prev-2",  "preview",         "Ideogram Result",  960, 300, {}),
      n("prev-3",  "preview",         "Recraft Result",   960, 500, {}),
    ],
    edges: [
      e("e1", "text-1", "enh-1",  "text",  "text"),
      e("e2", "enh-1",  "flux-1", "text",  "prompt"),
      e("e3", "enh-1",  "idea-1", "text",  "prompt"),
      e("e4", "enh-1",  "rec-1",  "text",  "prompt"),
      e("e5", "flux-1", "prev-1", "image", "media"),
      e("e6", "idea-1", "prev-2", "image", "media"),
      e("e7", "rec-1",  "prev-3", "image", "media"),
    ],
  },

  // ── 6. Full Production Pipeline ─────────────────────────────────────────────
  // The most complex template: brief → 3 image variants → upscale hero → animate.
  {
    id: "full-production-pipeline",
    name: "Full Production Pipeline",
    description: "The complete studio workflow: enhance a brief, generate 3 image variants with different models, upscale the hero shot 4×, use GPT-4o Vision to re-describe it, then animate with Kling.",
    category: "Creative",
    tags: ["production", "multi-model", "vision", "upscale", "animate", "full pipeline"],
    icon: "🏭",
    previewGradient: "from-slate-600/20 to-zinc-500/20",
    estimatedCredits: 55,
    nodes: [
      n("text-1",   "text-input",      "Creative Brief",    100, 400, { value: "Epic fantasy castle on a floating island, golden hour lighting, dramatic clouds" }),
      n("enh-1",    "prompt-enhancer", "Prompt Enhancer",   380, 400, { style: "cinematic" }),
      n("flux-1",   "flux-dev",        "Flux Dev",          660, 160, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, seed: -1 }),
      n("idea-1",   "ideogram-v3",     "Ideogram V3",       660, 380, { image_size: "landscape_16_9", style: "REALISTIC", rendering_speed: "BALANCED", seed: -1 }),
      n("rec-1",    "recraft-v3",      "Recraft V3",        660, 600, { style: "realistic_image" }),
      n("prev-a",   "preview",         "Flux Preview",      960, 160, {}),
      n("prev-b",   "preview",         "Ideogram Preview",  960, 380, {}),
      n("prev-c",   "preview",         "Recraft Preview",   960, 600, {}),
      n("up-1",     "image-upscaler",  "4× Upscale",       1260, 160, { scale: "4" }),
      n("desc-1",   "image-describer", "GPT-4o Vision",    1260, 380, { style: "prompt" }),
      n("enh-2",    "prompt-enhancer", "Enhance for Video",1540, 380, { style: "cinematic" }),
      n("kling-1",  "kling-2-5-i2v",   "Kling I2V",        1540, 160, { duration: "5", cfg_scale: 0.5 }),
      n("prev-hero","preview",         "Hero (Upscaled)",  1820, 160, {}),
      n("export-1", "export",          "Export Video",     1820, 380, { filename: "production", format: "mp4" }),
    ],
    edges: [
      e("e1",  "text-1",  "enh-1",   "text",  "text"),
      e("e2",  "enh-1",   "flux-1",  "text",  "prompt"),
      e("e3",  "enh-1",   "idea-1",  "text",  "prompt"),
      e("e4",  "enh-1",   "rec-1",   "text",  "prompt"),
      e("e5",  "flux-1",  "prev-a",  "image", "media"),
      e("e6",  "idea-1",  "prev-b",  "image", "media"),
      e("e7",  "rec-1",   "prev-c",  "image", "media"),
      e("e8",  "flux-1",  "up-1",    "image", "image"),
      e("e9",  "flux-1",  "desc-1",  "image", "image"),
      e("e10", "desc-1",  "enh-2",   "text",  "text"),
      e("e11", "up-1",    "kling-1", "image", "image"),
      e("e12", "enh-2",   "kling-1", "text",  "prompt"),
      e("e13", "up-1",    "prev-hero","image", "media"),
      e("e14", "kling-1", "export-1","video", "video"),
    ],
  },

  // ── 7. Brand Kit Generator ──────────────────────────────────────────────────
  {
    id: "brand-kit",
    name: "Brand Kit Generator",
    description: "One brief → complete brand kit. Ideogram V3 generates the logo, Flux Pro the landscape hero image, Recraft V3 the social portrait. All three assets in a single run.",
    category: "Branding",
    tags: ["brand", "logo", "hero", "social", "multi-format"],
    icon: "🏢",
    previewGradient: "from-pink-500/20 to-rose-600/20",
    estimatedCredits: 15,
    nodes: [
      n("text-1",  "text-input",      "Brand Brief",   100, 300, { value: "Luxury sustainable fashion brand, earth tones, minimalist, premium quality" }),
      n("enh-1",   "prompt-enhancer", "Prompt Enhancer",360, 300, { style: "detailed" }),
      n("logo-1",  "ideogram-v3",     "Logo (1:1)",    640, 100, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),
      n("hero-1",  "flux-pro",        "Hero (16:9)",   640, 300, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("social-1","recraft-v3",      "Social (9:16)", 640, 500, { style: "realistic_image" }),
      n("prev-1",  "preview",         "Logo",          960, 100, {}),
      n("prev-2",  "preview",         "Hero Image",    960, 300, {}),
      n("prev-3",  "preview",         "Social Post",   960, 500, {}),
    ],
    edges: [
      e("e1", "text-1",  "enh-1",   "text",  "text"),
      e("e2", "enh-1",   "logo-1",  "text",  "prompt"),
      e("e3", "enh-1",   "hero-1",  "text",  "prompt"),
      e("e4", "enh-1",   "social-1","text",  "prompt"),
      e("e5", "logo-1",  "prev-1",  "image", "media"),
      e("e6", "hero-1",  "prev-2",  "image", "media"),
      e("e7", "social-1","prev-3",  "image", "media"),
    ],
  },

  // ── 8. Social Media Content Pack ───────────────────────────────────────────
  {
    id: "social-media-pack",
    name: "Social Media Content Pack",
    description: "One campaign brief → three formats. Square for Instagram, portrait for Stories/Reels, landscape for LinkedIn/X. All generated simultaneously with Flux Schnell.",
    category: "Marketing",
    tags: ["social media", "instagram", "content", "flux", "multi-format"],
    icon: "📱",
    previewGradient: "from-rose-500/20 to-orange-400/20",
    estimatedCredits: 4,
    nodes: [
      n("text-1",  "text-input",      "Campaign Brief",   100, 280, { value: "Summer sale promotion, vibrant colors, lifestyle feel" }),
      n("enh-1",   "prompt-enhancer", "Prompt Enhancer",  360, 280, { style: "detailed" }),
      n("sq-1",    "flux-schnell",    "Square (1:1)",     640, 100, { image_size: "square",        num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("port-1",  "flux-schnell",    "Portrait (3:4)",   640, 280, { image_size: "portrait_4_3",  num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("land-1",  "flux-schnell",    "Landscape (16:9)", 640, 460, { image_size: "landscape_16_9",num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("prev-1",  "preview",         "Square",           940, 100, {}),
      n("prev-2",  "preview",         "Portrait",         940, 280, {}),
      n("prev-3",  "preview",         "Landscape",        940, 460, {}),
    ],
    edges: [
      e("e1", "text-1", "enh-1",  "text",  "text"),
      e("e2", "enh-1",  "sq-1",   "text",  "prompt"),
      e("e3", "enh-1",  "port-1", "text",  "prompt"),
      e("e4", "enh-1",  "land-1", "text",  "prompt"),
      e("e5", "sq-1",   "prev-1", "image", "media"),
      e("e6", "port-1", "prev-2", "image", "media"),
      e("e7", "land-1", "prev-3", "image", "media"),
    ],
  },

  // ── 9. Product Photography ──────────────────────────────────────────────────
  {
    id: "product-photography",
    name: "Product Photography",
    description: "Generate professional e-commerce product shots. Prompt Enhancer refines your brief into a polished studio-quality prompt, then Flux Pro renders the final image.",
    category: "E-Commerce",
    tags: ["product", "e-commerce", "photography", "flux"],
    icon: "📦",
    previewGradient: "from-blue-600/20 to-cyan-500/20",
    estimatedCredits: 5,
    nodes: [
      n("text-1",  "text-input",      "Product Brief",  100, 240, { value: "Red leather sneaker, white sole, studio white background, 3/4 angle view" }),
      n("enh-1",   "prompt-enhancer", "Prompt Enhancer",380, 240, { style: "photography" }),
      n("flux-1",  "flux-pro",        "Flux Pro",       680, 240, { image_size: "square", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("prev-1",  "preview",         "Preview",        980, 240, {}),
    ],
    edges: [
      e("e1", "text-1", "enh-1",  "text",  "text"),
      e("e2", "enh-1",  "flux-1", "text",  "prompt"),
      e("e3", "flux-1", "prev-1", "image", "media"),
    ],
  },

  // ── 10. Ad Creative A/B Factory ─────────────────────────────────────────────
  {
    id: "ad-creative-variations",
    name: "Ad Creative A/B Factory",
    description: "Four simultaneous DALL·E 3 generations from one brief — different sizes and styles. Instant A/B test material: square vivid, square natural, landscape, portrait.",
    category: "Marketing",
    tags: ["advertising", "A/B test", "variations", "dall-e"],
    icon: "📊",
    previewGradient: "from-fuchsia-500/20 to-purple-600/20",
    estimatedCredits: 32,
    nodes: [
      n("text-1",  "text-input", "Ad Brief",    100, 360, { value: "Premium coffee brand, warm morning light, minimalist lifestyle" }),
      n("dalle-1", "dalle-3",    "Variation A", 440, 100, { size: "1024x1024", quality: "standard", style: "vivid" }),
      n("dalle-2", "dalle-3",    "Variation B", 440, 280, { size: "1024x1024", quality: "standard", style: "natural" }),
      n("dalle-3", "dalle-3",    "Variation C", 440, 460, { size: "1792x1024", quality: "standard", style: "vivid" }),
      n("dalle-4", "dalle-3",    "Variation D", 440, 640, { size: "1024x1792", quality: "standard", style: "natural" }),
      n("prev-1",  "preview",    "Preview A",   800, 100, {}),
      n("prev-2",  "preview",    "Preview B",   800, 280, {}),
      n("prev-3",  "preview",    "Preview C",   800, 460, {}),
      n("prev-4",  "preview",    "Preview D",   800, 640, {}),
    ],
    edges: [
      e("e1", "text-1",  "dalle-1", "text",  "prompt"),
      e("e2", "text-1",  "dalle-2", "text",  "prompt"),
      e("e3", "text-1",  "dalle-3", "text",  "prompt"),
      e("e4", "text-1",  "dalle-4", "text",  "prompt"),
      e("e5", "dalle-1", "prev-1",  "image", "media"),
      e("e6", "dalle-2", "prev-2",  "image", "media"),
      e("e7", "dalle-3", "prev-3",  "image", "media"),
      e("e8", "dalle-4", "prev-4",  "image", "media"),
    ],
  },

  // ── 11. Image Remix & Animate ───────────────────────────────────────────────
  {
    id: "image-remix-animate",
    name: "Image Remix & Animate",
    description: "Import any photo, let GPT-4o Vision describe it, enhance the description into a new cinematic prompt, regenerate with Flux Dev, upscale 4×, then animate with Kling.",
    category: "Creative",
    tags: ["remix", "vision", "upscale", "animate", "kling", "flux"],
    icon: "🔄",
    previewGradient: "from-cyan-500/20 to-blue-600/20",
    estimatedCredits: 49,
    nodes: [
      n("import-1", "import",          "Source Image",    100, 300, { url: "" }),
      n("desc-1",   "image-describer", "GPT-4o Vision",   380, 300, { style: "prompt" }),
      n("enh-1",    "prompt-enhancer", "Prompt Enhancer", 660, 300, { style: "cinematic" }),
      n("flux-1",   "flux-dev",        "Flux Dev",        940, 300, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, seed: -1 }),
      n("up-1",     "image-upscaler",  "4× Upscale",     1220, 160, { scale: "4" }),
      n("kling-1",  "kling-2-5-i2v",   "Kling I2V",      1220, 420, { duration: "5", cfg_scale: 0.5 }),
      n("prev-1",   "preview",         "Upscaled Still", 1500, 160, {}),
      n("export-1", "export",          "Export Video",   1500, 420, { filename: "remix", format: "mp4" }),
    ],
    edges: [
      e("e1", "import-1", "desc-1",  "image", "image"),
      e("e2", "desc-1",   "enh-1",   "text",  "text"),
      e("e3", "enh-1",    "flux-1",  "text",  "prompt"),
      e("e4", "flux-1",   "up-1",    "image", "image"),
      e("e5", "flux-1",   "kling-1", "image", "image"),
      e("e6", "enh-1",    "kling-1", "text",  "prompt"),
      e("e7", "up-1",     "prev-1",  "image", "media"),
      e("e8", "kling-1",  "export-1","video", "video"),
    ],
  },

  // ── 12. Product Campaign Creator ───────────────────────────────────────────
  // Upload a product photo → GPT-4o Vision reads it → Prompt Enhancer polishes
  // the description → three Image-to-Image nodes re-render it in different
  // scenes (studio, lifestyle, premium dark) → each scene is animated into a
  // short promo video with Kling I2V.
  {
    id: "product-campaign-creator",
    name: "Product Campaign Creator",
    description: "Upload your product photo → GPT-4o reads it → generates 3 scene variants (studio, lifestyle, premium dark) → animates each into a short promo video. Full campaign from one image.",
    category: "E-Commerce",
    tags: ["product", "campaign", "image-to-video", "variants", "e-commerce", "kling"],
    icon: "🛍️",
    previewGradient: "from-emerald-600/20 to-teal-500/20",
    estimatedCredits: 135,
    nodes: [
      // ── Input ──
      n("import-1",  "import",          "Upload Product",    100, 460, { url: "" }),

      // ── Vision + Enhance ──
      n("desc-1",    "image-describer", "GPT-4o Vision",     380, 460, { style: "prompt" }),
      n("enh-1",     "prompt-enhancer", "Prompt Enhancer",   660, 460, { style: "photography" }),

      // ── 3 × Image-to-Image scene variants ──
      n("i2i-studio", "image-to-image", "Studio White",      960, 160, {
        prompt: "Product on a clean white studio background, professional lighting, sharp focus, e-commerce hero shot",
        strength: 0.55, num_inference_steps: 28, guidance_scale: 3.5, seed: -1,
      }),
      n("i2i-life",   "image-to-image", "Lifestyle Scene",   960, 420, {
        prompt: "Product placed in a warm lifestyle setting, natural light, aspirational mood, editorial photography",
        strength: 0.65, num_inference_steps: 28, guidance_scale: 3.5, seed: -1,
      }),
      n("i2i-dark",   "image-to-image", "Premium Dark",      960, 680, {
        prompt: "Product on a dark moody background, dramatic studio lighting, luxury brand aesthetic, high contrast",
        strength: 0.6, num_inference_steps: 28, guidance_scale: 3.5, seed: -1,
      }),

      // ── Previews for each variant ──
      n("prev-studio","preview",        "Studio Preview",   1260, 160, {}),
      n("prev-life",  "preview",        "Lifestyle Preview",1260, 420, {}),
      n("prev-dark",  "preview",        "Premium Preview",  1260, 680, {}),

      // ── Animate each variant into a promo video ──
      n("vid-studio", "kling-2-5-i2v",  "Studio Video",     1560, 160, {
        prompt: "Slow 360-degree product rotation, clean white background, smooth camera orbit, professional studio feel",
        duration: "5", cfg_scale: 0.5,
      }),
      n("vid-life",   "kling-2-5-i2v",  "Lifestyle Video",  1560, 420, {
        prompt: "Gentle camera pull-back reveal, warm natural light, subtle depth-of-field shift, lifestyle energy",
        duration: "5", cfg_scale: 0.5,
      }),
      n("vid-dark",   "kling-2-5-i2v",  "Premium Video",    1560, 680, {
        prompt: "Dramatic light sweep across the product, dark background, cinematic lens flare, luxury reveal",
        duration: "5", cfg_scale: 0.5,
      }),

      // ── Export all three videos ──
      n("exp-studio", "export",         "Export Studio",    1860, 160, { filename: "product-studio", format: "mp4" }),
      n("exp-life",   "export",         "Export Lifestyle", 1860, 420, { filename: "product-lifestyle", format: "mp4" }),
      n("exp-dark",   "export",         "Export Premium",   1860, 680, { filename: "product-premium", format: "mp4" }),
    ],
    edges: [
      // Upload → Vision → Enhance
      e("e1",  "import-1",   "desc-1",     "image", "image"),
      e("e2",  "desc-1",     "enh-1",      "text",  "text"),

      // Enhanced prompt → all three I2I nodes
      e("e3",  "enh-1",      "i2i-studio", "text",  "prompt"),
      e("e4",  "enh-1",      "i2i-life",   "text",  "prompt"),
      e("e5",  "enh-1",      "i2i-dark",   "text",  "prompt"),

      // Original product image → all three I2I nodes
      e("e6",  "import-1",   "i2i-studio", "image", "image"),
      e("e7",  "import-1",   "i2i-life",   "image", "image"),
      e("e8",  "import-1",   "i2i-dark",   "image", "image"),

      // I2I variants → previews
      e("e9",  "i2i-studio", "prev-studio","image", "media"),
      e("e10", "i2i-life",   "prev-life",  "image", "media"),
      e("e11", "i2i-dark",   "prev-dark",  "image", "media"),

      // I2I variants → Kling videos
      e("e12", "i2i-studio", "vid-studio", "image", "image"),
      e("e13", "i2i-life",   "vid-life",   "image", "image"),
      e("e14", "i2i-dark",   "vid-dark",   "image", "image"),

      // Videos → exports
      e("e15", "vid-studio", "exp-studio", "video", "video"),
      e("e16", "vid-life",   "exp-life",   "video", "video"),
      e("e17", "vid-dark",   "exp-dark",   "video", "video"),
    ],
  },

  // ── 13. Portrait Retouching Studio ──────────────────────────────────────────
  {
    id: "portrait-retouching",
    name: "Portrait Retouching Studio",
    description: "Import a photo, upscale it to 4× resolution AND remove the background simultaneously. Get a high-res retouched version and a clean cutout in one run.",
    category: "Photography",
    tags: ["portrait", "retouching", "upscale", "background removal"],
    icon: "👤",
    previewGradient: "from-sky-500/20 to-indigo-500/20",
    estimatedCredits: 5,
    nodes: [
      n("import-1", "import",             "Import Photo",   100, 260, { url: "" }),
      n("up-1",     "image-upscaler",     "4× Upscale",     400, 120, { scale: "4" }),
      n("bg-1",     "background-remover", "Remove BG",      400, 400, {}),
      n("prev-1",   "preview",            "Upscaled",       700, 120, {}),
      n("prev-2",   "preview",            "No Background",  700, 400, {}),
    ],
    edges: [
      e("e1", "import-1", "up-1",   "image", "image"),
      e("e2", "import-1", "bg-1",   "image", "image"),
      e("e3", "up-1",     "prev-1", "image", "media"),
      e("e4", "bg-1",     "prev-2", "image", "media"),
    ],
  },

  // ── 14. Brand Campaign Video ─────────────────────────────────────────────────
  // Upload client logo → GPT-4o reads brand identity → generates on-brand hero
  // image → animates into 3 social-format campaign videos.
  {
    id: "brand-campaign-video",
    name: "Brand Campaign Video",
    description: "Upload your client's logo → GPT-4o reads the brand identity → generates an on-brand hero image → animates into 3 social videos (16:9, 9:16, 1:1). One logo in, full campaign out.",
    category: "Branding",
    tags: ["brand", "campaign", "logo", "social video", "client", "kling"],
    icon: "🎯",
    previewGradient: "from-violet-600/20 to-pink-500/20",
    estimatedCredits: 140,
    nodes: [
      // Brand asset input
      n("logo-in",    "import",          "Upload Logo",         100, 360, { url: "" }),
      n("brief-1",    "text-input",      "Campaign Brief",      100, 560, { value: "Summer launch campaign, energetic and modern, target audience 18-35" }),

      // Vision reads the brand
      n("vision-1",   "image-describer", "Read Brand Identity", 380, 360, { style: "prompt" }),
      n("enh-1",      "prompt-enhancer", "Enhance for Brand",   660, 460, { style: "cinematic" }),

      // Generate hero image in brand style
      n("hero-1",     "flux-pro",        "Hero Image",          940, 460, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("prev-hero",  "preview",         "Hero Preview",       1220, 260, {}),

      // Animate into 3 formats
      n("vid-wide",   "kling-2-5-i2v",   "16:9 Campaign",      1220, 460, { prompt: "Smooth cinematic camera move, brand logo reveal, energetic and modern", duration: "5", cfg_scale: 0.5 }),
      n("vid-story",  "kling-2-5-i2v",   "9:16 Story",         1220, 660, { prompt: "Vertical mobile-native reveal, quick energetic motion, brand atmosphere", duration: "5", cfg_scale: 0.5 }),

      // Exports
      n("exp-wide",   "export",          "Export 16:9",        1520, 460, { filename: "campaign-16-9", format: "mp4" }),
      n("exp-story",  "export",          "Export 9:16",        1520, 660, { filename: "campaign-9-16", format: "mp4" }),
    ],
    edges: [
      e("e1",  "logo-in",  "vision-1",  "image", "image"),
      e("e2",  "vision-1", "enh-1",     "text",  "text"),
      e("e3",  "brief-1",  "enh-1",     "text",  "text"),
      e("e4",  "enh-1",    "hero-1",    "text",  "prompt"),
      e("e5",  "hero-1",   "prev-hero", "image", "media"),
      e("e6",  "hero-1",   "vid-wide",  "image", "image"),
      e("e7",  "hero-1",   "vid-story", "image", "image"),
      e("e8",  "enh-1",    "vid-wide",  "text",  "prompt"),
      e("e9",  "enh-1",    "vid-story", "text",  "prompt"),
      e("e10", "vid-wide",  "exp-wide",  "video", "video"),
      e("e11", "vid-story", "exp-story", "video", "video"),
    ],
  },

  // ── 15. Brand Consistency Pack ───────────────────────────────────────────────
  // Upload logo + write brand brief → generate logo on white, logo on dark,
  // brand hero image, and social square, all in one run.
  {
    id: "brand-consistency-pack",
    name: "Brand Consistency Pack",
    description: "Upload client logo + brand brief → generate 4 consistent brand assets: logo on white, logo on dark background, lifestyle hero, and a social square. One click, four deliverables.",
    category: "Branding",
    tags: ["brand", "consistency", "logo", "assets", "multi-format", "client"],
    icon: "🎨",
    previewGradient: "from-indigo-600/20 to-violet-500/20",
    estimatedCredits: 22,
    nodes: [
      n("logo-in",  "import",          "Upload Logo",         100, 280, { url: "" }),
      n("brief-1",  "text-input",      "Brand Brief",         100, 480, { value: "Luxury wellness brand. Calm, premium, natural. Sage green and warm cream palette." }),
      n("vision-1", "image-describer", "Read Logo",           380, 280, { style: "prompt" }),
      n("enh-1",    "prompt-enhancer", "Brand Prompt",        660, 380, { style: "detailed" }),

      // 4 outputs
      n("white-1",  "ideogram-v3",     "Logo – White BG",     940, 100, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),
      n("dark-1",   "ideogram-v3",     "Logo – Dark BG",      940, 300, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),
      n("hero-1",   "flux-pro",        "Hero Image",          940, 500, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: -1 }),
      n("social-1", "recraft-v3",      "Social Square",       940, 700, { style: "realistic_image" }),

      n("prev-1",   "preview",         "Logo White",         1240, 100, {}),
      n("prev-2",   "preview",         "Logo Dark",          1240, 300, {}),
      n("prev-3",   "preview",         "Hero",               1240, 500, {}),
      n("prev-4",   "preview",         "Social",             1240, 700, {}),
    ],
    edges: [
      e("e1",  "logo-in",  "vision-1", "image", "image"),
      e("e2",  "vision-1", "enh-1",    "text",  "text"),
      e("e3",  "brief-1",  "enh-1",    "text",  "text"),
      e("e4",  "enh-1",    "white-1",  "text",  "prompt"),
      e("e5",  "enh-1",    "dark-1",   "text",  "prompt"),
      e("e6",  "enh-1",    "hero-1",   "text",  "prompt"),
      e("e7",  "enh-1",    "social-1", "text",  "prompt"),
      e("e8",  "white-1",  "prev-1",   "image", "media"),
      e("e9",  "dark-1",   "prev-2",   "image", "media"),
      e("e10", "hero-1",   "prev-3",   "image", "media"),
      e("e11", "social-1", "prev-4",   "image", "media"),
    ],
  },

  // ── 16. Reels / Shorts Generator ─────────────────────────────────────────────
  // Brand brief + style reference → generate 3 vertical short-form video concepts.
  {
    id: "reels-shorts-generator",
    name: "Reels & Shorts Generator",
    description: "Write a brand brief and upload an optional reference image → generate 3 unique vertical (9:16) short-form video concepts with Kling, ready for Instagram Reels, TikTok and YouTube Shorts.",
    category: "Branding",
    tags: ["reels", "shorts", "tiktok", "instagram", "vertical", "brand", "social video"],
    icon: "📲",
    previewGradient: "from-rose-500/20 to-violet-600/20",
    estimatedCredits: 130,
    nodes: [
      n("brief-1",  "text-input",      "Brand / Scene Brief",  100, 240, { value: "Sports performance brand. Fast, athletic, urban. 3 different energy moods: explosive, focused, triumphant." }),
      n("ref-in",   "import",          "Style Reference (opt)",100, 460, { url: "" }),

      n("enh-exp",  "prompt-enhancer", "→ Explosive",          400, 100, { style: "cinematic" }),
      n("enh-foc",  "prompt-enhancer", "→ Focused",            400, 300, { style: "cinematic" }),
      n("enh-tri",  "prompt-enhancer", "→ Triumphant",         400, 500, { style: "cinematic" }),

      n("img-exp",  "flux-schnell",    "Frame: Explosive",     680, 100, { image_size: "portrait_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("img-foc",  "flux-schnell",    "Frame: Focused",       680, 300, { image_size: "portrait_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),
      n("img-tri",  "flux-schnell",    "Frame: Triumphant",    680, 500, { image_size: "portrait_16_9", num_inference_steps: 4, num_images: "1", seed: -1 }),

      n("vid-exp",  "kling-2-5-i2v",   "Reel: Explosive",      980, 100, { prompt: "Fast explosive vertical camera motion, athlete in action, high energy, urban backdrop", duration: "5", cfg_scale: 0.7 }),
      n("vid-foc",  "kling-2-5-i2v",   "Reel: Focused",        980, 300, { prompt: "Slow intense zoom-in on athlete, ultra focused expression, minimal movement, vertical format", duration: "5", cfg_scale: 0.4 }),
      n("vid-tri",  "kling-2-5-i2v",   "Reel: Triumphant",     980, 500, { prompt: "Victory moment camera sweep, arms raised, crowd energy, cinematic confetti, golden light", duration: "5", cfg_scale: 0.5 }),

      n("exp-1",    "export",          "Explosive.mp4",        1280, 100, { filename: "reel-explosive", format: "mp4" }),
      n("exp-2",    "export",          "Focused.mp4",          1280, 300, { filename: "reel-focused", format: "mp4" }),
      n("exp-3",    "export",          "Triumphant.mp4",       1280, 500, { filename: "reel-triumphant", format: "mp4" }),
    ],
    edges: [
      e("e1",  "brief-1", "enh-exp",  "text",  "text"),
      e("e2",  "brief-1", "enh-foc",  "text",  "text"),
      e("e3",  "brief-1", "enh-tri",  "text",  "text"),
      e("e4",  "enh-exp", "img-exp",  "text",  "prompt"),
      e("e5",  "enh-foc", "img-foc",  "text",  "prompt"),
      e("e6",  "enh-tri", "img-tri",  "text",  "prompt"),
      e("e7",  "img-exp", "vid-exp",  "image", "image"),
      e("e8",  "img-foc", "vid-foc",  "image", "image"),
      e("e9",  "img-tri", "vid-tri",  "image", "image"),
      e("e10", "enh-exp", "vid-exp",  "text",  "prompt"),
      e("e11", "enh-foc", "vid-foc",  "text",  "prompt"),
      e("e12", "enh-tri", "vid-tri",  "text",  "prompt"),
      e("e13", "vid-exp", "exp-1",    "video", "video"),
      e("e14", "vid-foc", "exp-2",    "video", "video"),
      e("e15", "vid-tri", "exp-3",    "video", "video"),
    ],
  },

  // ── 17. Brand Refresh Comparison ─────────────────────────────────────────────
  // Upload old logo / existing brand visual → generate 3 fresh rebrand directions.
  {
    id: "brand-refresh-comparison",
    name: "Brand Refresh Comparison",
    description: "Upload an existing brand visual → GPT-4o reads the current identity → generates 3 distinct rebrand directions (modern minimal, bold expressive, premium luxury). Show clients options instantly.",
    category: "Branding",
    tags: ["rebrand", "brand refresh", "comparison", "agency", "client presentation"],
    icon: "🔃",
    previewGradient: "from-amber-500/20 to-orange-600/20",
    estimatedCredits: 20,
    nodes: [
      n("brand-in",  "import",          "Current Brand Asset",   100, 300, { url: "" }),
      n("brief-1",   "text-input",      "Rebrand Direction",     100, 500, { value: "The brand needs to feel younger, more digital-native, and globally premium." }),
      n("vision-1",  "image-describer", "Read Current Brand",    380, 300, { style: "prompt" }),

      n("enh-mod",   "prompt-enhancer", "→ Modern Minimal",      660, 120, { style: "minimal" }),
      n("enh-bold",  "prompt-enhancer", "→ Bold Expressive",     660, 320, { style: "artistic" }),
      n("enh-lux",   "prompt-enhancer", "→ Premium Luxury",      660, 520, { style: "detailed" }),

      n("img-mod",   "ideogram-v3",     "Modern Minimal",        960, 120, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),
      n("img-bold",  "ideogram-v3",     "Bold Expressive",       960, 320, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),
      n("img-lux",   "ideogram-v3",     "Premium Luxury",        960, 520, { image_size: "square_hd", style: "DESIGN", rendering_speed: "BALANCED", seed: -1 }),

      n("prev-mod",  "preview",         "Option A: Minimal",    1260, 120, {}),
      n("prev-bold", "preview",         "Option B: Bold",       1260, 320, {}),
      n("prev-lux",  "preview",         "Option C: Luxury",     1260, 520, {}),
    ],
    edges: [
      e("e1",  "brand-in", "vision-1", "image", "image"),
      e("e2",  "vision-1", "enh-mod",  "text",  "text"),
      e("e3",  "vision-1", "enh-bold", "text",  "text"),
      e("e4",  "vision-1", "enh-lux",  "text",  "text"),
      e("e5",  "brief-1",  "enh-mod",  "text",  "text"),
      e("e6",  "brief-1",  "enh-bold", "text",  "text"),
      e("e7",  "brief-1",  "enh-lux",  "text",  "text"),
      e("e8",  "enh-mod",  "img-mod",  "text",  "prompt"),
      e("e9",  "enh-bold", "img-bold", "text",  "prompt"),
      e("e10", "enh-lux",  "img-lux",  "text",  "prompt"),
      e("e11", "img-mod",  "prev-mod", "image", "media"),
      e("e12", "img-bold", "prev-bold","image", "media"),
      e("e13", "img-lux",  "prev-lux", "image", "media"),
    ],
  },

  // ── 18. Client Presentation Visuals ──────────────────────────────────────────
  // Brand brief → 5 hero images for a pitch deck (title, problem, solution,
  // vision, call-to-action). All landscape 16:9.
  {
    id: "client-presentation-visuals",
    name: "Client Presentation Visuals",
    description: "Describe a client brief → automatically generate 5 on-brand 16:9 hero images for each section of a pitch deck: Title, Challenge, Solution, Vision, and CTA. Instant presentation-ready visuals.",
    category: "Branding",
    tags: ["pitch deck", "presentation", "client", "hero images", "agency", "brand"],
    icon: "📊",
    previewGradient: "from-blue-600/20 to-indigo-500/20",
    estimatedCredits: 25,
    nodes: [
      n("brief-1",  "text-input",      "Brand & Deck Brief",  100, 500, {
        value: "Sustainable fintech startup. Clean, trustworthy, forward-looking. Green + navy palette. Audience: enterprise CFOs.",
      }),
      n("enh-title","prompt-enhancer", "→ Title Slide",       380,  80, { style: "cinematic" }),
      n("enh-chal", "prompt-enhancer", "→ Challenge",         380, 240, { style: "cinematic" }),
      n("enh-sol",  "prompt-enhancer", "→ Solution",          380, 400, { style: "cinematic" }),
      n("enh-vis",  "prompt-enhancer", "→ Vision",            380, 560, { style: "cinematic" }),
      n("enh-cta",  "prompt-enhancer", "→ CTA",               380, 720, { style: "cinematic" }),

      n("img-title","flux-pro",        "Title Hero",          680,  80, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: 42 }),
      n("img-chal", "flux-pro",        "Challenge Hero",      680, 240, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: 43 }),
      n("img-sol",  "flux-pro",        "Solution Hero",       680, 400, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: 44 }),
      n("img-vis",  "flux-pro",        "Vision Hero",         680, 560, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: 45 }),
      n("img-cta",  "flux-pro",        "CTA Hero",            680, 720, { image_size: "landscape_16_9", num_inference_steps: 28, guidance_scale: 3.5, num_images: "1", seed: 46 }),

      n("p-title",  "preview",         "1: Title",            980,  80, {}),
      n("p-chal",   "preview",         "2: Challenge",        980, 240, {}),
      n("p-sol",    "preview",         "3: Solution",         980, 400, {}),
      n("p-vis",    "preview",         "4: Vision",           980, 560, {}),
      n("p-cta",    "preview",         "5: CTA",              980, 720, {}),
    ],
    edges: [
      e("e1",  "brief-1",   "enh-title", "text",  "text"),
      e("e2",  "brief-1",   "enh-chal",  "text",  "text"),
      e("e3",  "brief-1",   "enh-sol",   "text",  "text"),
      e("e4",  "brief-1",   "enh-vis",   "text",  "text"),
      e("e5",  "brief-1",   "enh-cta",   "text",  "text"),
      e("e6",  "enh-title", "img-title", "text",  "prompt"),
      e("e7",  "enh-chal",  "img-chal",  "text",  "prompt"),
      e("e8",  "enh-sol",   "img-sol",   "text",  "prompt"),
      e("e9",  "enh-vis",   "img-vis",   "text",  "prompt"),
      e("e10", "enh-cta",   "img-cta",   "text",  "prompt"),
      e("e11", "img-title", "p-title",   "image", "media"),
      e("e12", "img-chal",  "p-chal",    "image", "media"),
      e("e13", "img-sol",   "p-sol",     "image", "media"),
      e("e14", "img-vis",   "p-vis",     "image", "media"),
      e("e15", "img-cta",   "p-cta",     "image", "media"),
    ],
  },

  // ── 19. Brand Asset → Social Video ───────────────────────────────────────────
  // Upload any brand asset (image, guideline screenshot, moodboard) →
  // GPT-4o Vision extracts the aesthetic → image-to-image generates a
  // campaign still in that exact style → Kling animates it into a video.
  {
    id: "brand-asset-to-social-video",
    name: "Brand Asset → Social Video",
    description: "Upload any existing brand asset — logo, moodboard, or guidelines screenshot → GPT-4o extracts the visual DNA → generates a campaign still in that exact style → animates into a polished social video.",
    category: "Branding",
    tags: ["brand", "moodboard", "social video", "style transfer", "campaign", "agency"],
    icon: "✨",
    previewGradient: "from-emerald-500/20 to-cyan-600/20",
    estimatedCredits: 55,
    nodes: [
      n("asset-in",  "import",          "Upload Brand Asset",   100, 300, { url: "" }),
      n("brief-1",   "text-input",      "Campaign Brief",       100, 500, { value: "Generate a campaign visual that captures the brand's core values and visual identity, suitable for social media." }),
      n("vision-1",  "image-describer", "Extract Visual DNA",   380, 300, { style: "prompt" }),
      n("enh-1",     "prompt-enhancer", "Craft Campaign Brief", 660, 400, { style: "cinematic" }),
      n("i2i-1",     "image-to-image",  "Stylise Campaign Still",940, 300, {
        prompt: "Campaign still in brand style, professional photography, high production value",
        strength: 0.6, num_inference_steps: 28, guidance_scale: 3.5, seed: -1,
      }),
      n("prev-1",    "preview",         "Campaign Still",      1240, 160, {}),
      n("up-1",      "image-upscaler",  "2× Upscale",          1240, 380, { scale: "2" }),
      n("vid-1",     "kling-2-5-i2v",   "Animate",             1520, 380, {
        prompt: "Smooth cinematic reveal, brand atmosphere, subtle motion, professional production",
        duration: "5", cfg_scale: 0.45,
      }),
      n("exp-1",     "export",          "Export Campaign Video",1820, 380, { filename: "brand-social-video", format: "mp4" }),
    ],
    edges: [
      e("e1",  "asset-in",  "vision-1",  "image", "image"),
      e("e2",  "asset-in",  "i2i-1",     "image", "image"),
      e("e3",  "vision-1",  "enh-1",     "text",  "text"),
      e("e4",  "brief-1",   "enh-1",     "text",  "text"),
      e("e5",  "enh-1",     "i2i-1",     "text",  "prompt"),
      e("e6",  "i2i-1",     "prev-1",    "image", "media"),
      e("e7",  "i2i-1",     "up-1",      "image", "image"),
      e("e8",  "up-1",      "vid-1",     "image", "image"),
      e("e9",  "enh-1",     "vid-1",     "text",  "prompt"),
      e("e10", "vid-1",     "exp-1",     "video", "video"),
    ],
  },

];

// ── Category list (for filtering) ────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  "All",
  ...Array.from(new Set(TEMPLATES.map((t) => t.category))),
];

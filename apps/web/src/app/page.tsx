import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">haus-node</span>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
          AI Creative Studio
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Build powerful AI workflows with a node-based canvas.
          Generate images, videos, and more with 50+ AI models.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/canvas"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Canvas
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/templates"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Browse Templates
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
          {[
            { icon: "🖼️", label: "Image Gen", desc: "Flux, DALL·E, Ideogram, Recraft" },
            { icon: "🎬", label: "Video Gen", desc: "Kling, Runway, Wan, LTX" },
            { icon: "✂️", label: "Editing", desc: "Inpaint, upscale, remove BG" },
            { icon: "🔗", label: "Node Canvas", desc: "Visual workflow builder" },
            { icon: "⚡", label: "Real-time", desc: "Live job status via WebSocket" },
            { icon: "🏢", label: "Teams", desc: "Shared workspaces & credits" },
          ].map((f) => (
            <div key={f.label} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-2xl">{f.icon}</div>
              <div className="mb-1 text-sm font-semibold">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

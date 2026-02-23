"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";

export default function HomePage() {
  const { user, workspace, isAuthenticated, logout } = useAuthStore();

  async function handleLogout() {
    try { await api.auth.logout(); } catch {}
    logout();
    toast.success("Signed out");
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <nav className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="font-bold tracking-tight">haus-node</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated() ? (
            <>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
              <Link href="/canvas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Canvas</Link>
              <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
              <div className="ml-1 flex items-center gap-3">
                {workspace && (
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {workspace.credits} credits
                  </div>
                )}
                <div className="relative group">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary hover:bg-primary/30 transition-colors">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </button>
                  <div className="absolute right-0 top-10 hidden min-w-[160px] rounded-xl border border-border bg-card p-1 shadow-xl group-hover:block z-50">
                    <div className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground">{user?.name}</div>
                      <div className="text-muted-foreground truncate">{user?.email}</div>
                    </div>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
              <Link href="/register" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Get access
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
          AI Creative Studio
        </h1>
        <p className="mb-8 max-w-lg text-lg text-muted-foreground">
          Build powerful AI workflows with a node-based canvas.
          Generate images, videos, and more with 50+ AI models.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {isAuthenticated() ? (
            <>
              <Link href="/canvas" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Open Canvas
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/projects" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                My Projects
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Get access
              </Link>
              <Link href="/templates" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                Browse Templates
              </Link>
            </>
          )}
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
          {[
            { icon: "🖼️", label: "Image Gen", desc: "Flux, DALL·E, Ideogram, Recraft" },
            { icon: "🎬", label: "Video Gen", desc: "Kling, Runway, Wan, LTX" },
            { icon: "✂️", label: "Editing", desc: "Inpaint, upscale, remove BG" },
            { icon: "🔗", label: "Node Canvas", desc: "Visual workflow builder" },
            { icon: "📁", label: "Projects", desc: "Client projects & branding" },
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

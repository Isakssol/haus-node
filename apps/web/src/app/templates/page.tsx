"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nanoid } from "nanoid";
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template } from "@/lib/templates";
import { useCanvasStore } from "@/stores/canvas.store";

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: Template;
  onUse: (t: Template) => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      {/* Visual preview area */}
      <div className={`relative h-36 bg-gradient-to-br ${template.previewGradient} flex items-center justify-center`}>
        {/* Node flow diagram preview */}
        <div className="flex items-center gap-2 opacity-70">
          {template.nodes.slice(0, Math.min(4, template.nodes.length)).map((node, i) => (
            <div key={node.id} className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-md bg-card/60 backdrop-blur-sm border border-border/50 flex items-center justify-center">
                <span className="text-[10px] font-medium text-foreground/70 truncate px-1">
                  {node.data.label}
                </span>
              </div>
              {i < Math.min(3, template.nodes.length - 1) && (
                <div className="h-px w-3 bg-primary/40" />
              )}
            </div>
          ))}
          {template.nodes.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{template.nodes.length - 4}</span>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-card/80 backdrop-blur-sm border border-border/60 px-2.5 py-0.5 text-[10px] font-semibold text-foreground/80">
            {template.category}
          </span>
        </div>

        {/* Credit cost badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-sm border border-border/60 px-2.5 py-0.5">
          <span className="text-[10px] text-amber-400">⬡</span>
          <span className="text-[10px] font-semibold text-foreground/80">{template.estimatedCredits}cr</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-2xl leading-none mt-0.5">{template.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{template.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Node count */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{template.nodes.length} nodes · {template.edges.length} connections</span>
        </div>
      </div>

      {/* Use template button — appears on hover */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onUse(template)}
          className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Open in Canvas →
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter();
  const loadWorkflow = useCanvasStore((s) => s.loadWorkflow);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  function handleUse(template: Template) {
    // Re-assign fresh IDs so multiple uses don't conflict
    const idMap = new Map<string, string>();
    template.nodes.forEach((n) => idMap.set(n.id, nanoid()));

    const freshNodes = template.nodes.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
    }));

    const freshEdges = template.edges.map((edge) => ({
      ...edge,
      id: nanoid(),
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
    }));

    loadWorkflow({
      id: null,
      name: template.name,
      nodes: freshNodes as any,
      edges: freshEdges as any,
    });

    router.push("/canvas");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
            >
              <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
              haus-node
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-foreground">Templates</span>
          </div>
          <Link
            href="/canvas"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open Canvas →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
            Professional Workflow Templates
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Ready-to-run AI workflows for creative professionals. Open in canvas, customise, and run.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>
          <span>template{filtered.length !== 1 ? "s" : ""}</span>
          {activeCategory !== "All" && (
            <>
              <span>in</span>
              <span className="font-semibold text-foreground">{activeCategory}</span>
            </>
          )}
          {search && (
            <>
              <span>matching</span>
              <span className="font-semibold text-foreground">"{search}"</span>
              <button
                onClick={() => setSearch("")}
                className="ml-1 text-muted-foreground hover:text-foreground underline"
              >
                clear
              </button>
            </>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUse}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-2 text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term or category
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

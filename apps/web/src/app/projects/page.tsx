"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder, Plus, Briefcase, Archive, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#0891B2", "#4F46E5",
];

function CreateProjectModal({
  workspaceId,
  onCreated,
  onClose,
}: {
  workspaceId: string;
  onCreated: (p: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", clientName: "", description: "", color: PROJECT_COLORS[0]! });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.projects.create(workspaceId, form);
      onCreated(res.data);
      toast.success("Project created");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-lg font-semibold">New project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Project name</label>
            <input
              autoFocus
              required
              placeholder="e.g. Nike Summer Campaign"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Client name</label>
            <input
              placeholder="e.g. Nike"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              rows={2}
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn("h-7 w-7 rounded-full border-2 transition-transform hover:scale-110", form.color === c ? "border-white scale-110" : "border-transparent")}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { workspace, user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!workspace) return;
    api.projects.list(workspace.id).then((r) => setProjects(r.data)).catch(() => toast.error("Failed to load projects")).finally(() => setLoading(false));
  }, [workspace]);

  const active = projects.filter((p) => p.status === "active");
  const archived = projects.filter((p) => p.status === "archived");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
              haus-node
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Projects</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New project
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Create a project to organise your client work — workflows, generated assets, and branding all in one place.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create your first project
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active — {active.length}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {active.map((p) => (
                    <ProjectCard key={p.id} project={p} onClick={() => router.push(`/projects/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}
            {archived.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Archived — {archived.length}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                  {archived.map((p) => (
                    <ProjectCard key={p.id} project={p} onClick={() => router.push(`/projects/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showCreate && workspace && (
        <CreateProjectModal
          workspaceId={workspace.id}
          onCreated={(p) => setProjects((ps) => [p, ...ps])}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const brandingCount = (project.brandingAssets ?? []).length;
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50 hover:bg-accent"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: project.color + "22" }}>
          <Folder className="h-5 w-5" style={{ color: project.color }} />
        </div>
        {project.status === "archived" && (
          <Archive className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-1 font-semibold leading-tight">{project.name}</h3>
      {project.clientName && (
        <p className="mb-2 text-xs text-muted-foreground">{project.clientName}</p>
      )}
      {project.description && (
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {brandingCount > 0 && <span>{brandingCount} branding asset{brandingCount !== 1 ? "s" : ""}</span>}
        {project.tags?.length > 0 && (
          <div className="flex gap-1">
            {project.tags.slice(0, 2).map((t: string) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{t}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

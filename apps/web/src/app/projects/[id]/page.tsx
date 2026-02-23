"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight, Folder, Upload, Trash2, Play, ExternalLink,
  Loader2, Image as ImageIcon, Video, FileText, Palette, Type, Archive, CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const ASSET_ICONS: Record<string, React.ReactNode> = {
  logo: <ImageIcon className="h-4 w-4" />,
  color_palette: <Palette className="h-4 w-4" />,
  font: <Type className="h-4 w-4" />,
  guideline: <FileText className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

type Tab = "workflows" | "jobs" | "branding";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { workspace } = useAuthStore();

  const [project, setProject] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("workflows");
  const [loading, setLoading] = useState(true);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.projects.get(id),
      api.projects.workflows(id),
      api.projects.jobs(id),
    ])
      .then(([p, wf, j]) => {
        setProject(p.data);
        setWorkflows(wf.data);
        setJobs(j.data);
      })
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAssetUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !workspace) return;

    setUploadingAsset(true);
    try {
      // Upload the file via the uploads endpoint
      const formData = new FormData();
      formData.append("file", file);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const token = (() => {
        try { return JSON.parse(localStorage.getItem("haus-auth") ?? "{}")?.state?.token; } catch { return null; }
      })();
      const uploadRes = await fetch(`${API_BASE}/api/v1/uploads`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // Determine asset type from file
      let type: string = "other";
      const name = file.name.toLowerCase();
      if (name.includes("logo")) type = "logo";
      else if (name.includes("guideline") || name.includes("brand") || file.type === "application/pdf") type = "guideline";
      else if (file.type.startsWith("image/")) type = "image";

      const existing: any[] = project.brandingAssets ?? [];
      const updated = [...existing, { url, type, name: file.name }];

      const res = await api.projects.update(id, { brandingAssets: updated });
      setProject(res.data);
      toast.success("Branding asset uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploadingAsset(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeAsset(idx: number) {
    const updated = (project.brandingAssets ?? []).filter((_: any, i: number) => i !== idx);
    try {
      const res = await api.projects.update(id, { brandingAssets: updated });
      setProject(res.data);
    } catch {
      toast.error("Failed to remove asset");
    }
  }

  async function toggleArchive() {
    const newStatus = project.status === "active" ? "archived" : "active";
    try {
      const res = await api.projects.update(id, { status: newStatus });
      setProject(res.data);
      toast.success(newStatus === "archived" ? "Project archived" : "Project restored");
    } catch {
      toast.error("Failed to update project");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-2 hover:text-foreground">
              <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              haus-node
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/projects" className="hover:text-foreground">Projects</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{project.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleArchive}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            >
              <Archive className="h-3.5 w-3.5" />
              {project.status === "active" ? "Archive" : "Restore"}
            </button>
            <Link
              href={`/canvas?project=${id}`}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-3.5 w-3.5" />
              Open canvas
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Project header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: project.color + "22" }}>
            <Folder className="h-7 w-7" style={{ color: project.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.clientName && <p className="text-sm text-muted-foreground">{project.clientName}</p>}
            {project.description && <p className="mt-1 text-sm text-muted-foreground max-w-xl">{project.description}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Workflows", value: workflows.length },
            { label: "Jobs run", value: jobs.length },
            { label: "Branding assets", value: (project.brandingAssets ?? []).length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
          {(["workflows", "jobs", "branding"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "workflows" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Workflows</h2>
              <Link href={`/canvas?project=${id}`} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
                <Play className="h-3 w-3" /> New workflow
              </Link>
            </div>
            {workflows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No workflows yet — open the canvas to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <Link
                    key={wf.id}
                    href={`/canvas?workflow=${wf.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent"
                  >
                    <div>
                      <div className="font-medium">{wf.name}</div>
                      <div className="text-xs text-muted-foreground">{wf.nodes?.length ?? 0} nodes</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "jobs" && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent jobs</h2>
            {jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No jobs run yet.
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={job.status} />
                      <div>
                        <div className="text-sm font-medium">{job.workflowId ?? "Ad-hoc run"}</div>
                        <div className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {job.creditsCost != null && (
                      <span className="text-xs text-muted-foreground">{job.creditsCost} credits</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "branding" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Branding assets</h2>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAsset}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {uploadingAsset ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload asset
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.ttf,.otf,.woff,.woff2"
                onChange={handleAssetUpload}
              />
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Upload logos, brand guidelines, fonts, and colour palettes. These assets can then be referenced in your workflows to generate on-brand content.
            </p>
            {(project.brandingAssets ?? []).length === 0 ? (
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center transition-colors hover:border-primary/50 hover:bg-accent"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drop files or click to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">Logos, guidelines (PDF), fonts, images</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(project.brandingAssets ?? []).map((asset: any, idx: number) => (
                  <div key={idx} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {ASSET_ICONS[asset.type] ?? ASSET_ICONS.other}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{asset.name}</div>
                      <div className="text-xs capitalize text-muted-foreground">{asset.type.replace("_", " ")}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={asset.url} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-accent">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      <button onClick={() => removeAsset(idx)} className="rounded p-1 hover:bg-accent">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "text-emerald-400 bg-emerald-400/10",
    running: "text-yellow-400 bg-yellow-400/10",
    failed: "text-red-400 bg-red-400/10",
    pending: "text-muted-foreground bg-muted",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", map[status] ?? map.pending)}>
      {status}
    </span>
  );
}

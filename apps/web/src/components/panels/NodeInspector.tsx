"use client";

import { useRef, useState } from "react";
import { getNode } from "@haus-node/node-registry";
import { useCanvasStore } from "@/stores/canvas.store";
import { cn } from "@/lib/utils";
import type { NodeParameter } from "@haus-node/types";

function ParamField({
  param,
  value,
  onChange,
}: {
  param: NodeParameter;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const base =
    "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  switch (param.type) {
    case "text":
      return param.multiline ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          rows={4}
          className={cn(base, "resize-none")}
        />
      ) : (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          className={base}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? param.default ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={(param as any).min}
          max={(param as any).max}
          step={(param as any).step ?? 1}
          className={base}
        />
      );

    case "slider": {
      const min = (param as any).min ?? 0;
      const max = (param as any).max ?? 100;
      const step = (param as any).step ?? 1;
      const current = (value as number) ?? param.default ?? min;
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="flex-1 accent-primary"
          />
          <span className="w-12 text-right text-xs font-mono text-muted-foreground">
            {typeof current === "number" ? current.toFixed(step < 1 ? 2 : 0) : current}
          </span>
        </div>
      );
    }

    case "select": {
      const options = (param as any).options as { label: string; value: string }[];
      return (
        <select
          value={(value as string) ?? param.default ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, "cursor-pointer")}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case "boolean":
      return (
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "flex h-5 w-9 items-center rounded-full transition-colors",
            value ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full bg-white shadow transition-transform",
              value ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
      );

    case "file":
      return <FileUploadField param={param as any} value={value as string} onChange={onChange} />;

    default:
      return <div className="text-xs text-muted-foreground">Unknown param type</div>;
  }
}

// ── File Upload Field ──────────────────────────────────────────────────────────

function FileUploadField({
  param,
  value,
  onChange,
}: {
  param: { accept?: string; placeholder?: string };
  value: string;
  onChange: (val: unknown) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isImage = value && (value.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i) || value.startsWith("data:image"));
  const isVideo = value && (value.match(/\.(mp4|webm|mov|avi)(\?|$)/i) || value.startsWith("data:video"));

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      // 1. Try presigned URL (works in production with real S3/R2)
      const presignRes = await fetch("/api/v1/uploads/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, folder: "user-uploads" }),
      });

      if (presignRes.ok) {
        const { uploadUrl, publicUrl } = await presignRes.json();
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (putRes.ok) {
          onChange(publicUrl);
          setUploading(false);
          return;
        }
      }

      // 2. Fallback: direct multipart upload (dev / no public S3 endpoint)
      const form = new FormData();
      form.append("file", file);
      const directRes = await fetch("/api/v1/uploads/direct", {
        method: "POST",
        body: form,
      });
      if (!directRes.ok) throw new Error("Upload failed");
      const { publicUrl } = await directRes.json();
      onChange(publicUrl);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {/* Upload button — input is visible but styled, no JS .click() tricks needed */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors py-4 px-3 select-none",
          dragOver
            ? "border-primary bg-primary/10"
            : "border-border hover:border-border/70 hover:bg-accent/30",
          uploading ? "opacity-60 cursor-wait" : "cursor-pointer"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={(param as any).accept ?? "image/*,video/*,audio/*"}
          disabled={uploading}
          onChange={onInputChange}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        />
        {uploading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-[10px] text-muted-foreground">Uploading…</span>
          </>
        ) : (
          <>
            <span className="text-xl">📁</span>
            <span className="text-[10px] text-muted-foreground text-center">
              {value ? "Click or drag to replace" : "Click or drag to upload"}
            </span>
          </>
        )}
      </label>

      {/* Preview */}
      {value && !uploading && (
        <div className="rounded-lg overflow-hidden border border-border/50">
          {isImage ? (
            <img
              src={value}
              alt="preview"
              className="w-full max-h-40 object-cover"
            />
          ) : isVideo ? (
            <video
              src={value}
              className="w-full max-h-40 object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="px-2 py-1.5 text-[10px] text-muted-foreground truncate">
              {value}
            </div>
          )}
        </div>
      )}

      {/* URL fallback */}
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}
    </div>
  );
}

export function NodeInspector() {
  const { selectedNodeId, nodes, updateNodeParameter, removeNode, duplicateNode } =
    useCanvasStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode || !selectedNodeId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <div className="rounded-full bg-muted p-3 text-2xl">🔍</div>
        <div>
          <p className="text-xs font-medium text-foreground">No node selected</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Click a node to inspect and configure it
          </p>
        </div>
      </div>
    );
  }

  const def = getNode(selectedNode.data.nodeDefId);
  if (!def) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-b border-border"
        style={{ borderLeftColor: def.color, borderLeftWidth: 3 }}
      >
        <div>
          <div className="text-xs font-bold text-foreground">{def.label}</div>
          <div className="text-[10px] text-muted-foreground">{def.description}</div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
            {def.creditCost > 0 ? `${def.creditCost} credits` : "free"}
          </span>
        </div>
      </div>

      {/* Parameters */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {def.parameters.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">
            This node has no configurable parameters.
          </p>
        ) : (
          def.parameters.map((param) => (
            <div key={param.id}>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {param.label}
                {param.required && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              {param.description && (
                <p className="mb-1 text-[9px] text-muted-foreground">
                  {param.description}
                </p>
              )}
              <ParamField
                param={param}
                value={selectedNode.data.parameters[param.id]}
                onChange={(val) =>
                  updateNodeParameter(selectedNodeId, param.id, val)
                }
              />
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border p-3 flex gap-2">
        <button
          onClick={() => duplicateNode(selectedNodeId)}
          className="flex-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => removeNode(selectedNodeId)}
          className="flex-1 rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

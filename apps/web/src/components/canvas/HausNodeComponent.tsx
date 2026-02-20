"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getNode, CATEGORY_META } from "@haus-node/node-registry";
import { useCanvasStore, type HausNode } from "@/stores/canvas.store";
import { cn } from "@/lib/utils";

// Port color by type
const PORT_COLORS: Record<string, string> = {
  image:  "#7C3AED",
  video:  "#EA580C",
  audio:  "#059669",
  text:   "#0891B2",
  number: "#D97706",
  boolean:"#DC2626",
  seed:   "#6B7280",
  lora:   "#DB2777",
  "3d":   "#7C3AED",
  any:    "#6B7280",
};

function StatusIndicator({
  running,
  completed,
  error,
}: {
  running?: boolean;
  completed?: boolean;
  error?: string;
}) {
  if (running) {
    return (
      <span className="flex h-2 w-2">
        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-yellow-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
      </span>
    );
  }
  if (completed) return <span className="h-2 w-2 rounded-full bg-green-500" />;
  if (error)     return <span className="h-2 w-2 rounded-full bg-red-500" />;
  return null;
}

function HausNodeComponentInner({ id, data, selected }: NodeProps<HausNode>) {
  const def        = getNode(data.nodeDefId);
  const selectNode = useCanvasStore((s) => s.selectNode);

  const handleClick = useCallback(() => selectNode(id), [id, selectNode]);

  if (!def) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-950/50 px-4 py-3 text-xs text-red-400">
        Unknown node: {data.nodeDefId}
      </div>
    );
  }

  const isPreview    = def.id === "preview";
  const categoryMeta = CATEGORY_META[def.category];

  return (
    <div
      onClick={handleClick}
      className={cn(
        "rounded-xl border bg-card shadow-xl transition-all",
        isPreview ? "min-w-[260px] max-w-[360px]" : "min-w-[220px] max-w-[280px]",
        selected
          ? "border-primary shadow-primary/20 shadow-lg"
          : "border-border hover:border-border/80",
        data.running   && "border-yellow-500/50 shadow-yellow-500/10",
        data.completed && "border-green-500/30",
        data.error     && "border-red-500/50"
      )}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 rounded-t-xl px-3 py-2"
        style={{
          backgroundColor: def.color + "22",
          borderBottom: `1px solid ${def.color}33`,
        }}
      >
        <span className="text-sm">{categoryMeta.icon}</span>
        <span className="flex-1 truncate text-xs font-semibold text-foreground">
          {data.label ?? def.label}
        </span>
        <StatusIndicator
          running={data.running}
          completed={data.completed}
          error={data.error}
        />
        {def.creditCost > 0 && (
          <span className="rounded bg-black/30 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
            {def.creditCost}cr
          </span>
        )}
      </div>

      {/* ── Ports body ──────────────────────────────────────── */}
      {/*
        Each port row is `position: relative` so React Flow can
        measure the Handle's absolute position correctly.
        The Handle itself uses `position: absolute` internally —
        we just need to give it a stable containing block.
      */}
      <div className="py-2">
        {/* Input ports */}
        {def.inputs.map((port) => {
          const color = PORT_COLORS[port.type] ?? PORT_COLORS["any"]!;
          return (
            <div key={port.id} className="relative flex items-center h-6 px-3">
              {/* Handle sits at position: absolute, left edge of the node */}
              <Handle
                id={port.id}
                type="target"
                position={Position.Left}
                style={{
                  background: color,
                  border: "2px solid hsl(222 47% 6%)",
                  width: 12,
                  height: 12,
                  left: -6,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <span className="ml-2 text-[10px] text-muted-foreground truncate select-none">
                {port.label}
                {port.required && (
                  <span className="ml-0.5 text-red-400">*</span>
                )}
              </span>
            </div>
          );
        })}

        {/* Divider when both inputs and outputs */}
        {def.inputs.length > 0 && def.outputs.length > 0 && (
          <div className="border-t border-border/40 my-1 mx-3" />
        )}

        {/* Output ports — hidden for preview node (media output is internal) */}
        {!isPreview && def.outputs.map((port) => {
          const color = PORT_COLORS[port.type] ?? PORT_COLORS["any"]!;
          return (
            <div
              key={port.id}
              className="relative flex items-center justify-end h-6 px-3"
            >
              <span className="mr-2 text-[10px] text-muted-foreground truncate select-none">
                {port.label}
              </span>
              {/* Handle sits at position: absolute, right edge of the node */}
              <Handle
                id={port.id}
                type="source"
                position={Position.Right}
                style={{
                  background: color,
                  border: "2px solid hsl(222 47% 6%)",
                  width: 12,
                  height: 12,
                  right: -6,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Output preview (image / video / text) ────────────── */}
      {data.completed && data.outputs && (
        <div className="border-t border-border/50 p-2 space-y-1">
          {Object.entries(data.outputs).map(([key, val]) => {
            if (typeof val !== "string") return null;

            // ── Media (image / video) ──
            if (val.startsWith("http") || val.startsWith("/")) {
              const isVideo = val.includes(".mp4") || val.includes("video");
              return (
                <div key={key} className="overflow-hidden rounded-lg">
                  {isVideo ? (
                    <video
                      src={val}
                      className={cn(
                        "w-full rounded object-cover",
                        isPreview ? "max-h-64" : "max-h-40"
                      )}
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={val}
                      alt="output"
                      className={cn(
                        "w-full rounded object-cover",
                        isPreview ? "max-h-64" : "max-h-40"
                      )}
                    />
                  )}
                </div>
              );
            }

            // ── Text output (e.g. Prompt Enhancer, Image Describer) ──
            if (val.length > 0) {
              return (
                <div key={key} className="rounded-md bg-muted/60 px-2 py-1.5">
                  <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {key}
                  </p>
                  <p className="text-[10px] text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
                    {val}
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* ── Error display ───────────────────────────────────── */}
      {data.error && (
        <div className="border-t border-red-500/20 px-3 py-2">
          <p className="text-[10px] text-red-400 line-clamp-2">{data.error}</p>
        </div>
      )}
    </div>
  );
}

export const HausNodeComponent = memo(HausNodeComponentInner);

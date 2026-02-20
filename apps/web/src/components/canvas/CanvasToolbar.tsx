"use client";

import { useState } from "react";
import { Play, Save, Trash2, ZoomIn, Loader2, Coins } from "lucide-react";
import { useCanvasStore } from "@/stores/canvas.store";
import { api } from "@/lib/api";
import { NODE_MAP } from "@haus-node/node-registry";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Default workspace ID (replace with real auth later)
const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export function CanvasToolbar() {
  const [saving, setSaving] = useState(false);
  const {
    nodes,
    edges,
    workflowId,
    workflowName,
    setWorkflowName,
    jobRunning,
    setJobRunning,
    clearCanvas,
  } = useCanvasStore();

  const estimatedCost = nodes.reduce((sum, n) => {
    const def = NODE_MAP.get(n.data.nodeDefId);
    return sum + (def?.creditCost ?? 0);
  }, 0);

  const handleSave = async () => {
    if (nodes.length === 0) {
      toast.error("Canvas is empty");
      return;
    }
    setSaving(true);
    try {
      if (workflowId) {
        await api.workflows.update(workflowId, { name: workflowName, nodes, edges });
        toast.success("Workflow saved");
      } else {
        const res = await api.workflows.create(WORKSPACE_ID, {
          name: workflowName,
          nodes,
          edges,
        });
        useCanvasStore.setState({ workflowId: res.data.id });
        toast.success("Workflow saved");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (nodes.length === 0) {
      toast.error("Add some nodes first");
      return;
    }
    try {
      const res = await api.jobs.run(WORKSPACE_ID, {
        workflowId,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.nodeDefId,
          position: n.position,
          data: { parameters: n.data.parameters },
        })),
        edges,
        inputs: {},
      });
      setJobRunning(res.data.jobId);
      toast.info(`Job queued — estimated ${res.data.estimatedCredits} credits`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to start job");
    }
  };

  return (
    <header className="flex h-12 items-center gap-3 border-b border-border bg-card px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
        <span className="text-sm font-bold text-foreground">haus-node</span>
      </div>

      {/* Workflow name */}
      <input
        type="text"
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-foreground hover:border-border focus:border-primary focus:outline-none"
      />

      <div className="flex-1" />

      {/* Credit estimate */}
      {nodes.length > 0 && (
        <div className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
          <Coins className="h-3 w-3" />
          {estimatedCost} credits
        </div>
      )}

      {/* Node count */}
      {nodes.length > 0 && (
        <span className="text-[11px] text-muted-foreground">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            if (window.confirm("Clear the canvas? This cannot be undone.")) {
              clearCanvas();
            }
          }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </button>

        <button
          onClick={handleRun}
          disabled={jobRunning || nodes.length === 0}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
            jobRunning
              ? "bg-yellow-600/80 text-yellow-100 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            nodes.length === 0 && "opacity-40 cursor-not-allowed"
          )}
        >
          {jobRunning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Run
            </>
          )}
        </button>
      </div>
    </header>
  );
}

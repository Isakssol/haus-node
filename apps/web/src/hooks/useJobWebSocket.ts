"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/stores/canvas.store";
import { toast } from "sonner";

interface WsEvent {
  event: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export function useJobWebSocket(jobId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);

  const {
    setNodeRunning,
    mergeNodeOutput,
    setNodeCompleted,
    setNodeError,
    setJobComplete,
  } = useCanvasStore();

  useEffect(() => {
    if (!jobId) return;

    const wsUrl = `${
      process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001"
    }/ws/jobs/${jobId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected to job ${jobId}`);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsEvent;
        handleEvent(msg);
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    ws.onclose = () => {
      console.log(`[WS] Disconnected from job ${jobId}`);
    };

    function handleEvent(msg: WsEvent) {
      switch (msg.event) {
        // ── Node status change ──────────────────────────────
        case "job:status": {
          const { nodeId, nodeStatus } = msg.payload as {
            nodeId?: string;
            nodeStatus?: "running" | "completed";
            status?: string;
          };

          if (!nodeId) break; // top-level job status, ignore here

          if (nodeStatus === "running") {
            setNodeRunning(nodeId);
          } else if (nodeStatus === "completed") {
            // Mark completed (outputs already merged via job:output events)
            setNodeCompleted(nodeId);
          }
          break;
        }

        // ── Single port output ──────────────────────────────
        // Worker broadcasts one event per output port.
        // mergeNodeOutput accumulates them so multi-port nodes
        // don't lose earlier ports.
        case "job:output": {
          const { nodeId, portId, url, value } = msg.payload as {
            nodeId: string;
            portId: string;
            url?: string;
            value?: unknown;
          };

          const outputVal = url ?? value;
          if (nodeId && portId && outputVal !== undefined) {
            mergeNodeOutput(nodeId, portId, outputVal);
          }
          break;
        }

        // ── Node-level error ────────────────────────────────
        case "job:node_error": {
          const { nodeId, error } = msg.payload as {
            nodeId: string;
            error: string;
          };
          setNodeError(nodeId, error);
          break;
        }

        // ── Whole job complete ──────────────────────────────
        case "job:complete": {
          setJobComplete();
          toast.success("Workflow complete! ✨");
          break;
        }

        // ── Whole job error ─────────────────────────────────
        case "job:error": {
          const { error } = msg.payload as { error: string };
          setJobComplete();
          toast.error(`Job failed: ${error}`);
          break;
        }
      }
    }

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [
    jobId,
    setNodeRunning,
    mergeNodeOutput,
    setNodeCompleted,
    setNodeError,
    setJobComplete,
  ]);

  return wsRef;
}

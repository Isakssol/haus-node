"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { NodeCanvas } from "@/components/canvas/NodeCanvas";
import { NodeLibrary } from "@/components/sidebar/NodeLibrary";
import { NodeInspector } from "@/components/panels/NodeInspector";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { useCanvasStore } from "@/stores/canvas.store";
import { useJobWebSocket } from "@/hooks/useJobWebSocket";

export default function CanvasPage() {
  const currentJobId = useCanvasStore((s) => s.currentJobId);

  // Connect WebSocket for live job updates
  useJobWebSocket(currentJobId);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
        {/* Top toolbar */}
        <CanvasToolbar />

        {/* Main layout: sidebar | canvas | inspector */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar — Node Library */}
          <aside className="w-64 flex-shrink-0 border-r border-border overflow-hidden">
            <NodeLibrary />
          </aside>

          {/* Canvas */}
          <main className="flex-1 overflow-hidden">
            <NodeCanvas />
          </main>

          {/* Right panel — Node Inspector */}
          <aside className="w-72 flex-shrink-0 border-l border-border overflow-hidden">
            <NodeInspector />
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

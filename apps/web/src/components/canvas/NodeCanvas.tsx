"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/stores/canvas.store";
import { HausNodeComponent } from "./HausNodeComponent";
import { getNode } from "@haus-node/node-registry";

const nodeTypes = {
  hausNode: HausNodeComponent,
};

// Port types that are compatible with each other
const COMPATIBLE: Record<string, string[]> = {
  image:  ["image", "any"],
  video:  ["video", "any"],
  audio:  ["audio", "any"],
  text:   ["text",  "any"],
  number: ["number","any"],
  seed:   ["seed",  "number", "any"],
  lora:   ["lora",  "any"],
  "3d":   ["3d",    "any"],
  any:    ["image","video","audio","text","number","seed","lora","3d","any"],
};

export function NodeCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
  } = useCanvasStore();

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => selectNode(node.id),
    [selectNode]
  );

  const handlePaneClick = useCallback(
    () => selectNode(null),
    [selectNode]
  );

  /**
   * isValidConnection runs on every potential connection while the user
   * is dragging.  Returning false greys-out the target handle so the
   * user gets immediate visual feedback that the types don't match.
   */
  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) return false;
      if (source === target) return false; // no self-loops

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return false;

      const sourceDef = getNode(sourceNode.data.nodeDefId);
      const targetDef = getNode(targetNode.data.nodeDefId);
      if (!sourceDef || !targetDef) return false;

      const srcPort = sourceDef.outputs.find((p) => p.id === sourceHandle);
      const tgtPort = targetDef.inputs.find((p)  => p.id === targetHandle);
      if (!srcPort || !tgtPort) return false;

      const allowed = COMPATIBLE[srcPort.type] ?? ["any"];
      return allowed.includes(tgtPort.type) || tgtPort.type === "any";
    },
    [nodes]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
        // Allow edges to be connected from both directions during drag
        connectionMode={"loose" as any}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(217 33% 18%)"
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={() => "#374151"}
          maskColor="rgba(0,0,0,0.4)"
          style={{ background: "hsl(222 47% 8%)" }}
        />
      </ReactFlow>
    </div>
  );
}

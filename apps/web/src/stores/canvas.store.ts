"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { getNode, type NodeDefinition } from "@haus-node/node-registry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HausNode extends Node {
  data: {
    nodeDefId: string;
    label: string;
    parameters: Record<string, unknown>;
    running?: boolean;
    completed?: boolean;
    error?: string;
    outputs?: Record<string, unknown>;
  };
}

export type HausEdge = Edge;

interface CanvasState {
  // Canvas
  nodes: HausNode[];
  edges: HausEdge[];
  selectedNodeId: string | null;
  workflowId: string | null;
  workflowName: string;

  // Job
  currentJobId: string | null;
  jobRunning: boolean;
  jobOutputs: Record<string, Record<string, unknown>>; // nodeId -> { portId -> value }

  // Actions
  onNodesChange: OnNodesChange<HausNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (def: NodeDefinition, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNodeParameter: (nodeId: string, paramId: string, value: unknown) => void;
  selectNode: (id: string | null) => void;
  duplicateNode: (id: string) => void;

  setWorkflowName: (name: string) => void;
  loadWorkflow: (data: {
    id: string | null;
    name: string;
    nodes: HausNode[];
    edges: HausEdge[];
  }) => void;
  clearCanvas: () => void;

  // Job lifecycle
  setJobRunning: (jobId: string) => void;
  setNodeRunning: (nodeId: string) => void;
  /**
   * Called once per output port.  Merges into existing outputs so
   * multi-port nodes (e.g. image + images) don't overwrite each other.
   */
  mergeNodeOutput: (nodeId: string, portId: string, value: unknown) => void;
  setNodeCompleted: (nodeId: string) => void;
  setNodeError: (nodeId: string, error: string) => void;
  setJobComplete: () => void;
}

// ─── Port-type compatibility ──────────────────────────────────────────────────
// Returns true when source port type can connect to target port type.

function portsCompatible(sourceType: string, targetType: string): boolean {
  if (sourceType === "any" || targetType === "any") return true;
  if (sourceType === targetType) return true;
  // image output can feed into image-to-image style "image" inputs
  return false;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCanvasStore = create<CanvasState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    workflowId: null,
    workflowName: "Untitled Workflow",
    currentJobId: null,
    jobRunning: false,
    jobOutputs: {},

    // ── React Flow change handlers ──────────────────────────
    onNodesChange: (changes) =>
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes) as HausNode[];
      }),

    onEdgesChange: (changes) =>
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      }),

    /**
     * Connection validation:
     *  1. No self-connections
     *  2. Source must be an "output" handle (type=source) on its node def
     *  3. Target must be an "input" handle (type=target) on its node def
     *  4. Port types must be compatible
     *  5. One connection per input port (prevents duplicate edges)
     */
    onConnect: (connection: Connection) =>
      set((state) => {
        const { source, target, sourceHandle, targetHandle } = connection;
        if (!source || !target || !sourceHandle || !targetHandle) return;
        if (source === target) return; // no self-loops

        const sourceDef = getNode(
          state.nodes.find((n) => n.id === source)?.data.nodeDefId ?? ""
        );
        const targetDef = getNode(
          state.nodes.find((n) => n.id === target)?.data.nodeDefId ?? ""
        );
        if (!sourceDef || !targetDef) return;

        // Find the actual port definitions
        const srcPort = sourceDef.outputs.find((p) => p.id === sourceHandle);
        const tgtPort = targetDef.inputs.find((p) => p.id === targetHandle);
        if (!srcPort || !tgtPort) return;

        // Type compatibility check
        if (!portsCompatible(srcPort.type, tgtPort.type)) {
          console.warn(
            `[haus-node] Incompatible ports: ${srcPort.type} → ${tgtPort.type}`
          );
          return;
        }

        // Remove any existing edge going to the same target port (one-to-one input)
        state.edges = state.edges.filter(
          (e) => !(e.target === target && e.targetHandle === targetHandle)
        );

        // Add the new edge with a colour matching the port type
        const portColors: Record<string, string> = {
          image:  "#7C3AED",
          video:  "#EA580C",
          audio:  "#059669",
          text:   "#0891B2",
          number: "#D97706",
          seed:   "#6B7280",
          any:    "#6B7280",
        };
        const edgeColor = portColors[srcPort.type] ?? portColors["any"]!;

        state.edges = addEdge(
          {
            ...connection,
            animated: true,
            style: { strokeWidth: 2, stroke: edgeColor },
          },
          state.edges
        );
      }),

    // ── Node management ─────────────────────────────────────
    addNode: (def, position) =>
      set((state) => {
        const defaultParams: Record<string, unknown> = {};
        for (const param of def.parameters) {
          if ("default" in param && param.default !== undefined) {
            defaultParams[param.id] = param.default;
          }
        }
        const node: HausNode = {
          id: nanoid(),
          type: "hausNode",
          position,
          data: {
            nodeDefId: def.id,
            label: def.label,
            parameters: defaultParams,
          },
        };
        state.nodes.push(node);
      }),

    removeNode: (id) =>
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== id);
        state.edges = state.edges.filter(
          (e) => e.source !== id && e.target !== id
        );
        if (state.selectedNodeId === id) state.selectedNodeId = null;
      }),

    updateNodeParameter: (nodeId, paramId, value) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) node.data.parameters[paramId] = value;
      }),

    selectNode: (id) =>
      set((state) => {
        state.selectedNodeId = id;
      }),

    duplicateNode: (id) =>
      set((state) => {
        const original = state.nodes.find((n) => n.id === id);
        if (!original) return;
        const duplicate: HausNode = {
          ...original,
          id: nanoid(),
          position: {
            x: original.position.x + 40,
            y: original.position.y + 40,
          },
          data: {
            ...original.data,
            parameters: { ...original.data.parameters },
          },
          selected: false,
        };
        state.nodes.push(duplicate);
      }),

    // ── Workflow persistence ────────────────────────────────
    setWorkflowName: (name) =>
      set((state) => {
        state.workflowName = name;
      }),

    loadWorkflow: ({ id, name, nodes, edges }) =>
      set((state) => {
        state.workflowId    = id;
        state.workflowName  = name;
        state.nodes         = nodes;
        state.edges         = edges;
        state.selectedNodeId = null;
      }),

    clearCanvas: () =>
      set((state) => {
        state.nodes         = [];
        state.edges         = [];
        state.selectedNodeId = null;
        state.workflowId    = null;
        state.workflowName  = "Untitled Workflow";
        state.jobRunning    = false;
        state.currentJobId  = null;
        state.jobOutputs    = {};
      }),

    // ── Job lifecycle ───────────────────────────────────────
    setJobRunning: (jobId) =>
      set((state) => {
        state.currentJobId = jobId;
        state.jobRunning   = true;
        state.jobOutputs   = {};
        for (const node of state.nodes) {
          node.data.running   = false;
          node.data.completed = false;
          node.data.error     = undefined;
          node.data.outputs   = undefined;
        }
      }),

    setNodeRunning: (nodeId) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.data.running   = true;
          node.data.completed = false;
          node.data.error     = undefined;
        }
      }),

    /**
     * Merges a single port output into the node without wiping other ports.
     * E.g. first call: { image: "url1" }
     *      second call: { images: [...] }
     *      result: { image: "url1", images: [...] }
     */
    mergeNodeOutput: (nodeId, portId, value) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.data.outputs = {
            ...(node.data.outputs ?? {}),
            [portId]: value,
          };
        }
        // Also keep the flat jobOutputs map updated
        if (!state.jobOutputs[nodeId]) state.jobOutputs[nodeId] = {};
        state.jobOutputs[nodeId]![portId] = value;
      }),

    setNodeCompleted: (nodeId) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.data.running   = false;
          node.data.completed = true;
        }
      }),

    setNodeError: (nodeId, error) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (node) {
          node.data.running = false;
          node.data.error   = error;
        }
      }),

    setJobComplete: () =>
      set((state) => {
        state.jobRunning = false;
      }),
  }))
);

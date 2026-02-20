// ─── Node Types ──────────────────────────────────────────────────────────────

export type NodeCategory =
  | "image-gen"
  | "video-gen"
  | "image-edit"
  | "video-edit"
  | "audio"
  | "3d"
  | "lipsync"
  | "vector"
  | "text"
  | "data"
  | "helper";

export type PortType =
  | "image"
  | "video"
  | "audio"
  | "text"
  | "number"
  | "boolean"
  | "seed"
  | "lora"
  | "3d"
  | "any";

export interface NodePort {
  id: string;
  label: string;
  type: PortType;
  required?: boolean;
  default?: unknown;
  description?: string;
}

export interface NodeParameterBase {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface TextParam extends NodeParameterBase {
  type: "text";
  default?: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface NumberParam extends NodeParameterBase {
  type: "number";
  default?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectParam extends NodeParameterBase {
  type: "select";
  options: { label: string; value: string }[];
  default?: string;
}

export interface BooleanParam extends NodeParameterBase {
  type: "boolean";
  default?: boolean;
}

export interface SliderParam extends NodeParameterBase {
  type: "slider";
  default?: number;
  min: number;
  max: number;
  step?: number;
}

export interface FileParam extends NodeParameterBase {
  type: "file";
  /** Accepted MIME types, e.g. "image/*" or "image/*,video/*" */
  accept?: string;
  placeholder?: string;
}

export type NodeParameter =
  | TextParam
  | NumberParam
  | SelectParam
  | BooleanParam
  | SliderParam
  | FileParam;

export interface NodeDefinition {
  id: string;
  label: string;
  description: string;
  category: NodeCategory;
  color: string;
  inputs: NodePort[];
  outputs: NodePort[];
  parameters: NodeParameter[];
  creditCost: number; // credits per run
  provider: "fal" | "replicate" | "openai" | "internal" | "gemini";
  providerModel: string; // e.g. "fal-ai/flux-pro"
  tags?: string[];
}

// ─── Workflow Types ───────────────────────────────────────────────────────────

export interface WorkflowNode {
  id: string;
  type: string; // NodeDefinition.id
  position: { x: number; y: number };
  data: {
    parameters: Record<string, unknown>;
    label?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  workspaceId: string;
  isPublic: boolean;
  isTemplate: boolean;
  thumbnailUrl?: string;
  tags?: string[];
}

// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface JobOutput {
  nodeId: string;
  portId: string;
  type: PortType;
  url?: string;
  value?: unknown;
}

export interface Job {
  id: string;
  workflowId: string;
  workspaceId: string;
  userId: string;
  status: JobStatus;
  inputs: Record<string, unknown>;
  outputs: JobOutput[];
  creditsUsed: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface JobStatusUpdate {
  jobId: string;
  status: JobStatus;
  nodeId?: string;
  nodeStatus?: JobStatus;
  progress?: number; // 0-100
  outputs?: JobOutput[];
  error?: string;
}

// ─── User / Credits Types ─────────────────────────────────────────────────────

export type PlanType = "free" | "starter" | "pro" | "team" | "enterprise";

export interface UserCredits {
  userId: string;
  workspaceId: string;
  balance: number;
  plan: PlanType;
  monthlyAllocation: number;
  resetsAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  workspaceId: string;
  amount: number; // negative = deduction, positive = top-up
  reason: string;
  jobId?: string;
  createdAt: string;
}

// ─── Workspace / Team Types ───────────────────────────────────────────────────

export type WorkspaceMemberRole = "owner" | "admin" | "editor" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  credits: number;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── WebSocket Message Types ──────────────────────────────────────────────────

export type WsMessageType =
  | "job:status"
  | "job:output"
  | "job:complete"
  | "job:error"
  | "workflow:saved"
  | "ping"
  | "pong";

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: string;
}

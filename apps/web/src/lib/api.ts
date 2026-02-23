const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Token provider ────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("haus-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as any).error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ─── API client ───────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string }) =>
      request<{ data: { token: string; user: any; workspace: any } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ data: { token: string; user: any; workspace: any } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    logout: () =>
      request<{ success: boolean }>("/auth/logout", { method: "POST" }),
    me: () =>
      request<{ data: { user: any; workspace: any } }>("/auth/me"),
  },

  workspaces: {
    get: (id: string) => request<{ data: any }>(`/workspaces/${id}`),
    credits: (id: string) =>
      request<{ data: { balance: number; transactions: any[] } }>(
        `/workspaces/${id}/credits`
      ),
    create: (body: { name: string; slug: string }) =>
      request<{ data: any }>("/workspaces", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  projects: {
    list: (workspaceId: string) =>
      request<{ data: any[] }>(`/workspaces/${workspaceId}/projects`),
    get: (id: string) => request<{ data: any }>(`/projects/${id}`),
    create: (workspaceId: string, body: any) =>
      request<{ data: any }>(`/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: any) =>
      request<{ data: any }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
    workflows: (id: string) =>
      request<{ data: any[] }>(`/projects/${id}/workflows`),
    jobs: (id: string) =>
      request<{ data: any[] }>(`/projects/${id}/jobs`),
    assets: (id: string) =>
      request<{ data: any[] }>(`/projects/${id}/assets`),
  },

  workflows: {
    list: (workspaceId: string) =>
      request<{ data: any[] }>(`/workspaces/${workspaceId}/workflows`),
    get: (id: string) => request<{ data: any }>(`/workflows/${id}`),
    create: (workspaceId: string, body: any) =>
      request<{ data: any }>(`/workspaces/${workspaceId}/workflows`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: any) =>
      request<{ data: any }>(`/workflows/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/workflows/${id}`, { method: "DELETE" }),
  },

  jobs: {
    run: (workspaceId: string, body: any) =>
      request<{ data: { jobId: string; status: string; estimatedCredits: number } }>(
        `/workspaces/${workspaceId}/jobs`,
        { method: "POST", body: JSON.stringify(body) }
      ),
    get: (id: string) => request<{ data: any }>(`/jobs/${id}`),
    list: (workspaceId: string) =>
      request<{ data: any[] }>(`/workspaces/${workspaceId}/jobs`),
  },

  nodes: {
    list: () => request<{ data: any[]; categories: any }>("/nodes"),
  },
};

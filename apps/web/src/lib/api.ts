const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as any).error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ─── Workflows ────────────────────────────────────────────────────────────────

export const api = {
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
};

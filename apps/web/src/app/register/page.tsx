"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", name: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.email.toLowerCase().endsWith("@haus.se")) {
      toast.error("Registration requires a @haus.se email address");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register({
        email: form.email,
        name: form.name,
        password: form.password,
      });
      setAuth(res.data.token, res.data.user, res.data.workspace);
      toast.success(`Welcome to haus-node, ${res.data.user.name}!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">haus-node</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold">Create account</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Requires a{" "}
          <span className="font-medium text-foreground">@haus.se</span>{" "}
          email address.{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in instead
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Work email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@haus.se"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  credits: number;
  monthlyCredits: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  isLoading: boolean;

  setAuth: (token: string, user: AuthUser, workspace: AuthWorkspace) => void;
  setWorkspace: (workspace: AuthWorkspace) => void;
  updateCredits: (credits: number) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      workspace: null,
      isLoading: false,

      setAuth: (token, user, workspace) =>
        set({ token, user, workspace }),

      setWorkspace: (workspace) =>
        set({ workspace }),

      updateCredits: (credits) =>
        set((state) => ({
          workspace: state.workspace ? { ...state.workspace, credits } : null,
        })),

      logout: () =>
        set({ token: null, user: null, workspace: null }),

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "haus-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        workspace: state.workspace,
      }),
    }
  )
);

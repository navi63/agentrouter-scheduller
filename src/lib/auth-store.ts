import { create } from "zustand";

interface AuthState {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  session: any | null;
  setSession: (session: any) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setSession: (session) => set({ user: session?.user || null, session }),
  clearSession: () => set({ user: null, session: null }),
}));

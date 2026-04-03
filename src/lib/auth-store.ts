import { create } from "zustand";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Session {
  user: SessionUser | null;
  expires: string;
}

interface AuthState {
  user: SessionUser | null;
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setSession: (session) => set({ user: session?.user || null, session }),
  clearSession: () => set({ user: null, session: null }),
}));

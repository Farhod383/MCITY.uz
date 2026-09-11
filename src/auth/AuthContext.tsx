import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Ctx {
  user: User | null;
  session: Session | null;
  /** sessiya hali tekshirilmoqda */
  loading: boolean;
  /** Supabase umuman ulanganmi */
  enabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** yashirin login oynasi ochiqmi */
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
}

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      enabled: isSupabaseConfigured,
      loginOpen,
      setLoginOpen,
      async signIn(email, password) {
        if (!supabase) return { error: "Supabase ulanmagan." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? error.message : null };
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, loading, loginOpen],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

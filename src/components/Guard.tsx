"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppState, type AppState } from "@/lib/store";

/**
 * Protege as telas internas: sem sessão → /login, sem onboarding → /onboarding.
 * Renderiza os filhos com o estado já hidratado.
 */
export function Guard({
  children,
  requireOnboarded = true,
}: {
  /** Com requireOnboarded=false o profile pode ser null (ainda no onboarding). */
  children: (s: AppState & { profile: NonNullable<AppState["profile"]> }) => ReactNode;
  requireOnboarded?: boolean;
}) {
  const s = useAppState();
  const router = useRouter();
  const ok = !!s?.session && (!requireOnboarded || !!s.profile?.onboarded);

  useEffect(() => {
    if (!s) return;
    if (!s.session) router.replace("/login");
    else if (requireOnboarded && !s.profile?.onboarded) router.replace("/onboarding");
  }, [s, router, requireOnboarded]);

  if (!s || !ok) return <Splash />;
  return <>{children(s as AppState & { profile: NonNullable<AppState["profile"]> })}</>;
}

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-soft border-t-primary" />
    </div>
  );
}

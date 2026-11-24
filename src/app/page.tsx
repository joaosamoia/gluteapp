"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { actions, useAppState } from "@/lib/store";
import { Splash } from "@/components/Guard";

export default function Root() {
  const s = useAppState();
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!s || done.current) return;
    done.current = true;
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      actions.seedDemo();
      router.replace("/home");
      return;
    }
    if (!s.session) router.replace("/login");
    else if (!s.profile?.onboarded) router.replace("/onboarding");
    else router.replace("/home");
  }, [s, router]);
  return <Splash />;
}

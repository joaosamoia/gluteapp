"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, LineChart, Gift, User } from "lucide-react";
import { APP_CONFIG } from "@/config";

export function BottomNav({ todayHref }: { todayHref: string }) {
  const path = usePathname();
  const items = [
    { href: "/home", label: "Jornada", icon: Home },
    { href: todayHref, label: "Treino", icon: Dumbbell, match: "/treino" },
    { href: "/progresso", label: "Progresso", icon: LineChart },
    ...(APP_CONFIG.bonusEnabled ? [{ href: "/bonus", label: "Bônus", icon: Gift }] : []),
    { href: "/perfil", label: "Perfil", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around rounded-[26px] bg-white/95 px-2 py-2 shadow-[0_-4px_30px_-10px_rgb(92_64_180/0.25)] backdrop-blur">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = path.startsWith(match ?? href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-semibold transition ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-xl transition ${active ? "bg-soft" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

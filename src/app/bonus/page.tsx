"use client";

import { Gift, Lock } from "lucide-react";
import { Guard } from "@/components/Guard";
import { BottomNav } from "@/components/BottomNav";
import { getCurrentDay } from "@/lib/store";
import { APP_CONFIG } from "@/config";

/** Área de bônus — vazia por enquanto, controlada por APP_CONFIG.bonusEnabled. */
const BONUS: { title: string; desc: string; emoji: string; available: boolean }[] = [
  { title: "Treino de férias", desc: "10 min, sem equipamento, pra fazer em qualquer lugar", emoji: "🏖️", available: false },
  { title: "Glúteo + abdômen", desc: "Treino extra de 15 min", emoji: "✨", available: false },
];

export default function BonusPage() {
  return (
    <Guard>
      {(s) => {
        const current = getCurrentDay(s);
        return (
          <main className="pb-32">
            <header className="px-6 pt-8">
              <h1 className="h-display text-[28px]">Bônus 🎁</h1>
              <p className="text-sm text-muted">Conteúdos extras pra você ir além.</p>
            </header>
            {!APP_CONFIG.bonusEnabled ? null : (
              <section className="mt-5 space-y-3 px-6">
                {BONUS.map((b) => (
                  <div key={b.title} className="card flex items-center gap-4 p-4">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-soft text-3xl">{b.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{b.title}</p>
                      <p className="text-sm text-muted">{b.desc}</p>
                    </div>
                    {!b.available && <span className="chip bg-[#f1eef7] text-muted"><Lock size={12} /> Em breve</span>}
                  </div>
                ))}
                <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-primary/25 p-8 text-center">
                  <Gift className="text-primary" />
                  <p className="mt-2 font-bold">Novidades chegando</p>
                  <p className="text-sm text-muted">A gente te avisa quando liberar. 💜</p>
                </div>
              </section>
            )}
            <BottomNav todayHref={current ? `/treino/${current}` : "/home"} />
          </main>
        );
      }}
    </Guard>
  );
}

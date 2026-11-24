"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Camera, Check } from "lucide-react";
import { Guard } from "@/components/Guard";
import { Confetti } from "@/components/Confetti";
import { Figure, Leaves } from "@/components/Figure";
import { actions, fileToResizedDataUrl, getStats, type Feeling } from "@/lib/store";
import { DAYS, TOTAL_DAYS, WORKOUT_INFO } from "@/data/program";

const FEELINGS: { id: Feeling; emoji: string; label: string }[] = [
  { id: "facil", emoji: "😌", label: "Fácil" },
  { id: "ok", emoji: "🙂", label: "Ok" },
  { id: "dificil", emoji: "🥵", label: "Difícil" },
];

export default function DonePage() {
  const { day: dayParam } = useParams<{ day: string }>();
  const day = Number(dayParam);
  return (
    <Guard>
      {(s) => {
        const prog = s.progress[day];
        const stats = getStats(s);
        const nextDay = day < TOTAL_DAYS ? day + 1 : null;
        const photoDay = day === 11 || day === 21 ? (day as 11 | 21) : null;
        const min = prog ? Math.max(1, Math.round(prog.durationSec / 60)) : DAYS[day - 1].minutos;
        return (
          <main className="flex min-h-dvh flex-col px-6 pb-8 pt-10">
            <Confetti />
            <div className="relative h-52 overflow-hidden rounded-[32px] bg-gradient-to-b from-[#efe8ff] to-[#dccffd]">
              <Leaves className="absolute bottom-0 left-3 h-24" />
              <Leaves className="absolute bottom-0 right-3 h-24" flip />
              <Figure pose="jump" className="absolute inset-x-12 bottom-1 animate-float" />
              <span className="absolute right-4 top-4 grid h-14 w-14 animate-pop place-items-center rounded-full bg-primary text-white shadow-btn">
                <Check strokeWidth={3.5} size={28} />
              </span>
            </div>

            <h1 className="h-display mt-6 animate-fade-up text-center text-[32px] leading-tight">
              Dia {day} concluído! 🎉
            </h1>
            <p className="mt-1 text-center text-muted">
              {WORKOUT_INFO[DAYS[day - 1].kind].titulo} feito. Você é mais forte do que ontem. 💜
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="card animate-pop p-3 text-center">
                <p className="text-2xl">
                  <span className="inline-block animate-flame">🔥</span>
                </p>
                <p className="font-display text-2xl font-extrabold">{stats.streak}</p>
                <p className="text-[11px] font-semibold text-muted">dias seguidos</p>
              </div>
              <div className="card animate-pop p-3 text-center [animation-delay:120ms]">
                <p className="text-2xl">⏱️</p>
                <p className="font-display text-2xl font-extrabold">{min}</p>
                <p className="text-[11px] font-semibold text-muted">minutos</p>
              </div>
              <div className="card animate-pop p-3 text-center [animation-delay:240ms]">
                <p className="text-2xl">🍑</p>
                <p className="font-display text-2xl font-extrabold">{stats.pct}%</p>
                <p className="text-[11px] font-semibold text-muted">do desafio</p>
              </div>
            </div>

            <div className="card mt-5 p-5">
              <p className="text-center font-bold">Como foi o treino de hoje?</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FEELINGS.map((f) => {
                  const sel = prog?.feeling === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => actions.setFeeling(day, f.id)}
                      className={`flex flex-col items-center rounded-2xl border-2 py-3 transition active:scale-95 ${
                        sel ? "border-primary bg-soft" : "border-line bg-white"
                      }`}
                    >
                      <span className={`text-3xl transition ${sel ? "scale-125" : ""}`}>{f.emoji}</span>
                      <span className={`mt-1 text-sm font-bold ${sel ? "text-primary" : "text-muted"}`}>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {photoDay && (
              <label className="card mt-4 flex cursor-pointer items-center gap-3 p-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-primary">
                  <Camera />
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{s.photos[photoDay] ? "Foto salva ✓" : `Tirar foto do Dia ${photoDay}`}</span>
                  <span className="block text-xs text-muted">Pra comparar com o Dia 1</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) actions.setPhoto(photoDay, await fileToResizedDataUrl(f));
                  }}
                />
              </label>
            )}

            <div className="mt-auto space-y-2 pt-6">
              {nextDay ? (
                <Link href={`/treino/${nextDay}`} className="btn-primary">
                  Ver amanhã →
                </Link>
              ) : (
                <Link href="/progresso" className="btn-primary">
                  Ver meu antes e depois 🏆
                </Link>
              )}
              <Link href="/home" className="block py-2 text-center text-sm font-semibold text-muted">
                Voltar pra jornada
              </Link>
            </div>
          </main>
        );
      }}
    </Guard>
  );
}

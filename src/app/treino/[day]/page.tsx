"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Dumbbell, Flame, Lock, Play, Repeat, Zap } from "lucide-react";
import { Guard } from "@/components/Guard";
import { Figure, Leaves } from "@/components/Figure";
import { ExerciseThumb } from "@/components/ExerciseMedia";
import { getWorkout, WORKOUT_INFO, PHASES, LEVEL_LABEL, formatPrescription, TOTAL_DAYS, type Pose } from "@/data/program";
import { getDayStatuses } from "@/lib/store";

const KIND_POSE: Record<string, Pose> = { A: "bridge", B: "quadruped", C: "lunge", descanso: "seated", teste: "bridge" };

export default function PreviewPage() {
  const { day: dayParam } = useParams<{ day: string }>();
  const day = Number(dayParam);
  return (
    <Guard>
      {(s) => {
        if (!(day >= 1 && day <= TOTAL_DAYS)) return <NotFound />;
        const status = getDayStatuses(s)[day - 1];
        const { plan, warmup, items, equipamentoNecessario } = getWorkout(day, s.profile.level, s.profile.equipment);
        const info = WORKOUT_INFO[plan.kind];
        const phase = PHASES[plan.phase - 1];
        const locked = status === "locked";
        return (
          <main className="pb-36">
            <div className="relative h-72 overflow-hidden rounded-b-[40px] bg-gradient-to-b from-[#efe8ff] to-[#dccffd]">
              <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/40" />
              <Leaves className="absolute bottom-0 left-3 h-28" />
              <Leaves className="absolute bottom-0 right-3 h-24" flip />
              <Figure pose={KIND_POSE[plan.kind]} className="absolute inset-x-8 bottom-2 animate-float" />
              <Link href="/home" className="absolute left-5 top-6 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 shadow-card" aria-label="Voltar">
                <ArrowLeft size={20} />
              </Link>
              <span className="absolute right-5 top-7 chip bg-white/90">
                Dia {day} · Fase {phase.id} {phase.nome}
              </span>
            </div>

            <section className="px-6 pt-6">
              <h1 className="h-display text-[30px] leading-tight">
                {info.titulo} {info.emoji}
              </h1>
              <p className="mt-1 text-muted">{info.foco}</p>
              {plan.plus2 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-bold text-[#c2612b]">
                  <Zap size={13} /> Hoje: +2 repetições em cada exercício
                </p>
              )}
              {plan.kind === "teste" && (
                <p className="mt-3 rounded-2xl bg-sun/30 p-3 text-sm text-[#6b5000]">
                  🏆 Hoje você repete o treino do Dia 1 pra comparar. Repara como ficou mais fácil! No final, tira a foto do Dia 21.
                </p>
              )}

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Info icon={<Clock size={18} />} value={`${plan.minutos} min`} label="Duração" />
                <Info icon={<Repeat size={18} />} value={`${items.length}`} label="Exercícios" />
                <Info icon={<Flame size={18} />} value={LEVEL_LABEL[s.profile.level]} label="Nível" />
              </div>

              <div className="card mt-5 p-4">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <Dumbbell size={16} className="text-primary" /> Você vai precisar de
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {equipamentoNecessario.map((e) => (
                    <span key={e} className="chip">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {warmup.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Aquecimento · 3 min</h2>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {warmup.map((w) => (
                      <div key={w.exerciseId} className="flex min-w-[130px] items-center gap-2 rounded-2xl bg-white p-2 pr-3 shadow-card">
                        <ExerciseThumb exercise={w.exercise} className="h-10 w-10" />
                        <span className="text-xs font-semibold leading-tight">{w.nomeExibido}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-muted">{plan.kind === "descanso" ? "Mobilidade" : "Treino"}</h2>
              <ol className="mt-2 space-y-3">
                {items.map((it, i) => (
                  <li key={i} className="card flex items-center gap-3 p-3">
                    <ExerciseThumb exercise={it.exercise} className="h-16 w-16" />
                    <div className="min-w-0 flex-1">
                      {it.finalizador && <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e0613a]">Finalizador</span>}
                      <p className="font-bold leading-tight">{it.nomeExibido}</p>
                      <p className="mt-0.5 text-sm font-semibold text-primary">{formatPrescription(it)}</p>
                      {it.nota && <p className="mt-0.5 text-xs text-muted">{it.nota}</p>}
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-soft-2 text-xs font-bold text-muted">{i + 1}</span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] bg-gradient-to-t from-bg via-bg to-transparent px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-8">
              {locked ? (
                <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ece8f5] font-bold text-muted">
                  <Lock size={18} /> Libera em breve
                </div>
              ) : (
                <Link href={`/treino/${day}/play`} className="btn-primary">
                  <Play size={20} fill="currentColor" /> {status === "done" ? "Refazer treino" : "Começar treino"}
                </Link>
              )}
            </div>
          </main>
        );
      }}
    </Guard>
  );
}

function Info({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex flex-col items-center p-3 text-center">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft text-primary">{icon}</span>
      <span className="mt-1.5 text-sm font-bold">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="h-display text-2xl">Dia não encontrado</p>
        <Link href="/home" className="btn-soft mt-4">
          Voltar pra jornada
        </Link>
      </div>
    </main>
  );
}

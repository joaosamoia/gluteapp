"use client";

import Link from "next/link";
import { Check, Clock, Lock, Play, Trophy } from "lucide-react";
import { Guard } from "@/components/Guard";
import { BottomNav } from "@/components/BottomNav";
import { Figure, Leaves } from "@/components/Figure";
import { DAYS, PHASES, WORKOUT_INFO, TOTAL_DAYS, type Pose } from "@/data/program";
import { getCurrentDay, getDayStatuses, getStats, type AppState, type DayStatus } from "@/lib/store";
import { APP_CONFIG } from "@/config";

const KIND_POSE: Record<string, Pose> = { A: "bridge", B: "side", C: "squat", descanso: "seated", teste: "bridge" };

export default function HomePage() {
  return <Guard>{(s) => <Home s={s} />}</Guard>;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Home({ s }: { s: AppState & { profile: NonNullable<AppState["profile"]> } }) {
  const statuses = getDayStatuses(s);
  const current = getCurrentDay(s);
  const stats = getStats(s);
  const plan = current ? DAYS[current - 1] : null;
  const info = plan ? WORKOUT_INFO[plan.kind] : null;
  const allDone = stats.completed === TOTAL_DAYS;

  return (
    <main className="pb-32">
      <header className="flex items-center justify-between px-6 pt-8">
        <div>
          <p className="text-sm font-semibold text-muted">
            {greeting()}, {s.profile.name}! 👋
          </p>
          <h1 className="h-display mt-0.5 text-[26px]">
            {allDone ? "Você completou! 🏆" : current ? `Bora, dia ${current}! 🍑` : "Descansa, amanhã tem mais 💜"}
          </h1>
        </div>
        <Link
          href="/perfil"
          className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#c3afff] to-primary text-lg font-bold text-white shadow-card"
        >
          {s.profile.name.charAt(0).toUpperCase()}
        </Link>
      </header>

      {s.session?.isDemo && (
        <div className="mx-6 mt-3 rounded-2xl bg-sun/30 px-3 py-2 text-center text-xs font-semibold text-[#7a5b00]">
          ✨ Modo demo — dados de exemplo
        </div>
      )}

      {/* Stats */}
      <section className="mt-5 grid grid-cols-3 gap-3 px-6">
        <Stat label="Sequência" value={`${stats.streak}`} unit={stats.streak === 1 ? "dia" : "dias"} icon={<span className="inline-block animate-flame">🔥</span>} tint="bg-[#fff1e8]" />
        <Stat label="Concluído" value={`${stats.pct}`} unit="%" icon={<Ring pct={stats.pct} />} tint="bg-soft" />
        <Stat label="Treinados" value={`${stats.totalMin}`} unit="min" icon={<span>⏱️</span>} tint="bg-[#e8f8f0]" />
      </section>

      {/* Treino de hoje */}
      {plan && info && (
        <section className="mt-5 px-6">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#f1ebff] via-[#e8defe] to-[#dacdfd] p-5 shadow-card">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40" />
            <Leaves className="absolute bottom-0 right-1 h-20 opacity-80" flip />
            <div className="relative z-10 w-[58%]">
              <span className="chip bg-white/80">Treino de hoje</span>
              <h2 className="h-display mt-3 text-[26px] leading-tight">{info.titulo}</h2>
              <p className="mt-1 text-sm text-ink/70">{info.foco}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Clock size={15} /> {plan.minutos} min · Dia {plan.day}
              </p>
            </div>
            <Figure pose={KIND_POSE[plan.kind]} className="absolute -right-2 top-14 w-[52%]" />
            <Link href={`/treino/${plan.day}`} className="btn-primary relative z-10 mt-5">
              <Play size={20} fill="currentColor" /> Começar
            </Link>
          </div>
        </section>
      )}

      {allDone && (
        <section className="mt-5 px-6">
          <Link href="/progresso" className="card flex items-center gap-4 p-5">
            <Trophy className="text-sun" size={36} />
            <div>
              <p className="font-bold">21 dias concluídos!</p>
              <p className="text-sm text-muted">Veja seu antes e depois →</p>
            </div>
          </Link>
        </section>
      )}

      {/* Jornada */}
      <section className="mt-8 px-6">
        <div className="flex items-end justify-between">
          <h2 className="h-display text-xl">Sua jornada</h2>
          <span className="text-sm font-semibold text-muted">
            {stats.completed}/{TOTAL_DAYS} dias
          </span>
        </div>

        {PHASES.map((phase) => {
          const doneInPhase = phase.dias.filter((d) => statuses[d - 1] === "done").length;
          const phaseLocked = phase.dias.every((d) => statuses[d - 1] === "locked");
          return (
            <div key={phase.id} className="mt-5">
              <div className={`card flex items-center gap-3 p-4 ${phaseLocked ? "opacity-70" : ""}`}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl font-display text-lg font-extrabold text-white" style={{ background: phase.cor }}>
                  {phase.id}
                </span>
                <div className="flex-1">
                  <p className="font-bold">
                    Fase {phase.id} · {phase.nome}
                  </p>
                  <p className="text-xs text-muted">
                    {phase.subtitulo} · {phase.minutos} min
                  </p>
                </div>
                <span className="text-xs font-bold text-primary">{doneInPhase}/7</span>
              </div>
              <Trail days={phase.dias} statuses={statuses} />
            </div>
          );
        })}

        <p className="mt-6 text-center text-xs text-muted">
          {APP_CONFIG.unlockMode === "calendar"
            ? "Um novo dia é liberado a cada dia de calendário."
            : "O próximo dia libera quando você conclui o anterior."}
        </p>
      </section>

      <BottomNav todayHref={current ? `/treino/${current}` : "/home"} />
    </main>
  );
}

const OFFSETS = [0, 62, 88, 50, -10, -66, -88];

function Trail({ days, statuses }: { days: number[]; statuses: DayStatus[] }) {
  const H = 84;
  const W = 280;
  const pts = days.map((_, i) => [W / 2 + OFFSETS[i], 46 + i * H]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `Q ${pts[i - 1][0]} ${(pts[i - 1][1] + p[1]) / 2 + 10} ${p[0]} ${p[1]}`)).join(" ");
  return (
    <div className="relative mx-auto" style={{ width: W, height: 46 + (days.length - 1) * H + 50 }}>
      <svg className="absolute inset-0" width={W} height="100%">
        <path d={d} fill="none" stroke="#e1d8fb" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 18" />
      </svg>
      {days.map((day, i) => {
        const st = statuses[day - 1];
        const plan = DAYS[day - 1];
        const info = WORKOUT_INFO[plan.kind];
        const [x, y] = pts[i];
        const labelLeft = OFFSETS[i] > 20;
        const node = <DayNode day={day} status={st} emoji={info.emoji} />;
        return (
          <div key={day} className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
            {st === "locked" ? node : <Link href={`/treino/${day}`}>{node}</Link>}
            <span
              className={`absolute top-1/2 w-24 -translate-y-1/2 text-[11px] font-semibold leading-tight ${
                labelLeft ? "right-full mr-3 text-right" : "left-full ml-3"
              } ${st === "locked" ? "text-muted/60" : "text-muted"}`}
            >
              {info.titulo}
              {plan.plus2 && <span className="block text-primary">+2 reps</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DayNode({ day, status, emoji }: { day: number; status: DayStatus; emoji: string }) {
  if (status === "done")
    return (
      <span className="grid h-14 w-14 animate-pop place-items-center rounded-full bg-primary text-white shadow-btn">
        <Check strokeWidth={3} />
      </span>
    );
  if (status === "current")
    return (
      <span className="relative grid h-[72px] w-[72px] place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
        <span className="relative grid h-[72px] w-[72px] place-items-center rounded-full border-4 border-white bg-gradient-to-br from-[#a98cf3] to-primary text-white shadow-btn">
          <span className="text-center leading-none">
            <span className="block text-lg">{emoji}</span>
            <span className="block font-display text-sm font-extrabold">Dia {day}</span>
          </span>
        </span>
        <span className="absolute -top-7 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-white">HOJE</span>
      </span>
    );
  if (status === "unlocked")
    return (
      <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary/40 bg-white font-display text-lg font-bold text-primary shadow-card">
        {day}
      </span>
    );
  return (
    <span className="grid h-14 w-14 place-items-center rounded-full bg-[#ece8f5] text-muted/70">
      <span className="text-center leading-none">
        <Lock size={16} className="mx-auto" />
        <span className="mt-0.5 block text-[11px] font-bold">{day}</span>
      </span>
    </span>
  );
}

function Stat({ label, value, unit, icon, tint }: { label: string; value: string; unit: string; icon: React.ReactNode; tint: string }) {
  return (
    <div className="card p-3">
      <span className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${tint}`}>{icon}</span>
      <p className="mt-2 font-display text-2xl font-extrabold leading-none">
        {value}
        <span className="ml-0.5 text-xs font-bold text-muted">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] font-semibold text-muted">{label}</p>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 -rotate-90">
      <circle cx="16" cy="16" r={r} fill="none" stroke="#ddd2fd" strokeWidth="5" />
      <circle cx="16" cy="16" r={r} fill="none" stroke="#7c5ce0" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
    </svg>
  );
}

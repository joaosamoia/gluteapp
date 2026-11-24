"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Lightbulb, Pause, Play, RefreshCw, SkipForward, X } from "lucide-react";
import { Guard } from "@/components/Guard";
import { ExerciseMedia, ExerciseThumb } from "@/components/ExerciseMedia";
import { EXERCISES, getWorkout, type Equipment, type Level, type ResolvedItem, resolveVariation, TOTAL_DAYS } from "@/data/program";
import { actions } from "@/lib/store";
import { beep, unlockAudio } from "@/lib/feedback";
import { APP_CONFIG } from "@/config";

interface Step {
  item: ResolvedItem;
  /** índice do exercício dentro do bloco (aquecimento ou treino) */
  exIndex: number;
  exTotal: number;
  warmup: boolean;
  serie: number;
  side?: "direito" | "esquerdo";
}

export default function PlayerPage() {
  const { day: dayParam } = useParams<{ day: string }>();
  const day = Number(dayParam);
  return <Guard>{(s) => (day >= 1 && day <= TOTAL_DAYS ? <Player day={day} level={s.profile.level} equipment={s.profile.equipment} /> : null)}</Guard>;
}

function buildSteps(warmup: ResolvedItem[], items: ResolvedItem[]): Step[] {
  const steps: Step[] = [];
  const push = (list: ResolvedItem[], isWarmup: boolean) =>
    list.forEach((item, exIndex) => {
      for (let serie = 1; serie <= item.series; serie++) {
        const timedPerSide = item.exercise.tipo === "tempo" && item.seconds !== undefined && item.porLado;
        if (timedPerSide) {
          steps.push({ item, exIndex, exTotal: list.length, warmup: isWarmup, serie, side: "direito" });
          steps.push({ item, exIndex, exTotal: list.length, warmup: isWarmup, serie, side: "esquerdo" });
        } else steps.push({ item, exIndex, exTotal: list.length, warmup: isWarmup, serie });
      }
    });
  push(warmup, true);
  push(items, false);
  return steps;
}

type Mode = "exercise" | "rest";

function Player({ day, level, equipment }: { day: number; level: Level; equipment: Equipment }) {
  const router = useRouter();
  const { plan, warmup, items } = useMemo(() => getWorkout(day, level, equipment), [day, level, equipment]);
  const steps = useMemo(() => buildSteps(warmup, items), [warmup, items]);
  const isMobility = plan.kind === "descanso";

  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("exercise");
  const [restTotal, setRestTotal] = useState(0);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(() => steps[0].item.seconds ?? 0); // segundos restantes (exercício ou descanso)
  const [swaps, setSwaps] = useState<Record<string, string>>({}); // exerciseId -> alternativa
  const [sheet, setSheet] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const startedAt = useRef<number | null>(null);
  const endAt = useRef<number | null>(null);

  const step = steps[idx];
  const swappedId = swaps[step.item.exerciseId];
  const exercise = swappedId ? EXERCISES[swappedId] : step.item.exercise;
  const nome = swappedId ? resolveVariation(exercise, equipment).nome : step.item.nomeExibido;
  const isTimed = step.item.seconds !== undefined;

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  /** vai para um passo (modo exercício) e prepara o timer dele */
  const goTo = useCallback(
    (i: number) => {
      setMode("exercise");
      setRunning(false);
      endAt.current = null;
      setLeft(steps[i].item.seconds ?? 0);
      setIdx(i);
    },
    [steps],
  );

  const finishWorkout = useCallback(() => {
    const dur = Math.round((Date.now() - (startedAt.current ?? Date.now())) / 1000);
    actions.completeDay(day, Math.max(dur, 60));
    router.replace(`/treino/${day}/concluido`);
  }, [day, router]);

  const goNextStep = useCallback(() => {
    if (idx + 1 >= steps.length) return finishWorkout();
    goTo(idx + 1);
  }, [idx, steps.length, finishWorkout, goTo]);

  /** conclui o passo atual e entra no descanso (ou avança) */
  const completeStep = useCallback(() => {
    if (idx + 1 >= steps.length) return finishWorkout();
    const next = steps[idx + 1];
    let rest: number;
    if (step.warmup || isMobility) rest = 5; // "prepare-se"
    else if (next.item === step.item) rest = step.side === "direito" ? 5 : APP_CONFIG.restSeconds[plan.phase];
    else if (next.warmup === false && step.warmup === false) rest = APP_CONFIG.restBetweenExercises;
    else rest = 10;
    setMode("rest");
    setRestTotal(rest);
    setLeft(rest);
    endAt.current = Date.now() + rest * 1000;
    setRunning(true);
  }, [idx, steps, step, isMobility, plan.phase, finishWorkout]);

  // tick
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const rem = Math.max(0, Math.ceil(((endAt.current ?? Date.now()) - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(t);
        setRunning(false);
        beep(mode === "rest" ? 2 : 3);
        if (mode === "rest") {
          goNextStep();
        } else completeStep();
      }
    }, 200);
    return () => clearInterval(t);
  }, [running, mode, goNextStep, completeStep]);

  const startPause = () => {
    unlockAudio();
    if (running) {
      setRunning(false);
      endAt.current = null;
    } else {
      endAt.current = Date.now() + left * 1000;
      setRunning(true);
    }
  };

  const jumpExercise = (dir: 1 | -1) => {
    // vai para o 1º passo do exercício anterior/seguinte
    const key = (s: Step) => `${s.warmup}-${s.exIndex}`;
    const cur = key(step);
    let i = idx;
    if (dir === 1) {
      while (i < steps.length && key(steps[i]) === cur) i++;
      if (i >= steps.length) return finishWorkout();
    } else {
      while (i > 0 && key(steps[i]) === cur) i--;
      if (key(steps[i]) === cur) return;
      const prevKey = key(steps[i]);
      while (i > 0 && key(steps[i - 1]) === prevKey) i--;
    }
    goTo(i);
  };

  const progress = (idx + (mode === "rest" ? 1 : 0)) / steps.length;
  const next = steps[idx + 1];
  const tips = [...(step.item.dicaVariacao && !swappedId ? [step.item.dicaVariacao] : []), ...exercise.dicas].slice(0, 3);
  const alt = exercise.alternativaMaisFacil;
  const altExercise = EXERCISES[alt];

  return (
    <main className="flex min-h-dvh flex-col pb-36">
      {/* topo */}
      <header className="sticky top-0 z-20 bg-bg/90 px-5 pb-3 pt-5 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => setConfirmExit(true)} className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-card" aria-label="Sair">
            <X size={20} />
          </button>
          <div className="flex-1 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {step.warmup ? "Aquecimento" : isMobility ? "Mobilidade" : `Dia ${day}`}
            </p>
            <p className="text-sm font-bold">
              {step.warmup ? "Movimento" : "Exercício"} {step.exIndex + 1} de {step.exTotal}
            </p>
          </div>
          <span className="grid h-10 min-w-10 place-items-center rounded-2xl bg-soft px-2 text-xs font-bold text-primary">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gradient-to-r from-[#a98cf3] to-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      <section key={`${idx}-${swappedId}`} className="animate-fade-up px-5">
        <ExerciseMedia exercise={exercise} className="h-60" />

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            {step.item.finalizador && <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#e0613a]">🔥 Finalizador</span>}
            <h1 className="h-display text-[26px] leading-tight">{nome}</h1>
            <p className="text-sm text-muted">{exercise.musculo}</p>
          </div>
          {step.item.series > 1 && (
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-[11px] font-bold uppercase text-muted">Série</span>
              <span className="font-display text-xl font-extrabold">
                {step.serie}
                <span className="text-muted">/{step.item.series}</span>
              </span>
            </div>
          )}
        </div>

        {step.item.nota && <p className="mt-2 rounded-xl bg-soft px-3 py-2 text-sm font-semibold text-primary">⚡ {step.item.nota}</p>}

        {/* bloco central: reps ou timer */}
        <div className="card mt-4 flex items-center gap-4 p-4">
          {isTimed ? (
            <TimerRing total={step.item.seconds!} left={left} />
          ) : (
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#efe8ff] to-[#ddd0fd]">
              <span className="text-center leading-none">
                <span className="block font-display text-4xl font-extrabold text-primary">{step.item.reps}</span>
                <span className="text-[11px] font-bold text-muted">{step.item.unidade ?? "reps"}</span>
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold">
              {isTimed
                ? step.side
                  ? `Lado ${step.side}`
                  : running
                    ? "Segura firme! 💪"
                    : "Quando estiver pronta, aperta o play"
                : step.item.porLado
                  ? `${step.item.reps} ${step.item.unidade ?? "reps"} de cada lado`
                  : `${step.item.reps} ${step.item.unidade ?? "repetições"}`}
            </p>
            <SeriesDots total={step.item.series} current={step.serie} />
          </div>
        </div>

        {/* dicas */}
        <div className="mt-4 space-y-2">
          {tips.map((t, i) => (
            <p key={i} className="flex gap-2.5 text-[15px]">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-primary" /> {t}
            </p>
          ))}
        </div>
        <div className="mt-4 flex gap-2.5 rounded-2xl bg-[#fff1e8] p-3 text-sm text-[#8a4b26]">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            <b>Erro comum:</b> {exercise.erroComum}
          </p>
        </div>

        <button onClick={() => setSheet(true)} className="mt-4 w-full py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Não consigo fazer esse 😅
        </button>
      </section>

      {/* barra de ações */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => jumpExercise(-1)} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white shadow-card disabled:opacity-40" disabled={idx === 0} aria-label="Anterior">
            <ChevronLeft />
          </button>
          {isTimed ? (
            <button onClick={startPause} className="btn-primary">
              {running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              {running ? "Pausar" : left < (step.item.seconds ?? 0) ? "Continuar" : "Iniciar timer"}
            </button>
          ) : (
            <button
              onClick={() => {
                unlockAudio();
                completeStep();
              }}
              className="btn-primary"
            >
              <Check size={22} strokeWidth={3} /> Série feita
            </button>
          )}
          <button onClick={() => jumpExercise(1)} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white shadow-card" aria-label="Próximo">
            <ChevronRight />
          </button>
        </div>
      </div>

      {mode === "rest" && (
        <RestOverlay
          total={restTotal}
          left={left}
          label={step.warmup || isMobility || step.side === "direito" ? "Prepare-se" : "Descansa"}
          next={next}
          nextName={next ? (swaps[next.item.exerciseId] ? EXERCISES[swaps[next.item.exerciseId]].nome : next.item.nomeExibido) : ""}
          onAdd={() => {
            endAt.current = (endAt.current ?? Date.now()) + 15000;
            setRestTotal((t) => t + 15);
            setLeft((l) => l + 15);
          }}
          onSkip={() => {
            setRunning(false);
            goNextStep();
          }}
        />
      )}

      {sheet && (
        <Sheet onClose={() => setSheet(false)}>
          <h3 className="h-display text-xl">Tudo bem, vamos adaptar 💜</h3>
          <p className="mt-1 text-sm text-muted">O importante é fazer bem feito, não fazer o mais difícil.</p>
          {altExercise ? (
            <div className="card mt-4 flex items-center gap-3 p-3">
              <ExerciseThumb exercise={altExercise} className="h-16 w-16" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase text-muted">Versão mais fácil</p>
                <p className="font-bold">{resolveVariation(altExercise, equipment).nome}</p>
                <p className="text-sm text-primary">Mesmas séries e repetições</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-soft p-4">
              <p className="text-xs font-bold uppercase text-muted">Faça assim</p>
              <p className="mt-1 font-semibold">{alt}</p>
            </div>
          )}
          <div className="mt-5 space-y-2">
            {altExercise ? (
              <button
                className="btn-primary"
                onClick={() => {
                  setSwaps((s) => ({ ...s, [step.item.exerciseId]: alt }));
                  setSheet(false);
                }}
              >
                <RefreshCw size={18} /> Trocar por esse
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setSheet(false)}>
                Combinado!
              </button>
            )}
            {swappedId && (
              <button
                className="btn-soft w-full"
                onClick={() => {
                  setSwaps((prev) => {
                    const rest = { ...prev };
                    delete rest[step.item.exerciseId];
                    return rest;
                  });
                  setSheet(false);
                }}
              >
                Voltar pro exercício original
              </button>
            )}
            <button className="w-full py-2 text-sm font-semibold text-muted" onClick={() => { setSheet(false); jumpExercise(1); }}>
              Pular esse exercício
            </button>
          </div>
        </Sheet>
      )}

      {confirmExit && (
        <Sheet onClose={() => setConfirmExit(false)}>
          <h3 className="h-display text-xl">Sair do treino?</h3>
          <p className="mt-1 text-sm text-muted">Seu progresso de hoje não vai ser salvo. Falta pouco! 💪</p>
          <div className="mt-5 space-y-2">
            <button className="btn-primary" onClick={() => setConfirmExit(false)}>
              Continuar treinando
            </button>
            <button className="w-full py-3 text-sm font-semibold text-muted" onClick={() => router.push(`/treino/${day}`)}>
              Sair mesmo assim
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}

function SeriesDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div className="mt-2 flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-full transition ${i + 1 < current ? "bg-primary" : i + 1 === current ? "bg-primary/50" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

function TimerRing({ total, left, size = 96, light = false }: { total: number; left: number; size?: number; light?: boolean }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = total ? left / total : 0;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={light ? "rgb(255 255 255 / 0.25)" : "#ece6fa"} strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={light ? "#fff" : "#7c5ce0"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
          className="transition-[stroke-dasharray] duration-200"
        />
      </svg>
      <span className={`absolute inset-0 grid place-items-center font-display font-extrabold ${light ? "text-white" : "text-primary"}`} style={{ fontSize: size * 0.26 }}>
        {mm > 0 ? `${mm}:${ss}` : left}
      </span>
    </div>
  );
}

function RestOverlay({
  total,
  left,
  label,
  next,
  nextName,
  onAdd,
  onSkip,
}: {
  total: number;
  left: number;
  label: string;
  next?: Step;
  nextName: string;
  onAdd: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] animate-fade-up flex-col items-center bg-gradient-to-b from-[#8f71ea] to-[#5f3fd0] px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-16 text-white">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">{label}</p>
      <p className="h-display mt-1 text-3xl">{label === "Descansa" ? "Respira fundo 😮‍💨" : "Bora pro próximo!"}</p>
      <div className="my-10">
        <TimerRing total={total} left={left} size={220} light />
      </div>
      <div className="flex w-full gap-3">
        <button onClick={onAdd} className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-white/15 font-bold backdrop-blur active:scale-95">
          +15s
        </button>
        <button onClick={onSkip} className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-2xl bg-white font-bold text-primary active:scale-95">
          <SkipForward size={20} /> Pular descanso
        </button>
      </div>
      {next && (
        <div className="mt-auto flex w-full items-center gap-3 rounded-3xl bg-white/12 p-3 backdrop-blur" style={{ background: "rgb(255 255 255 / 0.12)" }}>
          <ExerciseThumb exercise={next.item.exercise} className="h-14 w-14 bg-white/90" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/70">A seguir</p>
            <p className="font-bold leading-tight">{nextName}</p>
            <p className="text-xs text-white/80">
              {next.side ? `Lado ${next.side}` : next.item.series > 1 ? `Série ${next.serie} de ${next.item.series}` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end bg-ink/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full animate-fade-up rounded-t-[32px] bg-white p-6 pb-[max(24px,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

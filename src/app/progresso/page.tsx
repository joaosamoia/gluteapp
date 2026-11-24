"use client";

import { useState } from "react";
import { Camera, Lock, Plus, Ruler } from "lucide-react";
import { Guard } from "@/components/Guard";
import { BottomNav } from "@/components/BottomNav";
import { actions, fileToResizedDataUrl, getCurrentDay, getDayStatuses, getStats, type AppState, type Measurement } from "@/lib/store";
import { PHASES, TOTAL_DAYS } from "@/data/program";

const FEELING_EMOJI = { facil: "😌", ok: "🙂", dificil: "🥵" } as const;

export default function ProgressPage() {
  return <Guard>{(s) => <Progress s={s} />}</Guard>;
}

function Progress({ s }: { s: AppState }) {
  const stats = getStats(s);
  const statuses = getDayStatuses(s);
  const current = getCurrentDay(s);
  const [hip, setHip] = useState("");

  return (
    <main className="pb-32">
      <header className="px-6 pt-8">
        <h1 className="h-display text-[28px]">Meu progresso</h1>
        <p className="text-sm text-muted">Cada treino conta. Olha o quanto você já fez! ✨</p>
      </header>

      <section className="mt-5 grid grid-cols-3 gap-3 px-6">
        <Big emoji="🔥" value={stats.streak} label="dias seguidos" />
        <Big emoji="⏱️" value={stats.totalMin} label="minutos" />
        <Big emoji="✅" value={`${stats.completed}/${TOTAL_DAYS}`} label="dias feitos" />
      </section>

      {/* Calendário */}
      <section className="card mx-6 mt-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Calendário dos 21 dias</h2>
          <span className="chip">{stats.pct}%</span>
        </div>
        <div className="mt-4 space-y-3">
          {PHASES.map((p) => (
            <div key={p.id}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                Fase {p.id} · {p.nome}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {p.dias.map((d) => {
                  const st = statuses[d - 1];
                  const pr = s.progress[d];
                  return (
                    <div
                      key={d}
                      className={`relative grid aspect-square place-items-center rounded-xl text-sm font-bold ${
                        st === "done"
                          ? "bg-primary text-white"
                          : st === "current"
                            ? "bg-white text-primary ring-2 ring-primary"
                            : st === "unlocked"
                              ? "bg-soft text-primary"
                              : "bg-[#f1eef7] text-muted/50"
                      }`}
                    >
                      {st === "locked" ? <Lock size={12} /> : d}
                      {pr?.feeling && <span className="absolute -right-1 -top-1.5 text-xs">{FEELING_EMOJI[pr.feeling]}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {current && <p className="mt-3 text-center text-xs text-muted">Próximo: Dia {current}</p>}
      </section>

      {/* Fotos */}
      <section className="mx-6 mt-5">
        <h2 className="font-bold">Antes e depois</h2>
        <p className="text-xs text-muted">Privadas · só você vê</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {([1, 11, 21] as const).map((d) => (
            <PhotoSlot key={d} day={d} src={s.photos[d]} />
          ))}
        </div>
      </section>

      {/* Medida */}
      <section className="card mx-6 mt-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Ruler size={18} className="text-primary" /> Medida do quadril
          </h2>
          {s.measurements.length > 1 && <Delta ms={s.measurements} />}
        </div>
        {s.measurements.length > 0 ? (
          <HipChart ms={s.measurements} />
        ) : (
          <p className="mt-3 text-sm text-muted">Adicione sua primeira medida pra acompanhar a evolução.</p>
        )}
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = parseFloat(hip.replace(",", "."));
            if (v > 40 && v < 250) {
              actions.addMeasurement(v);
              setHip("");
            }
          }}
        >
          <div className="flex h-12 flex-1 items-center rounded-2xl border-2 border-line px-3 focus-within:border-primary">
            <input
              inputMode="decimal"
              value={hip}
              onChange={(e) => setHip(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="Medida de hoje"
              className="w-full bg-transparent outline-none"
            />
            <span className="text-sm font-bold text-muted">cm</span>
          </div>
          <button className="btn-soft h-12 px-4" aria-label="Adicionar medida">
            <Plus size={18} /> Salvar
          </button>
        </form>
      </section>

      <BottomNav todayHref={current ? `/treino/${current}` : "/home"} />
    </main>
  );
}

function Big({ emoji, value, label }: { emoji: string; value: number | string; label: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-xl">{emoji}</p>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold text-muted">{label}</p>
    </div>
  );
}

function PhotoSlot({ day, src }: { day: 1 | 11 | 21; src?: string }) {
  return (
    <label className="block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-dashed border-primary/25 bg-soft-2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`Dia ${day}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-primary/60">
            <Camera size={22} />
          </div>
        )}
      </div>
      <p className="mt-1.5 text-center text-xs font-bold">Dia {day}</p>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) actions.setPhoto(day, await fileToResizedDataUrl(f));
        }}
      />
    </label>
  );
}

function Delta({ ms }: { ms: Measurement[] }) {
  const d = ms[ms.length - 1].hipCm - ms[0].hipCm;
  const txt = `${d > 0 ? "+" : ""}${d.toFixed(1).replace(".", ",")} cm`;
  return <span className="chip">{txt}</span>;
}

function HipChart({ ms }: { ms: Measurement[] }) {
  const W = 300;
  const H = 130;
  const pad = { l: 30, r: 12, t: 16, b: 24 };
  const vals = ms.map((m) => m.hipCm);
  const min = Math.floor(Math.min(...vals) - 1);
  const max = Math.ceil(Math.max(...vals) + 1);
  const x = (i: number) => pad.l + (ms.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (ms.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const pts = ms.map((m, i) => [x(i), y(m.hipCm)] as const);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${H - pad.b} L${pts[0][0]},${H - pad.b} Z`;
  const fmt = (d: string) => d.slice(8, 10) + "/" + d.slice(5, 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
      <defs>
        <linearGradient id="hipfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7c5ce0" stopOpacity="0.25" />
          <stop offset="1" stopColor="#7c5ce0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[min, (min + max) / 2, max].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#ece6fa" strokeDasharray="3 4" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#8a82a3">
            {Math.round(v)}
          </text>
        </g>
      ))}
      {ms.length > 1 && <path d={area} fill="url(#hipfill)" />}
      {ms.length > 1 && <path d={path} fill="none" stroke="#7c5ce0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map(([px, py], i) => (
        <g key={ms[i].id}>
          <circle cx={px} cy={py} r="4.5" fill="#fff" stroke="#7c5ce0" strokeWidth="2.5" />
          <text x={px} y={H - 8} textAnchor="middle" fontSize="9" fill="#8a82a3">
            {fmt(ms[i].date)}
          </text>
          {i === pts.length - 1 && (
            <text x={px} y={py - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#251c3b">
              {String(ms[i].hipCm).replace(".", ",")}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { APP_CONFIG } from "@/config";
import { DAYS, TOTAL_DAYS, type Equipment, type Level } from "@/data/program";

/**
 * Estado local do app (protótipo).
 * Espelha o modelo do Firestore descrito no README:
 *   users/{uid}, users/{uid}/progress/{day}, users/{uid}/measurements/{id}
 * Em produção, troque as ações abaixo por chamadas ao Firestore/Storage (src/lib/firebase.ts).
 */

export type Feeling = "facil" | "ok" | "dificil";

export interface Profile {
  name: string;
  email: string;
  level: Level;
  equipment: Equipment;
  startDate: string; // YYYY-MM-DD
  reminderTime: string | null;
  onboarded: boolean;
  disclaimerAccepted: boolean;
}

export interface DayProgress {
  completedAt: string; // ISO
  feeling: Feeling | null;
  durationSec: number;
}

export interface Measurement {
  id: string;
  date: string; // YYYY-MM-DD
  hipCm: number;
}

export interface AppState {
  session: { email: string; isDemo: boolean } | null;
  profile: Profile | null;
  progress: Record<number, DayProgress>;
  measurements: Measurement[];
  photos: Partial<Record<1 | 11 | 21, string>>;
}

const KEY = "gluteo21:v1";
const EMPTY: AppState = { session: null, profile: null, progress: {}, measurements: [], photos: {} };

let cache: AppState | null = null;
const listeners = new Set<() => void>();

function read(): AppState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: AppState) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("Não foi possível salvar no localStorage", e);
  }
  listeners.forEach((l) => l());
}

export function setState(fn: (s: AppState) => AppState) {
  write(fn(read()));
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Retorna null durante o SSR / antes da hidratação. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------

export const toISODate = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const today = () => toISODate(new Date());
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(a + "T12:00:00").getTime() - new Date(b + "T12:00:00").getTime()) / 86400000);

// ---------------------------------------------------------------------------
// Derivados
// ---------------------------------------------------------------------------

export type DayStatus = "done" | "current" | "unlocked" | "locked";

export function getDayStatuses(s: AppState): DayStatus[] {
  const done = (d: number) => !!s.progress[d];
  let maxUnlocked: number;
  if (APP_CONFIG.unlockMode === "calendar" && s.profile) {
    maxUnlocked = Math.min(TOTAL_DAYS, dayDiff(today(), s.profile.startDate) + 1);
  } else {
    maxUnlocked = 1;
    while (maxUnlocked < TOTAL_DAYS && done(maxUnlocked)) maxUnlocked++;
  }
  const current = DAYS.find((d) => !done(d.day) && d.day <= maxUnlocked)?.day ?? null;
  return DAYS.map(({ day }) => {
    if (done(day)) return "done";
    if (day === current) return "current";
    if (day <= maxUnlocked) return "unlocked";
    return "locked";
  });
}

export function getCurrentDay(s: AppState): number | null {
  const st = getDayStatuses(s);
  const i = st.indexOf("current");
  return i === -1 ? null : i + 1;
}

export function getStreak(s: AppState): number {
  const dates = new Set(Object.values(s.progress).map((p) => toISODate(new Date(p.completedAt))));
  let streak = 0;
  const d = new Date();
  // se ainda não treinou hoje, o streak continua valendo a partir de ontem
  if (!dates.has(toISODate(d))) d.setDate(d.getDate() - 1);
  while (dates.has(toISODate(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getStats(s: AppState) {
  const entries = Object.values(s.progress);
  const completed = entries.length;
  const totalMin = Math.round(entries.reduce((a, p) => a + p.durationSec, 0) / 60);
  return { completed, pct: Math.round((completed / TOTAL_DAYS) * 100), totalMin, streak: getStreak(s) };
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

export const actions = {
  login(email: string, isDemo = false) {
    setState((s) => ({ ...s, session: { email, isDemo } }));
  },
  logout() {
    write(EMPTY);
  },
  saveProfile(p: Partial<Profile>) {
    setState((s) => {
      const base: Profile = s.profile ?? {
        name: "",
        email: s.session?.email ?? "",
        level: "iniciante",
        equipment: "nada",
        startDate: today(),
        reminderTime: null,
        onboarded: false,
        disclaimerAccepted: false,
      };
      return { ...s, profile: { ...base, ...p } };
    });
  },
  completeDay(day: number, durationSec: number) {
    setState((s) => ({
      ...s,
      progress: { ...s.progress, [day]: { completedAt: new Date().toISOString(), feeling: null, durationSec } },
    }));
  },
  setFeeling(day: number, feeling: Feeling) {
    setState((s) => (s.progress[day] ? { ...s, progress: { ...s.progress, [day]: { ...s.progress[day], feeling } } } : s));
  },
  addMeasurement(hipCm: number, date = today()) {
    setState((s) => ({
      ...s,
      measurements: [...s.measurements.filter((m) => m.date !== date), { id: crypto.randomUUID(), date, hipCm }].sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
    }));
  },
  setPhoto(day: 1 | 11 | 21, dataUrl: string) {
    setState((s) => ({ ...s, photos: { ...s.photos, [day]: dataUrl } }));
  },
  /** Cria um usuário demo já com alguns dias feitos, pra ver todas as telas preenchidas. */
  seedDemo() {
    const now = new Date();
    const back = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      d.setHours(19, 10, 0, 0);
      return d;
    };
    const feelings: Feeling[] = ["ok", "dificil", "ok", "facil"];
    const progress: Record<number, DayProgress> = {};
    for (let day = 1; day <= 4; day++) {
      progress[day] = {
        completedAt: back(4 - day + 1).toISOString(),
        feeling: feelings[day - 1],
        durationSec: DAYS[day - 1].minutos * 60 + 40,
      };
    }
    write({
      session: { email: "demo@gluteo21.com", isDemo: true },
      profile: {
        name: "Ana",
        email: "demo@gluteo21.com",
        level: "iniciante",
        equipment: "band",
        startDate: toISODate(back(4)),
        reminderTime: "19:00",
        onboarded: true,
        disclaimerAccepted: true,
      },
      progress,
      measurements: [
        { id: "m1", date: toISODate(back(4)), hipCm: 102 },
        { id: "m2", date: toISODate(back(2)), hipCm: 101.5 },
        { id: "m3", date: toISODate(back(0)), hipCm: 101 },
      ],
      photos: {},
    });
  },
};

/** Redimensiona uma imagem para caber no localStorage (protótipo). Em produção vai pro Firebase Storage. */
export async function fileToResizedDataUrl(file: File, max = 640): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Gift, HeartPulse, LogOut, MessageCircle, RotateCcw } from "lucide-react";
import { Guard } from "@/components/Guard";
import { BottomNav } from "@/components/BottomNav";
import { actions, getCurrentDay, type AppState } from "@/lib/store";
import { EQUIPMENT_LABEL, LEVEL_LABEL, type Equipment, type Level } from "@/data/program";
import { APP_CONFIG } from "@/config";

export default function ProfilePage() {
  return <Guard>{(s) => <Profile s={s} />}</Guard>;
}

function Profile({ s }: { s: AppState & { profile: NonNullable<AppState["profile"]> } }) {
  const router = useRouter();
  const p = s.profile;
  const current = getCurrentDay(s);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  async function toggleReminder(on: boolean) {
    if (!on) return actions.saveProfile({ reminderTime: null });
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setNotifMsg("Libere as notificações no navegador pra receber o lembrete.");
        return;
      }
    }
    actions.saveProfile({ reminderTime: p.reminderTime ?? "19:00" });
    setNotifMsg("Prontinho! A gente te lembra todo dia. 💜");
  }

  return (
    <main className="pb-32">
      <header className="flex flex-col items-center px-6 pt-10 text-center">
        <div className="relative">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#c3afff] to-primary font-display text-4xl font-extrabold text-white shadow-btn">
            {p.name.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-bg bg-white text-lg">🍑</span>
        </div>
        <h1 className="h-display mt-3 text-2xl">{p.name}</h1>
        <p className="text-sm text-muted">{p.email}</p>
        <div className="mt-2 flex gap-2">
          <span className="chip">{LEVEL_LABEL[p.level]}</span>
          <span className="chip">{EQUIPMENT_LABEL[p.equipment].split(" (")[0]}</span>
        </div>
      </header>

      <section className="card mx-6 mt-6 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Meu treino</h2>
        <p className="mt-4 text-sm font-semibold">Nível</p>
        <Segmented<Level>
          value={p.level}
          options={[
            ["iniciante", "🌱 Iniciante"],
            ["intermediaria", "💪 Intermediária"],
          ]}
          onChange={(level) => actions.saveProfile({ level })}
        />
        <p className="mt-4 text-sm font-semibold">Equipamento</p>
        <Segmented<Equipment>
          value={p.equipment}
          options={[
            ["nada", "🙌 Nada"],
            ["band", "🎀 Mini band"],
            ["peso", "🏋️‍♀️ Peso"],
          ]}
          onChange={(equipment) => actions.saveProfile({ equipment })}
        />
        <p className="mt-3 text-xs text-muted">Os próximos treinos já se ajustam automaticamente.</p>
      </section>

      <section className="card mx-6 mt-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff1e8] text-[#e0813a]">
            <Bell size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold">Lembrete diário</p>
            <p className="text-xs text-muted">Notificação na hora do treino</p>
          </div>
          <Switch on={!!p.reminderTime} onChange={toggleReminder} />
        </div>
        {p.reminderTime && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-soft-2 px-4 py-3">
            <span className="text-sm font-semibold">Horário</span>
            <input
              type="time"
              value={p.reminderTime}
              onChange={(e) => actions.saveProfile({ reminderTime: e.target.value })}
              className="rounded-xl bg-white px-3 py-1.5 font-bold text-primary shadow-card outline-none"
            />
          </div>
        )}
        {notifMsg && <p className="mt-2 text-xs text-muted">{notifMsg}</p>}
      </section>

      <section className="card mx-6 mt-4 divide-y divide-line overflow-hidden">
        {APP_CONFIG.bonusEnabled && <Row href="/bonus" icon={<Gift size={20} />} tint="bg-soft text-primary" label="Bônus" />}
        <Row href={APP_CONFIG.supportWhatsappUrl} external icon={<MessageCircle size={20} />} tint="bg-[#e8f8f0] text-[#2f9e6a]" label="Suporte no WhatsApp" />
        <Row
          onClick={() => alert("Se tiver lesão, dor ou condição de saúde, consulte um profissional antes de começar ou continuar os treinos.")}
          icon={<HeartPulse size={20} />}
          tint="bg-[#ffeef4] text-[#d6457c]"
          label="Aviso de saúde"
        />
        {s.session?.isDemo && (
          <Row
            onClick={() => {
              actions.seedDemo();
              router.push("/home");
            }}
            icon={<RotateCcw size={20} />}
            tint="bg-sun/30 text-[#a37a00]"
            label="Resetar dados de demo"
          />
        )}
      </section>

      <div className="mx-6 mt-4">
        <button
          onClick={() => {
            actions.logout();
            router.replace("/login");
          }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white font-bold text-muted active:scale-[0.98]"
        >
          <LogOut size={18} /> Sair
        </button>
        <p className="mt-4 text-center text-xs text-muted/70">{APP_CONFIG.name} · v0.1 protótipo</p>
      </div>

      <BottomNav todayHref={current ? `/treino/${current}` : "/home"} />
    </main>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="mt-2 flex gap-1 rounded-2xl bg-soft-2 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`h-11 flex-1 rounded-xl text-[13px] font-bold transition ${value === v ? "bg-white text-primary shadow-card" : "text-muted"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 rounded-full transition ${on ? "bg-primary" : "bg-line"}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
    </button>
  );
}

function Row({
  href,
  external,
  onClick,
  icon,
  tint,
  label,
}: {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  tint: string;
  label: string;
}) {
  const inner = (
    <>
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tint}`}>{icon}</span>
      <span className="flex-1 text-left font-semibold">{label}</span>
      <ChevronRight size={18} className="text-muted" />
    </>
  );
  const cls = "flex w-full items-center gap-3 px-5 py-3.5 active:bg-soft-2";
  if (href && external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

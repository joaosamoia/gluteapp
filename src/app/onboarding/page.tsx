"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, HeartPulse, Lock, Ruler } from "lucide-react";
import { Guard } from "@/components/Guard";
import { Figure, Leaves } from "@/components/Figure";
import { actions, fileToResizedDataUrl } from "@/lib/store";
import { APP_CONFIG } from "@/config";
import type { Equipment, Level } from "@/data/program";

const STEPS = 4;

export default function OnboardingPage() {
  return <Guard requireOnboarded={false}>{(s) => <Onboarding initialName={(s.profile as typeof s.profile | null)?.name ?? ""} />}</Guard>;
}

function Onboarding({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = aviso de saúde
  const [name, setName] = useState(initialName);
  const [level, setLevel] = useState<Level | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [hip, setHip] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const finish = () => {
    actions.saveProfile({
      name: name.trim() || "Linda",
      level: level ?? "iniciante",
      equipment: equipment ?? "nada",
      onboarded: true,
      disclaimerAccepted: true,
    });
    if (hip) actions.addMeasurement(parseFloat(hip.replace(",", ".")));
    if (photo) actions.setPhoto(1, photo);
    router.replace("/home");
  };

  const next = () => (step < STEPS ? setStep(step + 1) : finish());

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-6">
      {step > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(step - 1)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-card" aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-1 gap-1.5">
            {Array.from({ length: STEPS }, (_, i) => (
              <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className={`h-full rounded-full bg-primary transition-all duration-500 ${i < step ? "w-full" : "w-0"}`} />
              </div>
            ))}
          </div>
          <span className="w-8 text-right text-xs font-bold text-muted">
            {step}/{STEPS}
          </span>
        </div>
      )}

      <div key={step} className="flex flex-1 animate-fade-up flex-col">
        {step === 0 && (
          <>
            <div className="relative mt-4 h-56 overflow-hidden rounded-[32px] bg-gradient-to-b from-soft to-[#e3d8fd]">
              <Leaves className="absolute bottom-0 left-3 h-24" />
              <Leaves className="absolute bottom-0 right-3 h-24" flip />
              <Figure pose="seated" className="absolute inset-x-10 bottom-0" />
            </div>
            <h1 className="h-display mt-6 text-3xl">
              Bem-vinda ao <span className="text-primary">{APP_CONFIG.name}</span> 💜
            </h1>
            <p className="mt-2 text-muted">Vamos montar seu desafio em menos de 1 minuto.</p>
            <label className="mt-6 text-sm font-semibold">Como você quer ser chamada?</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-2 h-14 rounded-2xl border-2 border-line bg-white px-4 text-[16px] outline-none focus:border-primary"
            />
            <div className="mt-5 flex gap-3 rounded-2xl bg-[#fff4ec] p-4 text-sm text-[#8a4b26]">
              <HeartPulse className="shrink-0" size={22} />
              <p>
                <b>Antes de começar:</b> se tiver lesão, dor ou alguma condição de saúde, consulte um profissional antes de
                fazer os treinos.
              </p>
            </div>
            <button onClick={next} className="btn-primary mt-auto">
              Entendi, bora! 🍑
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="Qual seu nível hoje?" sub="Isso ajusta as séries e repetições pra você." />
            <div className="space-y-3">
              <Option
                selected={level === "iniciante"}
                onClick={() => setLevel("iniciante")}
                emoji="🌱"
                title="Iniciante"
                desc="Treino pouco ou estou voltando agora"
              />
              <Option
                selected={level === "intermediaria"}
                onClick={() => setLevel("intermediaria")}
                emoji="💪"
                title="Intermediária"
                desc="Já treino com frequência e conheço os exercícios"
              />
            </div>
            <button onClick={next} disabled={!level} className="btn-primary mt-auto">
              Continuar
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="O que você tem em casa?" sub="A gente troca o exercício pela variação certa." />
            <div className="space-y-3">
              <Option selected={equipment === "nada"} onClick={() => setEquipment("nada")} emoji="🙌" title="Nada" desc="Só o peso do corpo" />
              <Option
                selected={equipment === "band"}
                onClick={() => setEquipment("band")}
                emoji="🎀"
                title="Mini band (elástico)"
                desc="Aquele elástico curtinho de treino"
              />
              <Option
                selected={equipment === "peso"}
                onClick={() => setEquipment("peso")}
                emoji="🏋️‍♀️"
                title="Garrafa ou halter"
                desc="Garrafa de água de 1,5–5 L ou halter"
              />
            </div>
            <button onClick={next} disabled={!equipment} className="btn-primary mt-auto">
              Continuar
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title="Medida do quadril" sub="Opcional. Mede na parte mais larga do bumbum, com fita métrica." />
            <div className="card flex items-center gap-4 p-5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-soft text-primary">
                <Ruler />
              </div>
              <input
                inputMode="decimal"
                value={hip}
                onChange={(e) => setHip(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="98"
                className="h-display w-full bg-transparent text-5xl outline-none placeholder:text-line"
              />
              <span className="text-lg font-bold text-muted">cm</span>
            </div>
            <p className="mt-3 text-sm text-muted">Você vai poder atualizar isso no Dia 11 e no Dia 21 pra ver a evolução.</p>
            <div className="mt-auto space-y-2">
              <button onClick={next} className="btn-primary">
                {hip ? "Salvar e continuar" : "Continuar"}
              </button>
              {!hip && (
                <button onClick={next} className="w-full py-2 text-sm font-semibold text-muted">
                  Pular por enquanto
                </button>
              )}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="Foto do Dia 1" sub="Opcional — mas no Dia 21 você vai AMAR comparar. 📸" />
            <label className="relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed border-primary/30 bg-soft-2">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Foto do dia 1" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <>
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-primary shadow-card">
                    <Camera />
                  </div>
                  <p className="mt-3 font-bold text-primary">Tirar ou escolher foto</p>
                  <p className="mt-1 text-xs text-muted">De lado, roupa justa, mesma luz sempre</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setPhoto(await fileToResizedDataUrl(f));
                }}
              />
            </label>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock size={12} /> Sua foto é privada. Só você vê.
            </p>
            <div className="mt-auto space-y-2 pt-4">
              <button onClick={finish} className="btn-primary">
                Começar meu desafio 🚀
              </button>
              {!photo && (
                <button onClick={finish} className="w-full py-2 text-sm font-semibold text-muted">
                  Pular por enquanto
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6 mt-8">
      <h1 className="h-display text-[30px] leading-tight">{title}</h1>
      <p className="mt-2 text-muted">{sub}</p>
    </div>
  );
}

function Option({
  selected,
  onClick,
  emoji,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-3xl border-2 bg-white p-4 text-left transition active:scale-[0.98] ${
        selected ? "border-primary shadow-card" : "border-transparent shadow-card"
      }`}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl ${selected ? "bg-primary/15" : "bg-soft-2"}`}>{emoji}</span>
      <span className="flex-1">
        <span className="block text-[17px] font-bold">{title}</span>
        <span className="block text-sm text-muted">{desc}</span>
      </span>
      <span
        className={`grid h-7 w-7 place-items-center rounded-full border-2 transition ${
          selected ? "border-primary bg-primary text-white" : "border-line"
        }`}
      >
        {selected && <Check size={16} strokeWidth={3} />}
      </span>
    </button>
  );
}

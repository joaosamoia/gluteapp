"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/config";
import { actions } from "@/lib/store";
import { Figure, Leaves } from "@/components/Figure";
import { checkAccess } from "@/lib/access";
import { completeMagicLink } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      actions.seedDemo();
      router.replace("/home");
      return;
    }
    completeMagicLink()
      .then((mail) => {
        if (mail) {
          actions.login(mail);
          router.replace("/onboarding");
        }
      })
      .catch(() => {});
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await checkAccess(email.trim().toLowerCase());
    setLoading(false);
    if (res === "denied") return router.push(`/acesso-negado?email=${encodeURIComponent(email)}`);
    if (res === "link-sent") return setSent(true);
    actions.login(email.trim().toLowerCase());
    router.push("/onboarding");
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-10">
      <div className="flex items-center gap-2 text-sm font-bold text-primary">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white">🍑</span>
        {APP_CONFIG.name}
      </div>

      <h1 className="h-display mt-8 text-[40px] leading-[1.05]">
        Seu bumbum
        <br />
        <span className="text-primary">em 21 dias,</span>
        <br />
        sem sair de casa
      </h1>
      <p className="mt-3 text-[15px] text-muted">20 a 30 minutinhos por dia, com treino guiado passo a passo. 💜</p>

      <div className="relative my-6 h-48 overflow-hidden rounded-[32px] bg-gradient-to-b from-soft to-[#e3d8fd]">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/50" />
        <Leaves className="absolute bottom-0 left-3 h-24" />
        <Leaves className="absolute bottom-0 right-3 h-20" flip />
        <Figure pose="bridge" className="absolute inset-x-6 bottom-0 animate-float" />
      </div>

      {sent ? (
        <div className="card animate-fade-up p-5 text-center">
          <Mail className="mx-auto text-primary" />
          <p className="mt-2 font-bold">Link enviado!</p>
          <p className="text-sm text-muted">Abre seu e-mail e toca no link pra entrar.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-auto space-y-3">
          <label className="block text-sm font-semibold">E-mail usado na compra</label>
          <div className="flex h-14 items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 focus-within:border-primary">
            <Mail size={20} className="text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-muted/60"
            />
          </div>
          <button className="btn-primary" disabled={loading}>
            {loading ? "Verificando..." : "Entrar"} <ArrowRight size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              actions.seedDemo();
              router.push("/home");
            }}
            className="btn-soft w-full"
          >
            <Sparkles size={18} /> Testar no modo demo
          </button>
          <p className="pt-1 text-center text-xs text-muted">
            Protótipo: use <b>demo@gluteo21.com</b> pra fazer o fluxo completo.
          </p>
        </form>
      )}
    </main>
  );
}

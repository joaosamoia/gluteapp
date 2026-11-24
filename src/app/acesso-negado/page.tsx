import Link from "next/link";
import { MessageCircle, SearchX } from "lucide-react";
import { APP_CONFIG } from "@/config";

export default function AcessoNegado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="grid h-24 w-24 animate-pop place-items-center rounded-[32px] bg-soft text-primary">
        <SearchX size={44} />
      </div>
      <h1 className="h-display mt-6 text-3xl">Acesso não encontrado</h1>
      <p className="mt-3 max-w-xs text-muted">
        Não achamos uma compra com esse e-mail. Confere se é o mesmo e-mail que você usou na compra — ou chama a gente que
        a gente resolve rapidinho. 💜
      </p>
      <div className="mt-8 w-full space-y-3">
        <a href={APP_CONFIG.supportWhatsappUrl} target="_blank" rel="noreferrer" className="btn-primary">
          <MessageCircle size={20} /> Falar com o suporte
        </a>
        <Link href="/login" className="btn-soft w-full">
          Tentar outro e-mail
        </Link>
      </div>
    </main>
  );
}

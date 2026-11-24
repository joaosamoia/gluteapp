/** Configurações globais do app — troque aqui o nome, regras de liberação etc. */
export const APP_CONFIG = {
  name: "GLÚTEO 21",
  shortName: "Glúteo21",
  tagline: "21 dias. 20 a 30 min por dia. Em casa.",
  /**
   * Como os dias são liberados:
   *  - "calendar": libera 1 dia por dia de calendário a partir da data de início
   *  - "sequential": libera o próximo assim que o anterior for concluído
   */
  unlockMode: (process.env.NEXT_PUBLIC_UNLOCK_MODE as "calendar" | "sequential") || "sequential",
  supportWhatsappUrl:
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL ||
    "https://wa.me/5500000000000?text=Oi!%20Preciso%20de%20ajuda%20com%20o%20GL%C3%9ATEO%2021",
  /** Mostra a área "Bônus" no menu */
  bonusEnabled: true,
  /** E-mails liberados no modo local (sem Firebase configurado) */
  localAllowedEmails: ["demo@gluteo21.com", "teste@gluteo21.com"],
  /** Descanso padrão entre séries (s) por fase */
  restSeconds: { 1: 30, 2: 40, 3: 45 } as Record<1 | 2 | 3, number>,
  /** Descanso entre exercícios (s) */
  restBetweenExercises: 45,
} as const;

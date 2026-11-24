"use client";

import { APP_CONFIG } from "@/config";
import { firebaseEnabled, sendMagicLink } from "./firebase";

/**
 * Verifica se o e-mail tem acesso (comprou na Kiwify).
 * - Com Firebase configurado: consulta /api/access (allowedUsers no Firestore) e envia link mágico.
 * - Sem Firebase (protótipo): usa a lista APP_CONFIG.localAllowedEmails.
 */
export async function checkAccess(email: string): Promise<"ok" | "denied" | "link-sent"> {
  if (!firebaseEnabled) {
    await new Promise((r) => setTimeout(r, 500));
    return (APP_CONFIG.localAllowedEmails as readonly string[]).includes(email) ? "ok" : "denied";
  }
  const res = await fetch(`/api/access?email=${encodeURIComponent(email)}`);
  const { allowed } = (await res.json()) as { allowed: boolean };
  if (!allowed) return "denied";
  await sendMagicLink(email);
  return "link-sent";
}

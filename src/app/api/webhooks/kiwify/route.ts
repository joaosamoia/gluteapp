import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminEnabled } from "@/lib/firebaseAdmin";

/**
 * Webhook da Kiwify.
 * Configure na Kiwify: URL = https://SEU-DOMINIO/api/webhooks/kiwify e use o mesmo token em KIWIFY_WEBHOOK_TOKEN.
 * Validação aceita:
 *  - `?signature=` = HMAC-SHA1 do corpo bruto com o token (formato enviado pela Kiwify), ou
 *  - `?token=` / header `x-kiwify-token` igual ao token (útil pra testes manuais).
 * Eventos: compra aprovada, reembolso, chargeback.
 *
 * Compra aprovada → allowedUsers/{email} = { active: true, purchasedAt, source: "kiwify" }
 * Reembolso / chargeback → active: false
 */

const APPROVED = new Set(["paid", "approved", "order_approved", "compra_aprovada"]);
const REVOKED = new Set(["refunded", "chargedback", "chargeback", "order_refunded", "reembolso"]);

export async function POST(req: NextRequest) {
  const secret = process.env.KIWIFY_WEBHOOK_TOKEN;
  const raw = await req.text();
  if (!secret || !isAuthorized(req, raw, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const customer = (body.Customer ?? body.customer ?? {}) as { email?: string };
  const email = String(customer.email ?? "").trim().toLowerCase();
  const status = String(body.order_status ?? body.webhook_event_type ?? body.status ?? "").toLowerCase();
  if (!email) return NextResponse.json({ error: "missing email" }, { status: 400 });

  if (!adminEnabled) {
    console.warn("[kiwify] Firebase Admin não configurado — evento ignorado", { email, status });
    return NextResponse.json({ ok: true, skipped: true });
  }

  const ref = adminDb().collection("allowedUsers").doc(email);
  if (APPROVED.has(status)) {
    await ref.set(
      { active: true, purchasedAt: new Date().toISOString(), source: "kiwify", orderId: body.order_id ?? null },
      { merge: true },
    );
  } else if (REVOKED.has(status)) {
    await ref.set({ active: false, revokedAt: new Date().toISOString(), revokedReason: status }, { merge: true });
  } else {
    return NextResponse.json({ ok: true, ignored: status });
  }
  return NextResponse.json({ ok: true });
}

function safeEq(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

function isAuthorized(req: NextRequest, raw: string, secret: string) {
  const sig = req.nextUrl.searchParams.get("signature");
  if (sig) return safeEq(sig, createHmac("sha1", secret).update(raw).digest("hex"));
  const token = req.nextUrl.searchParams.get("token") ?? req.headers.get("x-kiwify-token") ?? "";
  return safeEq(token, secret);
}

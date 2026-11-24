import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/** Firebase Admin (servidor). Usa FIREBASE_SERVICE_ACCOUNT (JSON em uma linha). */
export const adminEnabled = !!process.env.FIREBASE_SERVICE_ACCOUNT;

let app: App | undefined;
export function adminDb() {
  if (!adminEnabled) throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada");
  app ??= getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) });
  return getFirestore(app);
}

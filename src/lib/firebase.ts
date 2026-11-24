"use client";

/**
 * Integração com Firebase (Auth por link mágico + Firestore + Storage).
 * Só é ativada quando as variáveis NEXT_PUBLIC_FIREBASE_* estão definidas.
 * Sem elas, o app roda em modo local (protótipo) com localStorage.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = !!config.apiKey;

async function getApp() {
  const { initializeApp, getApps } = await import("firebase/app");
  return getApps()[0] ?? initializeApp(config);
}

export async function getFirebase() {
  const app = await getApp();
  const [{ getAuth }, { getFirestore }, { getStorage }] = await Promise.all([
    import("firebase/auth"),
    import("firebase/firestore"),
    import("firebase/storage"),
  ]);
  return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
}

const EMAIL_KEY = "gluteo21:emailForSignIn";

export async function sendMagicLink(email: string) {
  const { auth } = await getFirebase();
  const { sendSignInLinkToEmail } = await import("firebase/auth");
  await sendSignInLinkToEmail(auth, email, { url: `${window.location.origin}/login`, handleCodeInApp: true });
  localStorage.setItem(EMAIL_KEY, email);
}

/** Chamar na tela de login: se a URL for um link mágico, conclui o login. */
export async function completeMagicLink(): Promise<string | null> {
  if (!firebaseEnabled) return null;
  const { auth } = await getFirebase();
  const { isSignInWithEmailLink, signInWithEmailLink } = await import("firebase/auth");
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;
  const email = localStorage.getItem(EMAIL_KEY) ?? window.prompt("Confirma seu e-mail:") ?? "";
  const cred = await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem(EMAIL_KEY);
  return cred.user.email;
}

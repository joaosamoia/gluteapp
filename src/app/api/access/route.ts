import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminEnabled } from "@/lib/firebaseAdmin";

/** GET /api/access?email=... → { allowed } — consulta allowedUsers/{email}. */
export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email || !adminEnabled) return NextResponse.json({ allowed: false });
  const snap = await adminDb().collection("allowedUsers").doc(email).get();
  return NextResponse.json({ allowed: snap.exists && snap.data()?.active === true });
}

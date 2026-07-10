// Dashboard auth — single admin password, HMAC-signed expiring cookie.
// Token = "<expiryMs>.<hex hmac of 'df-admin|<expiryMs>' keyed by ADMIN_PASSWORD>".
// Rotating ADMIN_PASSWORD invalidates every session (feature, not bug).

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ADMIN } from "./leads";

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD env var is not set");
  return s;
}

function sign(exp: number): string {
  return createHmac("sha256", secret()).update(`df-admin|${exp}`).digest("hex");
}

export function mintAdminToken(): { token: string; maxAgeSec: number } {
  const exp = Date.now() + SESSION_MS;
  return { token: `${exp}.${sign(exp)}`, maxAgeSec: SESSION_MS / 1000 };
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(token.slice(0, dot));
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const given = Buffer.from(token.slice(dot + 1), "hex");
  const want = Buffer.from(sign(exp), "hex");
  return given.length === want.length && timingSafeEqual(given, want);
}

export function passwordMatches(input: string): boolean {
  const want = Buffer.from(secret());
  const got = Buffer.from(input);
  return want.length === got.length && timingSafeEqual(want, got);
}

/** Server-component guard — call at the top of every /dashboard page. */
export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(COOKIE_ADMIN)?.value)) {
    redirect("/dashboard/login");
  }
}

/** Route-handler guard (no redirect — 401). */
export function isAdminRequest(req: Request): boolean {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE_ADMIN}=([^;]+)`));
  return verifyAdminToken(m ? decodeURIComponent(m[1]) : undefined);
}

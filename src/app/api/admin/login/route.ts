// POST /api/admin/login — plain form post from /dashboard/login.
// Timing-safe compare + 750ms sleep on failure to blunt brute force.
// DELETE = logout.

import { NextResponse } from "next/server";
import { mintAdminToken, passwordMatches } from "@/lib/admin-auth";
import { COOKIE_ADMIN } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const base = new URL(req.url).origin;

  if (!password || !passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 750));
    return NextResponse.redirect(`${base}/dashboard/login?e=1`, 303);
  }

  const { token, maxAgeSec } = mintAdminToken();
  const res = NextResponse.redirect(`${base}/dashboard`, 303);
  res.cookies.set(COOKIE_ADMIN, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(req.url).protocol === "https:",
    path: "/",
    maxAge: maxAgeSec,
  });
  // Non-httpOnly UI-presence flag so client components can conditionally
  // render admin-only tabs. Contains no secret; the httpOnly cookie above
  // is still the sole trust root.
  res.cookies.set("df_admin_ui", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: new URL(req.url).protocol === "https:",
    path: "/",
    maxAge: maxAgeSec,
  });
  return res;
}

export async function DELETE(req: Request) {
  const base = new URL(req.url).origin;
  const res = NextResponse.redirect(`${base}/dashboard/login`, 303);
  res.cookies.set(COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
  res.cookies.set("df_admin_ui", "", { path: "/", maxAge: 0 });
  return res;
}

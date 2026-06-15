// Next.js 16 Proxy (formerly `middleware.ts`, now deprecated/renamed). Must live
// at the same level as `app` — this project uses `src/app`, so it belongs here
// at `src/proxy.ts`.
//
// Responsibilities:
//   1. Expose the request pathname to server components via a request header,
//      so the root layout can set <html lang/dir> per locale and toggle off
//      site chrome for standalone campaign pages.
//   2. Send first-time Arabic-language visitors from "/" to "/ar" so the
//      marketplace defaults to Arabic for its Arabic-speaking audience.
//   3. Persist a `locale` cookie on every page load reflecting the path
//      the visitor is on, so the auto-redirect only fires once.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function prefersArabic(req: NextRequest): boolean {
  const al = req.headers.get("accept-language") ?? "";
  for (const raw of al.split(",")) {
    const tag = raw.split(";")[0]!.trim().toLowerCase();
    if (!tag) continue;
    if (tag === "ar" || tag.startsWith("ar-")) return true;
    if (tag === "en" || tag.startsWith("en-")) return false;
  }
  return false;
}

function localeFromPath(path: string): "en" | "ar" {
  return path === "/ar" || path.startsWith("/ar/") ? "ar" : "en";
}

const COOKIE_NAME = "locale";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // First-time Arabic visitors get sent from "/" to "/ar". After their first
  // page load anywhere, the locale cookie is set and this branch skips — so
  // a visitor who clicks EN later won't be re-bounced.
  if (path === "/" || path === "") {
    const hasChoice = request.cookies.get(COOKIE_NAME);
    if (!hasChoice && prefersArabic(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/ar";
      return NextResponse.redirect(url);
    }
  }

  // Forward x-pathname to server components via REQUEST headers (Next.js 16
  // pattern; response-header forwarding stopped working).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.cookies.set(COOKIE_NAME, localeFromPath(path), {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  return res;
}

export const config = {
  matcher: [
    // skip static assets and the icon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};

// Next.js 16 Proxy (formerly `middleware.ts`). Lives at src/proxy.ts — same
// level as src/app — or it never runs.
//
// Responsibilities:
//   1. Forward x-pathname + x-df-sid REQUEST headers so server components /
//      route handlers can read them even on the first request (response-set
//      cookies aren't visible to `await cookies()` during that same render).
//   2. Mint the anonymous session id cookie `df_sid` (lead dedupe key).
//   3. Capture first-touch UTM/gclid into `df_utm` (upgraded once if the
//      first touch was organic and a later visit carries ad params).
//   4. Locale: redirect first-time Arabic-language visitors from "/" to
//      "/ar"; persist a `locale` cookie reflecting the path.
//
// /api/* requests pass through untouched — API routes read request cookies
// directly, and stamping `locale` on API calls was clobbering AR users'
// preference (e.g. POST /api/chat rewrote locale=en).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_SID,
  COOKIE_UTM,
  utmFromSearch,
  hasAdSignal,
  parseUtmCookie,
} from "./lib/leads";

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

const LOCALE_COOKIE = "locale";
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // API routes: no cookies, no redirects — pass through.
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // First-time Arabic visitors: "/" → "/ar" (once; locale cookie gates it).
  if (path === "/" || path === "") {
    const hasChoice = request.cookies.get(LOCALE_COOKIE);
    if (!hasChoice && prefersArabic(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/ar";
      return NextResponse.redirect(url);
    }
  }

  const sid = request.cookies.get(COOKIE_SID)?.value ?? crypto.randomUUID();

  // Forward request headers (visible to this same render, unlike cookies).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-df-sid", sid);
  const res = NextResponse.next({ request: { headers: requestHeaders } });

  const secure = request.nextUrl.protocol === "https:";

  if (!request.cookies.get(COOKIE_SID)) {
    res.cookies.set(COOKIE_SID, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // First-touch UTM — write when absent; upgrade once if the stored touch
  // has no ad signal but this request does (organic-then-ad-click case).
  const existing = parseUtmCookie(request.cookies.get(COOKIE_UTM)?.value);
  const current = utmFromSearch(request.nextUrl.searchParams, path);
  if (!existing || (!hasAdSignal(existing) && hasAdSignal(current))) {
    res.cookies.set(COOKIE_UTM, JSON.stringify(current), {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }

  res.cookies.set(LOCALE_COOKIE, localeFromPath(path), {
    maxAge: YEAR,
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

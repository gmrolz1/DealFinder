// Exposes the request pathname to server components via a header. The root
// layout reads x-pathname to set html lang/dir per locale.
//
// Also handles a one-shot Arabic auto-redirect on the bare homepage so that
// Arabic-speaking visitors land on /ar by default. After a user's first
// page load anywhere on the site, a `locale` cookie is set reflecting the
// path they're on — so future visits to "/" don't keep bouncing them
// somewhere they didn't ask for.

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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // First-time Arabic visitors get sent from "/" to "/ar". After their first
  // page load, the locale cookie is set and this branch is skipped — so a
  // visitor who clicks EN later won't be re-bounced.
  if (path === "/" || path === "") {
    const hasChoice = request.cookies.get(COOKIE_NAME);
    if (!hasChoice && prefersArabic(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/ar";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", path);
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

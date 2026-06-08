// Next.js 16 Proxy (formerly `middleware.ts`, now deprecated/renamed). Must live
// at the same level as `app` — this project uses `src/app`, so it belongs here
// at `src/proxy.ts` (the old `middleware.ts` was at the repo root, one level too
// high, so it never actually ran — x-pathname was never set).
//
// Exposes the request pathname to server components via a REQUEST header so the
// root layout can read x-pathname (via headers()) to set <html lang/dir> per
// locale and toggle the site chrome off for standalone campaign pages.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // skip static assets and the icon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};

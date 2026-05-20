// Exposes the request pathname to server components via a header.
// The root layout reads x-pathname to set html lang/dir per locale.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-pathname", request.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: [
    // skip static assets and the icon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};

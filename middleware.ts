import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/join") {
    const ref = searchParams.get("ref");
    const res = NextResponse.redirect(new URL("/login", req.url));
    if (ref) {
      res.cookies.set("referral_code", ref, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/join"],
};

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|favicon.ico|_next/static|.*\\..*).*)"],
};

// Define routes that are public
const publicRoutes = ["/", "/sign-in", "/sign-up"];

export default clerkMiddleware({
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",
  publicRoutes,
});

// Middleware function to handle additional redirect logic
export function middleware(req) {
  const { userId } = req.nextauth;

  // Get the current path
  const path = req.nextUrl.pathname;

  // Redirect logged-in users away from login and sign-up pages
  if (userId && (path === "/sign-in" || path === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users trying to access non-public routes
  if (!userId && !publicRoutes.includes(path)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to requested page
  return NextResponse.next();
}
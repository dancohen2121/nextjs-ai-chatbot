import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (authPromise, request) => {
  if (!isPublicRoute(request)) {
    // Await the auth promise to get ClerkMiddlewareAuthObject
    const auth = await authPromise;

    // Now you can access protect() method
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
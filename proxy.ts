import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Protected routes — only authenticated users
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/brand-dna(.*)',
  '/voice-dna(.*)',
  '/editorial(.*)',
  '/carousel(.*)',
  '/machine(.*)',
  '/kaizen(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()

    // Not logged in → sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Beta access check is done in app/(dashboard)/layout.tsx
    // using currentUser() which runs in Node.js runtime (not edge)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

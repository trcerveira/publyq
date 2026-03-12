import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasBetaAccess } from '@/lib/config/admins'

// Protected routes — only authenticated users
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/brand-dna(.*)',
  '/voice-dna(.*)',
  '/carousel(.*)',
  '/kaizen(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth()

    // Not logged in → sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Logged in but not in beta whitelist → landing page waitlist
    const email = sessionClaims?.email as string | undefined
    if (!hasBetaAccess(email)) {
      return NextResponse.redirect(new URL('/#waitlist', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

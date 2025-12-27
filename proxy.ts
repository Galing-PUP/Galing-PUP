import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/db";

/**
 * Middleware to handle Supabase session management and protected routes.
 * Refreshes the user's session if needed and handles redirects for authenticated users.
 * 
 * @param request - The incoming Next.js request.
 * @returns The Next.js response.
 */
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    let isTrulyLoggedIn = false;
    if (user) {
        // Verify against the database
        // We need to dynamically import prisma to avoid edge runtime issues if possible, 
        // or just import it at top level if environment supports it.
        // Given existing project structure, top level import is likely fine or will error if edge.
        // But since we can't easily see build logs, we'll try top level.
        const dbUser = await prisma.user.findUnique({
            where: { supabaseAuthId: user.id },
            select: { id: true }
        });
        isTrulyLoggedIn = !!dbUser;
    }

    // If user is logged in and tries to access signin or signup, redirect to home
    if (isTrulyLoggedIn && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

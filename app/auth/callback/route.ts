import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { RoleName, UserStatus } from '@/lib/generated/prisma/enums'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const intent = requestUrl.searchParams.get('intent')
    const isPopup = requestUrl.searchParams.get('popup') === 'true'

    console.log('[Auth Callback] URL:', request.url)
    console.log('[Auth Callback] Code:', code ? 'Present' : 'Missing')
    console.log('[Auth Callback] Intent:', intent)

    const supabase = await createClient()

    // Step 1: Exchange the auth code for a user session
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error('[Auth Callback] Auth Code Exchange Error:', error)
            return NextResponse.redirect(`${requestUrl.origin}/signin?error=VerificationFailed`)
        }
        console.log('[Auth Callback] Code exchange successful')
    } else {
        // Step 1.5: Handle explicit token verification (from manual flows)
        const token = requestUrl.searchParams.get('token')
        const type = requestUrl.searchParams.get('type')
        const email = requestUrl.searchParams.get('email')

        if (token && type && email) {
            console.log('[Auth Callback] Verifying OTP token...')
            const { error } = await supabase.auth.verifyOtp({
                token,
                type: type as any,
                email
            })
            if (error) {
                console.error('[Auth Callback] Token Verification Error:', error)
                const errorMessage = encodeURIComponent(error.message || 'Unknown error');
                return NextResponse.redirect(`${requestUrl.origin}/signin?error=VerificationFailed&message=${errorMessage}`)
            }
            console.log('[Auth Callback] Token verification successful')
        }
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('[Auth Callback] User found:', user?.email, 'Error:', userError)

    if (!user) {
        if (isPopup) {
            return new NextResponse(
                `<script>window.opener.postMessage({ type: 'OAUTH_ERROR', message: 'Unauthorized' }, '*'); window.close();</script>`,
                { headers: { 'Content-Type': 'text/html' } }
            )
        }
        return new Response('Unauthorized', { status: 401 })
    }

    const email = user.email!
    const baseUsername = email.split('@')[0].toLowerCase()
    let username = baseUsername

    const existing = await prisma.user.findUnique({ where: { email } })

    // If intent is signin, user MUST exist
    if (intent === 'signin' && !existing) {
        // Sign out the user immediately since they shouldn't be logged in
        await supabase.auth.signOut()

        if (isPopup) {
            return new NextResponse(
                `<script>window.opener.postMessage({ type: 'OAUTH_ERROR', message: 'User not found. Please sign up first.' }, '*'); window.close();</script>`,
                { headers: { 'Content-Type': 'text/html' } }
            )
        }
        return new Response('User not found', { status: 404 })
    }

    // If intent is signup, user MUST NOT exist
    if (intent === 'signup' && existing) {
        // Sign out the user immediately
        await supabase.auth.signOut()

        if (isPopup) {
            return new NextResponse(
                `<script>window.opener.postMessage({ type: 'OAUTH_ERROR', message: 'User already exists. Please sign in.' }, '*'); window.close();</script>`,
                { headers: { 'Content-Type': 'text/html' } }
            )
        }
        return new Response('User already exists', { status: 409 })
    }

    // Step 2: Handle user data in our database
    // If user exists, update supabaseAuthId if missing
    if (existing) {
        if (!existing.supabaseAuthId) {
            await prisma.user.update({
                where: { email },
                data: { supabaseAuthId: user.id }
            })
        }
    } else {
        // Step 3: Create new user if they don't exist (e.g., first-time OAuth login)

        // Check username uniqueness for new user
        const existingUsername = await prisma.user.findUnique({ where: { username } })
        if (existingUsername) username = `${baseUsername}_${crypto.randomUUID().slice(0, 8)}`

        // Create or update user record
        await prisma.user.upsert({
            where: { supabaseAuthId: user.id },
            update: {
                email,
                status: UserStatus.APPROVED,
                role: RoleName.REGISTERED,
            },
            create: {
                supabaseAuthId: user.id,
                email,
                username,
                registrationDate: new Date(),
                status: UserStatus.APPROVED, // Auto-verify OAuth users
                role: RoleName.REGISTERED,
                tierId: 1,
            },
        })
    }

    if (isPopup) {
        return new NextResponse(
            `<script>window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, '*'); window.close();</script>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
    }

    const next = requestUrl.searchParams.get('next')
    if (next) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }

    return NextResponse.redirect(`${requestUrl.origin}/`)
}

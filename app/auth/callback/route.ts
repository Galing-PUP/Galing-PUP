import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const intent = requestUrl.searchParams.get('intent')
    const isPopup = requestUrl.searchParams.get('popup') === 'true'

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // If user exists, update supabaseAuthId if missing
    if (existing) {
        if (!existing.supabaseAuthId) {
            await prisma.user.update({
                where: { email },
                data: { supabaseAuthId: user.id }
            })
        }
    } else {
        // Only create user if NOT signin intent (e.g. signup)
        // But for now, we assume this route handles both or just generic callback
        // If we want to restrict signup to a specific flow, we can check intent here too
        // For this specific request, we just proceed with upsert if it's NOT signin-fail

        // Check username uniqueness for new user
        const existingUsername = await prisma.user.findUnique({ where: { username } })
        if (existingUsername) username = `${baseUsername}_${crypto.randomUUID().slice(0, 8)}`

        await prisma.user.upsert({
            where: { supabaseAuthId: user.id },
            update: {},
            create: {
                supabaseAuthId: user.id,
                email,
                username,
                registrationDate: new Date(),
                isVerified: true,
                currentRoleId: 1,
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

    return NextResponse.redirect(`${requestUrl.origin}/`)
}

import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { createPaymentSession } from '@/lib/xendit'
import { NextRequest, NextResponse } from 'next/server'

const PREMIUM_TIER_AMOUNT = 299
const PREMIUM_TIER_ID = 2

/**
 * POST /api/checkout
 * Creates a Xendit payment session for premium tier upgrade
 * @returns Payment link URL for user to complete payment
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      include: { subscriptionTier: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Check if user is already premium
    if (dbUser.tierId === PREMIUM_TIER_ID) {
      return NextResponse.json(
        { error: 'You are already a premium member' },
        { status: 400 },
      )
    }

    // 4. Generate unique reference ID
    const referenceId = `upgrade_${dbUser.id}_${Date.now()}`

    // 5. Create Xendit payment session
    // Note: Xendit requires HTTPS URLs. For localhost, we use a placeholder HTTPS URL
    // since we're using the "Verify on Return" pattern and manually handling redirects
    const httpsVercelUrl = 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
    const appUrl = httpsVercelUrl || process.env.NEXT_PUBLIC_APP_URL
    console.log('APP_URL from env:', process.env.NEXT_PUBLIC_APP_URL)
    console.log('Using appUrl:', appUrl)
    console.log('Success URL:', `${appUrl}/pricing/success?ref=${referenceId}`)

    const sessionResponse = await createPaymentSession({
      reference_id: referenceId,
      session_type: 'PAY',
      mode: 'PAYMENT_LINK',
      amount: PREMIUM_TIER_AMOUNT,
      currency: 'PHP',
      country: 'PH',
      success_return_url: `${appUrl}/pricing/success?ref=${referenceId}`,
      cancel_return_url: `${appUrl}/pricing`,
    })

    // 6. Save transaction record in database
    await prisma.paymentTransaction.create({
      data: {
        referenceId: referenceId,
        sessionId: sessionResponse.payment_session_id,
        userId: dbUser.id,
        amount: PREMIUM_TIER_AMOUNT,
        currency: 'PHP',
        status: 'PENDING',
      },
    })

    // 7. Return payment link URL
    return NextResponse.json({
      paymentUrl: sessionResponse.payment_link_url,
      referenceId: referenceId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

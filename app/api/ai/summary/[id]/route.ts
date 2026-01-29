import { prisma } from '@/lib/db'
import { DocStatus } from '@/lib/generated/prisma/enums'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Params is a Promise in Next.js 15+
) {
  const { id } = await params
  const documentId = parseInt(id)

  if (isNaN(documentId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  // Part D: Origin Lock
  const secretHeader = req.headers.get('X-Internal-Secret')
  if (secretHeader !== 'pup-internal-lock') {
    return new NextResponse(null, { status: 418 }) // I'm a teapot
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch User Tier
  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id },
    include: { subscriptionTier: true },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check Subscription
  if (
    dbUser.subscriptionTier.tierName !== 'PAID' &&
    dbUser.role !== 'ADMIN' &&
    dbUser.role !== 'SUPERADMIN' &&
    dbUser.role !== 'OWNER'
  ) {
    return NextResponse.json(
      { error: 'Premium access required' },
      { status: 403 },
    )
  }

  // Fetch Document Summary
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { aiSummary: true, status: true },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Part C: Document Status Guard
  if (
    document.status === DocStatus.PENDING ||
    document.status === DocStatus.DELETED
  ) {
    return new NextResponse(null, { status: 410, statusText: 'Gone' })
  }

  return NextResponse.json({ summary: document.aiSummary })
}

import { prisma } from '@/lib/db'
import { decryptId } from '@/lib/obfuscation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ documentId: string }> },
) {
  const params = await props.params
  const { documentId } = params

  // Decrypt ID
  const decrypted = decryptId(decodeURIComponent(documentId))

  if (!decrypted || !decrypted.docId) {
    return new NextResponse('Invalid document token', { status: 400 })
  }

  const { docId: id, userId: tokenUserId } = decrypted

  // 1. Auth Check
  const supabase = await createClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // 2. Authorization & Database Lookup
  const user = await prisma.user.findUnique({
    where: { supabaseAuthId: authUser.id },
    include: { subscriptionTier: true },
  })

  if (!user) {
    return new NextResponse('User not found', { status: 403 })
  }

  // NEW: Check if token is bound to this user
  if (tokenUserId && Number(tokenUserId) !== user.id) {
    return new NextResponse('Invalid session token. Please refresh the page.', {
      status: 403,
    })
  }

  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    return new NextResponse('Document not found', { status: 404 })
  }

  // Role & Tier Checks
  // Admin/Owner/SuperAdmin always allowed (can view any status for review purposes)
  const isPrivileged = ['ADMIN', 'SUPERADMIN', 'OWNER'].includes(user.role)

  // For non-privileged users, only allow access to APPROVED documents
  if (!isPrivileged && document.status !== 'APPROVED') {
    return new NextResponse('Document not found', { status: 404 })
  }

  // Registered users check tier
  // If undefined tier (shouldn't happen), deny
  const tierName = user.subscriptionTier?.tierName
  const isPaid = tierName === 'PAID'
  // Free users allowed with activity logging (limits enforced elsewhere or implicitly by session)
  const isFree = tierName === 'FREE'

  if (!isPrivileged && !isPaid && !isFree) {
    return new NextResponse('Forbidden: Access Denied', { status: 403 })
  }

  // 3. File Retrieval
  const { data: fileData, error: fileError } = await supabaseAdmin.storage
    .from('PDF_UPLOADS')
    .download(document.filePath)

  if (fileError || !fileData) {
    console.error(`[PDF Stream] Storage Error for doc ${id}:`, fileError)
    return new NextResponse('File retrieval failed', { status: 500 })
  }

  // 4. Activity Logging
  try {
    // We log the download.
    // Note: If streaming fails mid-way, this still counts.
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        documentId: document.id,
        activityType: 'download',
      },
    })
  } catch (e) {
    console.error(
      `[PDF Stream] Logging failed for user ${user.id} doc ${id}:`,
      e,
    )
    // Continue even if logging fails?
    // Usually yes, don't block user for logging error, but could be critical for audit.
    // Proceeding.
  }

  // 5. Streaming Response
  const headers = new Headers()
  // set content-type
  headers.set('Content-Type', document.mimeType || 'application/pdf')
  // inline = view, attachment = download. Requirement says "Stream file contents".
  // Frontend uses blob() -> createObjectURL -> <a download>.
  // 'inline' is better for viewing in browser if they navigate directly,
  // but for the download button it doesn't matter much.
  // Using inline to allow browser viewing if desired.
  headers.set(
    'Content-Disposition',
    `inline; filename="${document.originalFileName || `document-${id}.pdf`}"`,
  )

  return new NextResponse(fileData.stream(), {
    headers,
    status: 200,
  })
}

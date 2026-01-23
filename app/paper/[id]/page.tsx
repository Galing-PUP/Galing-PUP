import { Abstract } from '@/components/paper/abstract'
import { ActionButtons } from '@/components/paper/action-buttons'
import { AiInsights } from '@/components/paper/ai-insights'
import { DocumentInfo } from '@/components/paper/document-info'
import { DocumentStats } from '@/components/paper/document-stats'
import { HeaderInfo } from '@/components/paper/header-info'
import { Keywords } from '@/components/paper/keywords'
import { PdfController } from '@/components/paper/pdf-controller'
import { ReferencePanel } from '@/components/paper/reference-panel'
import { prisma } from '@/lib/db'
import { encryptId } from '@/lib/obfuscation'
import { createClient } from '@/lib/supabase/server'
import { formatResourceType } from '@/lib/utils/format'
import { notFound } from 'next/navigation'

type PaperPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PaperPage(props: PaperPageProps) {
  const { id: idParam } = await props.params
  const id = Number(idParam)

  // Get current user for token generation
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userId: number | undefined = undefined

  if (user) {
    // We need the Prisma ID (int) to match what API expects
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { id: true },
    })
    userId = dbUser?.id
  }

  if (Number.isNaN(id)) {
    notFound()
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      authors: {
        include: {
          author: true,
        },
        orderBy: {
          authorOrder: 'asc',
        },
      },
      course: {
        include: {
          college: true,
        },
      },
      keywords: {
        include: {
          keyword: true,
        },
      },
    },
  })

  if (!document) {
    notFound()
  }

  // Extract data from document
  const authors = document.authors.map((a) => a.author.fullName)
  const authorEmails = document.authors
    .map((a) => a.author.email)
    .filter((email): email is string => email !== null)

  const datePublished = document.datePublished
  const yearPublished =
    document.datePublished?.getFullYear().toString() ?? 'n.d.'
  const courseName = document.course.courseName
  const department =
    document.course.college?.collegeName ?? document.course.courseName
  const campus = 'Polytechnic University of the Philippines'
  const documentType = formatResourceType(document.resourceType)
  const keywords = document.keywords.map((k) => k.keyword.keywordText)

  const downloads = document.downloadsCount
  const citations = document.citationCount
  const pdfUrl = document.filePath
  const downloadToken = encryptId(id, userId)

  const mainAuthor = authors[0] ?? 'Unknown Author'
  const additionalAuthors = authors.length > 1 ? ' et al.' : ''
  const citation = `${mainAuthor}${additionalAuthors} (${yearPublished}). ${document.title}. ${department}, ${campus}.`

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-12">
          {/* Left Column */}
          <div className="flex w-full flex-col space-y-8 lg:w-2/3">
            {/* Paper Title info*/}
            <div>
              <HeaderInfo
                title={document.title}
                authors={authors}
                authorEmails={authorEmails}
                documentType={documentType}
                yearPublished={yearPublished}
                courseName={courseName}
              />
            </div>

            {/*download, generate citation, add to library, share button*/}
            <div>
              <ActionButtons
                paperId={id}
                downloadToken={downloadToken}
                pdfUrl={pdfUrl}
                title={document.title}
                citation={citation}
              />
            </div>

            {/* Abstract content of the paper*/}
            <div>
              <Abstract text={document.abstract} />
            </div>

            {/* AI Insights Section */}
            {/* Handles lock state internally */}
            <div>
              <AiInsights documentId={id} />
            </div>

            {/* Keywords Section tags*/}
            <div>
              <Keywords keywords={keywords} />
            </div>

            {/* Hidden controller to link store to actions */}
            <PdfController pdfUrl={`/api/pdf/${downloadToken}`} />
          </div>

          {/* Right Column */}
          <div className="sticky top-24 w-full space-y-6 lg:w-1/3">
            <DocumentInfo
              datePublished={datePublished}
              campus={campus}
              department={department}
            />
            <DocumentStats downloads={downloads} citations={citations} />

            {/* Citation Panel */}
            <ReferencePanel />
          </div>
        </div>
      </main>
    </div>
  )
}

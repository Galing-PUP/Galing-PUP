
import { Header } from "@/components/header";
import { Abstract } from "@/components/paper/abstract";
import { ActionButtons } from "@/components/paper/action-buttons";
import { AiInsights } from "@/components/paper/ai-insights";
import { DocumentInfo } from "@/components/paper/document-info";
import { DocumentStats } from "@/components/paper/document-stats";
import { HeaderInfo } from "@/components/paper/header-info";
import { Keywords } from "@/components/paper/keywords";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type PaperPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaperPage(props: PaperPageProps) {
  const { id: idParam } = await props.params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    notFound();
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      authors: {
        include: {
          author: true,
        },
        orderBy: {
          authorOrder: "asc",
        },
      },
      course: {
        include: {
          college: true,
        },
      },
      resourceType: true,
      library: true,
      keywords: {
        include: {
          keyword: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  const authors = document.authors
    .sort((a, b) => a.authorOrder - b.authorOrder)
    .map((a) => a.author.fullName);

  const yearPublished = document.datePublished.getFullYear().toString();
  const courseName = document.course.courseName;
  const department =
    document.course.college?.collegeName ?? document.course.courseName;
  const campus = document.library.name;
  const documentType = document.resourceType.typeName;
  const keywords = document.keywords.map((k) => k.keyword.keywordText);

  const views = document.citationCount + document.downloadsCount;
  const downloads = document.downloadsCount;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left Column */}
          <div className="flex w-full flex-col space-y-8 lg:w-2/3">
            {/* Paper Title info*/}
            <div>
              <HeaderInfo
                title={document.title}
                authors={authors}
                documentType={documentType}
                yearPublished={yearPublished}
                courseName={courseName}
              />
            </div>

            {/*download, generate citation, add to library, share button*/}
            <div>
              <ActionButtons paperId={id} />
            </div>

            {/* Abstract content of the paper*/}
            <div>
              <Abstract text={document.abstract} />
            </div>

            {/* AI Insights Section */}
            <div>
              <AiInsights />
            </div>

            {/* Keywords Section tags*/}
            <div>
              <Keywords keywords={keywords} />
            </div>
          </div>

          {/* Right Column */}
          <div className="sticky top-24 w-full space-y-6 lg:w-1/3">
            <DocumentInfo
              yearPublished={yearPublished}
              campus={campus}
              department={department}
            />
            <DocumentStats views={views} downloads={downloads} />
          </div>
        </div>
      </main>
    </div>
  );
}
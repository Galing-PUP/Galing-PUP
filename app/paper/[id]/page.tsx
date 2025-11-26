
import { Header } from "@/components/header";
import { Abstract } from "@/components/paper/abstract";
import { ActionButtons } from "@/components/paper/action-buttons";
import { AiInsights } from "@/components/paper/ai-insights";
import { DocumentInfo } from "@/components/paper/document-info";
import { DocumentStats } from "@/components/paper/document-stats";
import { HeaderInfo } from "@/components/paper/header-info";
import { Keywords } from "@/components/paper/keywords";


{/* TODO : make it dynamic per page, for meantime console.log the id params*/}
export default async function PaperPage(props : {params: Promise<{id: string}>}) {
  
  {/*display in console the id in the /paper/<id> */}
  const {id} = await props.params;
  console.log("Displaying paper for ID:", id);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left Column */}
          <div className="flex w-full flex-col space-y-8 lg:w-2/3">

            {/* Paper Title info*/}
            <div>
              <HeaderInfo />
            </div>

            {/*download, generate citation, add to library, share button*/}
            <div>
              <ActionButtons paperId={parseInt(id)} />
            </div>

            {/* Abstract content of the paper*/}
            <div>
              <Abstract />
            </div>

            {/* AI Insights Section */}
            <div>
              <AiInsights />
            </div>

            {/* Keywords Section tags*/}
            <div>
              <Keywords />
            </div>
          </div>

            {/* Right Column */}
          <div className="sticky top-24 w-full space-y-6 lg:w-1/3">
            <DocumentInfo />
            <DocumentStats />
          </div>
        </div>
      </main>
    </div>
  );
}
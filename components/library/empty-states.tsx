import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";
import { Bookmark, FileText } from "lucide-react";

interface NoSearchResultsProps {
  onClear: () => void;
}

export function NoSearchResultsState({ onClear }: NoSearchResultsProps) {
  return (
    <Empty className="border-2 border-dashed border-gray-300 bg-gray-50 py-12">
      <EmptyHeader className="mb-2">
        <EmptyDescription className="text-gray-600 font-medium">
          No bookmarks match your search.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="link"
          onClick={onClear}
          className="text-pup-maroon hover:text-red-900"
        >
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function EmptyLibraryState() {
  return (
    <Empty className="border border-solid border-gray-200 bg-white py-16 shadow-sm">
      <EmptyHeader>
        <EmptyMedia className="rounded-full bg-pup-maroon/10 p-4">
          <FileText className="h-8 w-8 text-pup-maroon" />
        </EmptyMedia>
        <EmptyTitle>Your library is empty</EmptyTitle>
        <EmptyDescription className="mb-8">
          Start building your collection by browsing research papers and saving them for later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/browse">
          <Button className="bg-pup-maroon px-8 py-6 text-base font-semibold text-white transition-all shadow-md hover:bg-red-900 hover:shadow-lg">
            Browse Papers
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export function LoggedOutState() {
  return (
    <Empty className="border border-solid border-gray-200 bg-white py-16 shadow-sm">
      <EmptyHeader>
        <EmptyMedia className="rounded-full bg-pup-maroon/10 p-4">
          <Bookmark className="h-8 w-8 text-pup-maroon" />
        </EmptyMedia>
        <EmptyTitle>Start building your library</EmptyTitle>
        <EmptyDescription className="mb-8">
          Found something useful? Create an account to keep your bookmarks in one place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/signin">
          <Button className="bg-pup-maroon px-8 py-6 text-base font-semibold text-white transition-all shadow-md hover:bg-red-900 hover:shadow-lg">
            Sign in to Save
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}

"use client";

import { AuthorSelector } from "@/components/admin/publications/author-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PublicationFormData } from "@/lib/validations/publication-schema";
import { Users } from "lucide-react";

interface AuthorsSectionProps {
  formData: PublicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<PublicationFormData>>;
  error?: string;
}

export function AuthorsSection({
  formData,
  setFormData,
  error,
}: AuthorsSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Section 2: Authorship</CardTitle>
            <CardDescription className="text-xs">
              Select existing authors or add new contributors
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <AuthorSelector
          selectedAuthors={formData.authors}
          onAuthorsChange={(authors) =>
            setFormData((prev) => ({ ...prev, authors }))
          }
          error={error}
        />
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

import {
  PublicationForm,
  type PublicationFormData,
  type Author,
} from "@/components/admin/publications/publication-form";

export default function Edit() {
  const params = useParams();
  const documentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [initialData, setInitialData] = useState<Partial<PublicationFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing document data
  useEffect(() => {
    if (documentId) {
      const fetchDocumentData = async () => {
        try {
          // Mock data for demonstration
          const { getPublicationById } = await import(
            "@/data/mockPublications"
          );
          const publication = getPublicationById(documentId);

          if (publication) {
            // Convert authors string to Author array
            const authorsArray: Author[] = publication.authors
              .split(",")
              .map((name) => {
                const trimmed = name.trim();
                const parts = trimmed.split(" ");
                return {
                  firstName: parts[0] || "",
                  middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
                  lastName: parts[parts.length - 1] || "",
                  email: "", // Mock data doesn't have emails
                };
              });

            // Convert keywords string to array
            const keywordsArray = publication.keywords
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k);

            setInitialData({
              title: publication.title,
              abstract: publication.abstract,
              keywords: keywordsArray,
              datePublished: publication.datePublished,
              resourceType: publication.resourceType.toUpperCase(), // Convert to match enum
              authors: authorsArray,
              courseId: "1", // Fallback for mock
            });
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching document:", error);
          setIsLoading(false);
        }
      };

      fetchDocumentData();
    }
  }, [documentId]);

  const handleSubmit = (formData: PublicationFormData) => {
    setIsSubmitting(true);
    console.log("Form updated:", formData);
    // TODO: Implement backend update with documentId
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Changes saved successfully.");
      window.history.back();
    }, 1000);
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="w-full h-full space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-pup-maroon">
            Update Publication Details
          </h1>
        </div>
        <p className="text-gray-600">
          Please review and update the publication materials and necessary
          information for this publication using the form below.
        </p>
      </div>

      {initialData && (
        <PublicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          title="Publication Edit Form"
          description="Update fields as needed"
          submitLabel="Save Changes"
          existingFileName="research_document.pdf"
          existingFileSize={4200000}
          existingFileDate="Nov 14, 2023"
        />
      )}
    </div>
  );
}


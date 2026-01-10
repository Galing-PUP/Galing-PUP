"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PublicationForm,
  type PublicationFormData,
} from "@/components/admin/publications/publication-form";

export default function Edit() {
  const params = useParams();
  const router = useRouter();
  const documentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [initialData, setInitialData] = useState<Partial<PublicationFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing document data from API
  useEffect(() => {
    if (documentId) {
      const fetchDocumentData = async () => {
        try {
          const response = await fetch(`/api/admin/documents/${documentId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch document");
          }

          const data = await response.json();

          setInitialData({
            title: data.title,
            abstract: data.abstract,
            keywords: data.keywords,
            datePublished: data.datePublished,
            resourceType: data.resourceType,
            authors: data.authors,
            courseId: data.courseId,
            originalFileName: data.originalFileName,
            fileSize: data.fileSize,
            submissionDate: data.submissionDate,
            filePath: data.filePath,
          });

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching document:", error);
          setError("Failed to load document. Please try again.");
          setIsLoading(false);
        }
      };

      fetchDocumentData();
    }
  }, [documentId]);

  const handleSubmit = async (formData: PublicationFormData) => {
    setIsSubmitting(true);
    
    let promiseResolve: (value: any) => void;
    let promiseReject: (reason?: any) => void;
    const submissionPromise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    toast.promise(submissionPromise, {
        loading: 'Updating publication...',
        success: 'Document updated successfully!',
        error: (err: any) => `Update failed: ${err.message}`,
    });

    try {
      const body = new FormData();
      body.append("title", formData.title);
      body.append("abstract", formData.abstract);
      body.append("keywords", formData.keywords.join(", "));
      body.append("datePublished", formData.datePublished);
      body.append("resourceType", formData.resourceType);
      body.append("authors", JSON.stringify(formData.authors));
      body.append("courseId", formData.courseId);
      
      if (formData.file) {
        body.append("file", formData.file);
      }

      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: "PUT",
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update document");
      }
      
      promiseResolve!(null);

      // Slight delay for UX
      setTimeout(() => {
        router.push("/admin/publication");
      }, 1000);
      
    } catch (error) {
      console.error("Error updating document:", error);
      promiseReject!(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
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

  if (error && !initialData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {initialData && (
        <PublicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          title="Publication Edit Form"
          description="Update fields as needed"
          submitLabel="Save Changes"
          existingFileName={initialData.originalFileName || undefined}
          existingFileSize={initialData.fileSize || undefined}
          existingFileDate={initialData.submissionDate ? new Date(initialData.submissionDate).toLocaleDateString() : undefined}
          existingFilePath={initialData.filePath || undefined}
        />
      )}
    </div>
  );
}

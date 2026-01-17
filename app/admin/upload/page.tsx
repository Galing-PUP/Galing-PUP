"use client";

import { useState } from "react";
import { PublicationForm } from "@/components/admin/publications/publication-form";
import type { PublicationFormData } from "@/lib/validations/publication-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// 11/24/25 - Not navigable yet. To access, use http://localhost:3000/admin/upload for now
export default function Upload() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: PublicationFormData) => {
    if (isSubmitting) return;

    if (!formData.file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    let promiseResolve: (value: any) => void;
    let promiseReject: (reason?: any) => void;
    const submissionPromise = new Promise((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    toast.promise(submissionPromise, {
      loading: 'Uploading publication...',
      success: 'Publication submitted successfully for approval!',
      error: (err: any) => `Submission failed: ${err.message}`,
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
      body.append("file", formData.file);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit publication.");
      }

      const data = await res.json();
      console.log("Document created:", data);

      promiseResolve!(data);

      // Trigger Ingestion with Streaming Feedback
      if (data.id) {
        const toastId = toast.loading("Initializing AI processing...");

        try {
          // Dynamic import to avoid SSR issues if any, though regular import is fine here
          const { streamIngest } = await import("@/lib/utils/ingest-client");

          await streamIngest(data.id, (step) => {
            if (step.step === "complete") {
              toast.success("AI Processing Complete!", { id: toastId });
            } else if (step.step === "error") {
              toast.error(`AI Processing Failed: ${step.message}`, { id: toastId });
            } else {
              // Update toast with progress
              toast.loading(
                <div className="space-y-2 min-w-[200px]">
                  <p className="text-sm font-medium">{step.message}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-pup-maroon h-full transition-all duration-300 ease-out"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>,
                { id: toastId }
              );
            }
          });
        } catch (err) {
          console.error("Ingestion error:", err);
          toast.error("AI Processing notification error", { id: toastId });
        }
      }

      // Slight delay before redirect to let user see success message
      setTimeout(() => {
        router.push("/admin/publication");
      }, 1000);

    } catch (error) {
      console.error(error);
      promiseReject!(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-full h-full relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-pup-maroon">
            Welcome to the Submission Portal!
          </h1>
        </div>
        <p className="text-gray-600">
          Please upload your publication materials and necessary information
          for approval using the form below.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <PublicationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        title="Publication Submission Form"
        description="All fields are required"
        submitLabel="Submit for Approval"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  PublicationForm,
  type PublicationFormData,
} from "@/components/admin/publications/publication-form";
import { useRouter } from "next/navigation";

// 11/24/25 - Not navigable yet. To access, use http://localhost:3000/admin/upload for now
export default function Upload() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: PublicationFormData) => {
    if (isSubmitting) return;

    if (!formData.file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const body = new FormData();
    body.append("title", formData.title);
    body.append("abstract", formData.abstract);
    body.append("keywords", formData.keywords.join(", ")); // Convert array to comma-separated string
    body.append("datePublished", formData.datePublished);
    body.append("resourceType", formData.resourceType);

    // Convert authors array to JSON string for API
    body.append("authors", JSON.stringify(formData.authors));

    body.append("courseId", formData.courseId);
    body.append("file", formData.file);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to submit publication.");
      }

      const data = await res.json();
      console.log("Document created:", data);

      // Show success message and redirect
      alert("Publication submitted successfully for approval!");
      router.push("/admin/publication");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "There was an error submitting your publication. Please try again."
      );
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
            Welcome to the Publication Portal!
          </h1>
        </div>
        <p className="text-gray-600">
          Please upload your publication materials and necessary information
          using the form below.
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

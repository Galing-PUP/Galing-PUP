"use client";

import { AuthorsSection } from "@/components/admin/publications/form-sections/authors-section";
import { BasicInfoSection } from "@/components/admin/publications/form-sections/basic-info";
import { FileSection } from "@/components/admin/publications/form-sections/file-section";
import { Button } from "@/components/ui/button";
import {
  publicationEditSchema,
  PublicationFormData,
  publicationSchema,
} from "@/lib/validations/publication-schema";
import { FormEvent, useState } from "react";

interface PublicationFormProps {
  initialData?: Partial<PublicationFormData>;
  onSubmit: (data: PublicationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title: string;
  description: string;
  submitLabel: string;
  existingFileName?: string;
  existingFileSize?: number;
  existingFileDate?: string;
  existingFilePath?: string;
  documentId?: number;
  documentToken?: string;
}

/**
 * A modern, sectioned form component for managing research publications.
 * Features multi-author management, tag chips, drag-and-drop file upload,
 * and AI summary placeholder.
 */
export function PublicationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title,
  description,
  submitLabel,
  existingFileName,
  existingFileSize,
  existingFileDate,
  existingFilePath,
  documentId,
  documentToken,
}: PublicationFormProps) {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: initialData?.title || "",
    abstract: initialData?.abstract || "",
    keywords: initialData?.keywords || [],
    datePublished: initialData?.datePublished || "",
    resourceType: initialData?.resourceType || "",
    authors: initialData?.authors || [],
    courseId: initialData?.courseId || "",
    file: null,
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submitData = {
      ...formData,
      file: uploadedFiles[0] || formData.file,
    };

    // Validate with Zod
    const schema = existingFileName ? publicationEditSchema : publicationSchema;
    const result = schema.safeParse(submitData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);

      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Section 1: Metadata */}
      <BasicInfoSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />

      {/* Section 2: Authorship */}
      <AuthorsSection
        formData={formData}
        setFormData={setFormData}
        error={errors.authors}
      />

      {/* Section 3: File Management */}
      <FileSection
        formData={formData}
        setFormData={setFormData}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        existingFileName={existingFileName}
        existingFileSize={existingFileSize}
        existingFileDate={existingFileDate}
        existingFilePath={existingFilePath}
        documentId={documentId}
        documentToken={documentToken}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

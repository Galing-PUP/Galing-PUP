"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { FormInput } from "@/components/admin/publications/form-input";
import { FormTextarea } from "@/components/admin/publications/form-textarea";
import { FormSelect } from "@/components/admin/publications/form-select";
import { FormDatePicker } from "@/components/admin/publications/form-date-picker";
import { VisibilityToggle } from "@/components/admin/publications/visibility-toggle";
import { FormFileUpload } from "@/components/admin/publications/form-file-upload";

// 11/24/25 - Not navigable yet. To access, use http://localhost:3000/admin/upload for now
export default function Upload() {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    datePublished: "",
    resourceType: "",
    visibility: "public",
    authors: "",
    courseId: "",
    library: "",
    file: null as File | null,
  });

  const [courseOptions, setCourseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown options
  const resourceTypeOptions = [
    { value: "thesis", label: "Thesis" },
    { value: "capstone", label: "Capstone" },
    { value: "article", label: "Article" },
    { value: "dissertation", label: "Dissertation" },
    { value: "journal", label: "Journal" },
  ];

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) {
          throw new Error(`Failed to load courses: ${res.status}`);
        }
        const data: { id: number; courseName: string }[] = await res.json();
        setCourseOptions(
          data.map((c) => ({
            value: String(c.id),
            label: c.courseName,
          })),
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadCourses();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);

    const body = new FormData();
    body.append("title", formData.title);
    body.append("abstract", formData.abstract);
    body.append("keywords", formData.keywords);
    body.append("datePublished", formData.datePublished);
    body.append("resourceType", formData.resourceType);
    body.append("visibility", formData.visibility);
    body.append("authors", formData.authors);
    body.append("courseId", formData.courseId);
    body.append("library", formData.library);
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
      alert("Publication submitted successfully for approval.");
      handleCancel();
    } catch (error) {
      console.error(error);
      alert(
        "There was an error submitting your publication. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      abstract: "",
      keywords: "",
      datePublished: "",
      resourceType: "",
      visibility: "public",
      authors: "",
      courseId: "",
      library: "",
      file: null,
    });
  };

  return (
    <div className="w-full h-full relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold" style={{ color: "#800000" }}>
            Welcome to the Publication Portal!
          </h1>
        </div>
        <p className="text-gray-600">
          Please upload your publication materials and necessary information
          using the form below.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Publication Submission Form
            </h2>
            <p className="text-sm text-gray-500">All fields are required</p>
          </div>

          {/* Basic Information Section */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#800000" }}
            >
              Basic Information
            </h3>

            {/* Publication Title */}
            <div className="mb-6">
              <FormInput
                label="Publication Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter the full title of the publication"
              />
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <FormTextarea
                label="Abstract"
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                placeholder="Enter a brief summary of your research (150-300 words)"
              />
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <FormInput
                label="Keywords"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="Enter relevant keywords separated by commas (e.g., AI, machine learning, data analysis)"
              />
            </div>

            {/* Date and Resource Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Date of Publication */}
              <FormDatePicker
                label="Date of Publication"
                id="datePublished"
                name="datePublished"
                value={formData.datePublished}
                onChange={handleInputChange}
              />

              {/* Resource Type */}
              <FormSelect
                label="Resource Type"
                id="resourceType"
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                placeholder="Select type of resource"
                options={resourceTypeOptions}
              />

              {/* Visibility */}
              <VisibilityToggle
                value={formData.visibility}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Authorship & Academic Details Section */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#800000" }}
            >
              Authorship & Academic Details
            </h3>

            {/* Authors - Full Row */}
            <div className="mb-6">
              <FormInput
                label="Authors"
                id="authors"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                placeholder="Enter all authors (e.g., Juan Dela Cruz, Maria Santos)"
              />
            </div>

            {/* Course Row */}
            <div className="mb-6">
              <FormSelect
                label="Course"
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                placeholder="Select the course (e.g., BS Computer Science)"
                options={courseOptions}
              />
            </div>

            {/* Library - Full Row */}
            <div className="mb-6">
              <FormInput
                label="Library"
                id="library"
                name="library"
                value={formData.library}
                onChange={handleInputChange}
                placeholder="Enter the affiliated library"
              />
            </div>
          </div>

          {/* File Submission Section */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#800000" }}
            >
              File Submission
            </h3>

            <FormFileUpload
              label="File Upload"
              id="file"
              name="file"
              file={formData.file}
              onChange={handleFileChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white rounded-md transition-colors font-medium"
              style={{
                color: "#800000",
                borderColor: "#800000",
                borderWidth: "1px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-white rounded-md transition-colors font-medium shadow-md"
              style={{ backgroundColor: "#800000" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#660000")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#800000")
              }
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

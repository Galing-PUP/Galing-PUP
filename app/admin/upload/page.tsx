"use client";

import { useState } from "react";
import { FormInput } from "@/components/admin/publications/form-input";
import { FormTextarea } from "@/components/admin/publications/form-textarea";
import { FormSelect } from "@/components/admin/publications/form-select";
import { FormDatePicker } from "@/components/admin/publications/form-date-picker";
import { VisibilityToggle } from "@/components/admin/publications/visibility-toggle";
import { FormFileUpload } from "@/components/admin/publications/form-file-upload";

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
    adviser: "",
    campus: "",
    college: "",
    department: "",
    library: "",
    file: null as File | null,
  });

  // Dropdown options
  const resourceTypeOptions = [
    { value: "thesis", label: "Thesis" },
    { value: "capstone", label: "Capstone" },
    { value: "article", label: "Article" },
    { value: "dissertation", label: "Dissertation" },
    { value: "journal", label: "Journal" },
  ];

  const campusOptions = [
    { value: "main", label: "Main Campus (Sta. Mesa)" },
    { value: "bataan", label: "Bataan Branch" },
    { value: "bansud", label: "Bansud Branch" },
    { value: "lopez", label: "Lopez Branch" },
    { value: "mulanay", label: "Mulanay Branch" },
    { value: "unisan", label: "Unisan Branch" },
  ];

  const collegeOptions = [
    { value: "coe", label: "College of Engineering" },
    {
      value: "cics",
      label: "College of Computer and Information Sciences",
    },
    { value: "cba", label: "College of Business Administration" },
    { value: "coed", label: "College of Education" },
    { value: "coss", label: "College of Social Sciences" },
    { value: "caf", label: "College of Architecture and Fine Arts" },
  ];

  const departmentOptions = [
    { value: "cs", label: "Department of Computer Science" },
    { value: "it", label: "Department of Information Technology" },
    { value: "ce", label: "Department of Civil Engineering" },
    { value: "me", label: "Department of Mechanical Engineering" },
    { value: "ee", label: "Department of Electrical Engineering" },
    { value: "accounting", label: "Department of Accounting" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Implement backend submission
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
      adviser: "",
      campus: "",
      college: "",
      department: "",
      library: "",
      file: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

            {/* Adviser and Campus Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormInput
                label="Adviser"
                id="adviser"
                name="adviser"
                value={formData.adviser}
                onChange={handleInputChange}
                placeholder="Enter the full name of your adviser"
              />

              <FormSelect
                label="Campus"
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
                placeholder="Select your campus or branch"
                options={campusOptions}
              />
            </div>

            {/* College and Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormSelect
                label="College"
                id="college"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                placeholder="Select the college name (e.g., College of Engineering)"
                options={collegeOptions}
              />

              <FormSelect
                label="Department"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Select your department (e.g., Department of Computer Science)"
                options={departmentOptions}
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
              className="px-6 py-2 text-white rounded-md transition-colors font-medium shadow-md"
              style={{ backgroundColor: "#800000" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#660000")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#800000")
              }
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

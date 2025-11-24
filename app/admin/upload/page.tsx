"use client";

import { useState } from "react";

export default function Upload() {
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
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Publication Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
                placeholder="Enter the full title of the publication"
                required
              />
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <label
                htmlFor="abstract"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Abstract
              </label>
              <textarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent resize-none"
                style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
                placeholder="Enter a brief summary of your research (150-300 words)"
                required
              />
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
                placeholder="Enter relevant keywords separated by commas (e.g., AI, machine learning, data analysis)"
                required
              />
            </div>

            {/* Date and Resource Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Date of Publication */}
              <div>
                <label
                  htmlFor="datePublished"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date of Publication
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="datePublished"
                    name="datePublished"
                    value={formData.datePublished}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent scheme-light [&::-webkit-calendar-picker-indicator]:opacity-0"
                    style={
                      {
                        "--tw-ring-color": "#4B5563",
                      } as React.CSSProperties
                    }
                    required
                  />
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Resource Type */}
              <div>
                <label
                  htmlFor="resourceType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Resource Type
                </label>
                <div className="relative">
                  <select
                    id="resourceType"
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white appearance-none"
                    style={
                      {
                        "--tw-ring-color": "#4B5563",
                      } as React.CSSProperties
                    }
                    required
                  >
                    <option value="">Select type of resource</option>
                    <option value="thesis">Thesis</option>
                    <option value="capstone">Capstone</option>
                    <option value="article">Article</option>
                    <option value="dissertation">Dissertation</option>
                    <option value="journal">Journal</option>
                  </select>
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <div className="flex border border-gray-300 rounded-md overflow-hidden h-10">
                  <label
                    className={`flex-1 flex items-center justify-center gap-3 cursor-pointer transition-colors ${
                      formData.visibility === "public"
                        ? "bg-red-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === "public"}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.visibility === "public"
                          ? "border-[#800000]"
                          : "border-gray-400"
                      }`}
                    >
                      {formData.visibility === "public" && (
                        <div className="w-3 h-3 rounded-full bg-[#800000]" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Public
                    </span>
                  </label>
                  <div className="w-px bg-gray-300" />
                  <label
                    className={`flex-1 flex items-center justify-center gap-3 cursor-pointer transition-colors ${
                      formData.visibility === "restricted"
                        ? "bg-red-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="restricted"
                      checked={formData.visibility === "restricted"}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.visibility === "restricted"
                          ? "border-[#800000]"
                          : "border-gray-400"
                      }`}
                    >
                      {formData.visibility === "restricted" && (
                        <div className="w-3 h-3 rounded-full bg-[#800000]" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Restricted
                    </span>
                  </label>
                </div>
              </div>
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
              <label
                htmlFor="authors"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Authors
              </label>
              <input
                type="text"
                id="authors"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
                placeholder="Enter all authors (e.g., Juan Dela Cruz, Maria Santos)"
                required
              />
            </div>

            {/* Adviser and Campus Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="adviser"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adviser
                </label>
                <input
                  type="text"
                  id="adviser"
                  name="adviser"
                  value={formData.adviser}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                  style={
                    { "--tw-ring-color": "#4B5563" } as React.CSSProperties
                  }
                  placeholder="Enter the full name of your adviser"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="campus"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Campus
                </label>
                <div className="relative">
                  <select
                    id="campus"
                    name="campus"
                    value={formData.campus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white appearance-none"
                    style={
                      {
                        "--tw-ring-color": "#4B5563",
                      } as React.CSSProperties
                    }
                    required
                  >
                    <option value="">Select your campus or branch</option>
                    <option value="main">Main Campus (Sta. Mesa)</option>
                    <option value="bataan">Bataan Branch</option>
                    <option value="bansud">Bansud Branch</option>
                    <option value="lopez">Lopez Branch</option>
                    <option value="mulanay">Mulanay Branch</option>
                    <option value="unisan">Unisan Branch</option>
                  </select>
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* College and Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="college"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  College
                </label>
                <div className="relative">
                  <select
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white appearance-none"
                    style={
                      {
                        "--tw-ring-color": "#4B5563",
                      } as React.CSSProperties
                    }
                    required
                  >
                    <option value="">
                      Select the college name (e.g., College of Engineering)
                    </option>
                    <option value="coe">College of Engineering</option>
                    <option value="cics">
                      College of Computer and Information Sciences
                    </option>
                    <option value="cba">
                      College of Business Administration
                    </option>
                    <option value="coed">College of Education</option>
                    <option value="coss">College of Social Sciences</option>
                    <option value="caf">
                      College of Architecture and Fine Arts
                    </option>
                  </select>
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent bg-white appearance-none"
                    style={
                      {
                        "--tw-ring-color": "#4B5563",
                      } as React.CSSProperties
                    }
                    required
                  >
                    <option value="">
                      Select your department (e.g., Department of Computer
                      Science)
                    </option>
                    <option value="cs">Department of Computer Science</option>
                    <option value="it">
                      Department of Information Technology
                    </option>
                    <option value="ce">Department of Civil Engineering</option>
                    <option value="me">
                      Department of Mechanical Engineering
                    </option>
                    <option value="ee">
                      Department of Electrical Engineering
                    </option>
                    <option value="accounting">Department of Accounting</option>
                  </select>
                  <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Library - Full Row */}
            <div className="mb-6">
              <label
                htmlFor="library"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Library
              </label>
              <input
                type="text"
                id="library"
                name="library"
                value={formData.library}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#4B5563" } as React.CSSProperties}
                placeholder="Enter the affiliated library"
                required
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

            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                File Upload
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="file"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  Upload File
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  required
                />
                <div className="flex-1 px-4 py-2 border border-gray-300 rounded-md">
                  <span className="text-sm text-gray-500">
                    {formData.file ? formData.file.name : "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
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

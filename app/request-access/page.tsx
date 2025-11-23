"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import sideIllustration from "@/assets/Graphics/side-img-staff-registration.png";

export default function RequestAccessPage() {
  // State to track form values
  const [formData, setFormData] = useState({
    fullName: "Tonie Marie U. Followe",
    college: "",
    email: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [fileName, setFileName] = useState("No file chosen");
  const [hasFile, setHasFile] = useState(false);
  
  // State for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setHasFile(true);
    } else {
      setFileName("No file chosen");
      setHasFile(false);
    }
  };

  // Logic to determine if the button should be enabled
  const doPasswordsMatch =
    formData.password && formData.password === formData.confirmPassword;
  
  const areAllFieldsFilled =
    formData.fullName.trim() !== "" &&
    formData.college !== "" &&
    formData.email.trim() !== "" &&
    formData.idNumber.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "";

  const isFormValid = doPasswordsMatch && areAllFieldsFilled && hasFile;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left Side - Background Illustration */}
      <div className="relative hidden lg:flex lg:w-[45%]">
        <div className="relative h-full w-full overflow-hidden bg-[#3d0a0a]">
          <Image
            src={sideIllustration}
            alt="Staff registration illustration"
            fill
            priority
            className="object-cover object-[0%_center]"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative -ml-20 flex flex-1 flex-col overflow-y-auto rounded-l-3xl bg-neutral-50 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        {/* Back Button */}
        <div className="absolute left-8 top-8 z-10">
          <Link
            href="/admin/signin"
            className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="flex min-h-full items-center justify-center px-25 py-20">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-900">
                Request your staff account
              </h1>
              <p className="text-sm text-neutral-500">
                Fill out the form to apply for a staff account and begin your journey with us.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              {/* College Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="college"
                  className="block text-sm font-medium text-neutral-900"
                >
                  College
                </label>
                <div className="relative">
                  <select
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  > 
                    <option value="">Select your college or department</option>
                    <option value="CAF">College of Accountancy and Finance (CAF)</option>
                    <option value="CE">College of Engineering (CEA)</option>
                    <option value="CADBE">College of Architecture, Design and the Built Environment (CADBE)</option>
                    <option value="CAL">College of Arts and Letters (CAL)</option>
                    <option value="CBA">College of Business Administration (CBA)</option>
                    <option value="COC">College of Communication (COC)</option>
                    <option value="CCIS">College of Computer and Information Sciences (CCIS)</option>
                    <option value="COED">College of Education (COED)</option>
                    <option value="CHK">College of Human Kinetics (CHK)</option>
                    <option value="COL">College of Law (COL)</option>
                    <option value="CPSPA">College of Political Science and Public Administration (CPSPA)</option>
                    <option value="CSSD">College of Social Sciences and Development (CSSD)</option>
                    <option value="CS">College of Science (CS)</option>
                    <option value="CTHTM">College of Tourism, Hospitality and Transportation Management (CTHTM)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-neutral-400"
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

              {/* Email Address and ID Number Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your official email address"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    ID Number
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your ID number"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm your password"
                      className={`w-full rounded-md border px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 
                        ${
                          formData.confirmPassword && !doPasswordsMatch
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-neutral-300 focus:border-neutral-400 focus:ring-neutral-400"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {/* Visual hint if passwords don't match */}
                    {formData.confirmPassword && !doPasswordsMatch && (
                      <p className="absolute -bottom-5 left-0 text-xs text-red-600">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ID Image Upload */}
              <div className="space-y-1.5">
                <label
                  htmlFor="idImage"
                  className="block text-sm font-medium text-neutral-900"
                >
                  ID Image
                </label>
                <div className="flex items-stretch gap-0">
                  <label
                    htmlFor="idImage"
                    className="flex cursor-pointer items-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
                  >
                    Upload File
                  </label>
                  <input
                    type="file"
                    id="idImage"
                    name="idImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-1 items-center rounded-r-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-400">
                    {fileName}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6">
                <Link
                  href="/admin/signin"
                  className="px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:text-neutral-900"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white transition 
                    ${
                      isFormValid
                        ? "bg-[#7C1D1D] hover:bg-[#5a1515] cursor-pointer"
                        : "bg-neutral-400 cursor-not-allowed opacity-70"
                    }
                  `}
                >
                  Create Account Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
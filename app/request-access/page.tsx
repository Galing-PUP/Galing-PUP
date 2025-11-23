import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import sideIllustration from "@/assets/Graphics/side-img-staff-registration.png";

export default function RequestAccessPage() {
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
                  defaultValue="Tonie Marie U. Followe"
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
                    className="w-full appearance-none rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  > 
                    <option value="">Select your college or department</option>
                    <option value="CAF">College of Accountancy and Finance (CAF)</option>
                    <option value="CEA">College of Engineering and Architecture (CEA)</option>
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
                    placeholder="Enter your ID number"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-900"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
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
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-1 items-center rounded-r-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-400">
                    No file chosen
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
                  className="rounded-md bg-[#7C1D1D] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a1515]"
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

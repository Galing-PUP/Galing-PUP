"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-staff-signin.png";

export default function AdminSignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Back Button */}
      <div className="absolute left-6 top-6 z-10 md:left-8 md:top-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-1/2 lg:px-16">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <Image
              src={starLogo}
              alt="Galing PUP star logo"
              width={64}
              height={64}
              priority
              className="h-14 w-14"
            />

            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-neutral-900">
                Sign in to your account
              </h1>
              <p className="text-sm text-neutral-500">
                Please sign in to access your account and internal resources.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-900"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="staff.login@galingpup.edu.ph"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-1 focus:ring-[#7C1D1D]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
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
                    placeholder="Password"
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-1 focus:ring-[#7C1D1D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 bg-white text-[#7C1D1D] focus:ring-2 focus:ring-[#7C1D1D] focus:ring-offset-0"
                    defaultChecked
                  />
                  <span className="text-sm text-neutral-900">Remember Me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#7C1D1D] transition hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-[#7C1D1D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5a1515]"
              >
                Sign In
              </button>
            </form>

            {/* Request Access Link */}
            <div className="text-center">
              <p className="text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/request-access"
                  className="font-semibold text-[#7C1D1D] transition hover:underline"
                >
                  Request access.
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Background Illustration */}
        <div className="relative hidden lg:flex lg:w-1/2">
          <div className="absolute inset-0 flex items-center justify-end">
            <Image
              src={sideIllustration}
              alt="Admin illustration for sign in"
              width={680}
              height={1024}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

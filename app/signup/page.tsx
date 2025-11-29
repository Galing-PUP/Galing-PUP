"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-user-signin.png";
import { Button } from "@/components/button";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation
  const isEmailValid = email.endsWith("@gmail.com") || email === "";
  
  // Password validation rules
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== "";

  // Generate password error message
  const getPasswordError = () => {
    if (!password) return "";
    const errors = [];
    if (!passwordValidation.minLength) errors.push("at least 8 characters");
    if (!passwordValidation.hasUppercase) errors.push("one uppercase letter");
    if (!passwordValidation.hasLowercase) errors.push("one lowercase letter");
    if (!passwordValidation.hasNumber) errors.push("one number");
    if (!passwordValidation.hasSpecial) errors.push("one special character");
    
    if (errors.length === 0) return "";
    return `Password must contain ${errors.join(", ")}.`;
  };

  const passwordError = getPasswordError();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
      <div className="flex w-full flex-col overflow-y-auto px-6 py-8 lg:w-1/2 lg:px-16 lg:py-12">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <Image
            src={starLogo}
            alt="Galing PUP star logo"
            width={64}
            height={64}
            priority
            className="h-14 w-14"
          />

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-neutral-900">
              Create your account
            </h1>
            <p className="text-base text-neutral-500">
              Join us to start your learning journey.
            </p>
          </div>

          <form className="flex flex-col gap-6">
            {/* Username Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-neutral-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/10"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className={`rounded-lg border px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                  !isEmailValid
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                    : "border-neutral-300 focus:border-[#7C1D1D] focus:ring-[#7C1D1D]/10"
                }`}
              />
              {!isEmailValid && (
                <p className="text-sm text-red-600">
                  Email must end with @gmail.com
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Password
              </label>
              {passwordError && (
                <p className="text-sm text-red-600">
                  {passwordError}
                </p>
              )}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full rounded-lg border px-4 py-3 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                    doPasswordsMatch
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/10"
                      : confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                      : "border-neutral-300 focus:border-[#7C1D1D] focus:ring-[#7C1D1D]/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
              {doPasswordsMatch && (
                <p className="text-sm text-green-600">
                  ✓ Passwords match
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              shape="rounded"
              disabled={!username || !isEmailValid || !isPasswordValid || !doPasswordsMatch}
              onClick={() => {
                // TODO: Implement signup logic when database is ready
                console.log("Sign up clicked - functionality to be implemented");
              }}
            >
              Sign Up
            </Button>
          </form>
        </div>

        <div className="mt-auto flex justify-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-[#7C1D1D] transition hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-end pt-2 lg:flex">
        <Image
          src={sideIllustration}
          alt="Student illustration for sign up"
          width={680}
          height={1024}
          priority
          className="-mr-8 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

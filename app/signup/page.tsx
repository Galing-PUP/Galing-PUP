"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-user-signin.png";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, GoogleIcon } from "@/components/button";
import { signInWithGooglePopup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { checkUsernameAvailability, checkUserStatus, createUserInDb } from "@/lib/actions";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(email) || email === "";

  // Function to validate username format
  // Rules: No spaces, no special characters except dots
  const validateUsername = (value: string) => {
    if (!value) return "";
    if (/\s/.test(value)) return "Spaces are not allowed";
    if (!/^[a-zA-Z0-9.]+$/.test(value)) return "Special characters are not allowed";
    return "";
  };

  // Handle username input changes and update error state
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(validateUsername(value));
  };

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
      <div className="flex w-full flex-col px-6 py-6 lg:w-1/2 lg:px-16 lg:py-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6">
          <Image
            src={starLogo}
            alt="Galing PUP star logo"
            width={56}
            height={56}
            priority
            className="h-12 w-12"
          />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Create your account
            </h1>
            <p className="text-sm text-neutral-500">
              Join us to start your learning journey.
            </p>
          </div>

          <form className="flex flex-col gap-4">
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-neutral-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className={`rounded-lg border px-4 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${usernameError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-neutral-300 focus:border-[#7C1D1D] focus:ring-[#7C1D1D]/10"
                  }`}
              />
              {usernameError && (
                <p className="text-sm text-red-600">{usernameError}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className={`rounded-lg border px-4 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${!isEmailValid
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-neutral-300 focus:border-[#7C1D1D] focus:ring-[#7C1D1D]/10"
                  }`}
              />
              {!isEmailValid && email !== "" && (
                <p className="text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
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
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/10"
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
            <div className="flex flex-col gap-1.5">
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
                  className={`w-full rounded-lg border px-4 py-2.5 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${doPasswordsMatch
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
              disabled={!username || !email || !password || !confirmPassword || !isEmailValid || !isPasswordValid || !doPasswordsMatch || !!usernameError || loading}
              onClick={async () => {
                setLoading(true);
                try {
                  // Step 1: Check if username is already taken in the database
                  const { exists: usernameExists } = await checkUsernameAvailability(username);
                  if (usernameExists) {
                    toast.error("Username already exists, please login");
                    setLoading(false);
                    return;
                  }

                  // Step 2: Create the user account in Supabase
                  const supabase = createClient();
                  const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                      data: {
                        username,
                      },
                    },
                  });

                  // Step 3: Handle potential errors during signup
                  if (error) {
                    if (error.message.includes("already registered")) {
                      // If user exists, check if they are verified
                      const status = await checkUserStatus(email);
                      if (status.exists && !status.isVerified) {
                        // If unverified, redirect to OTP page to finish setup
                        toast.error("User already registered but not verified. Redirecting to verification...");
                        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
                      } else {
                        // If verified, ask them to login
                        toast.error("User already registered, please login");
                      }
                    } else {
                      toast.error(error.message);
                    }
                    return;
                  }

                  // Step 4: Signup successful, create user in DB and redirect
                  if (data.user) {
                    await createUserInDb(email, username, data.user.id, password);
                  }

                  toast.success("Account created! Please verify your email.");
                  router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
                } catch (error: any) {
                  toast.error("An unexpected error occurred");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              Or continue with
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-neutral-50"
              onClick={async () => {
                try {
                  await signInWithGooglePopup("signup");
                  toast.success("Account created successfully");
                  router.push("/");
                  router.refresh();
                } catch (error: any) {
                  toast.error(error.message || "Sign up failed");
                }
              }}
            >
              <GoogleIcon />
            </button>
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

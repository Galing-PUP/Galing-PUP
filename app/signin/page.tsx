"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-user-signin.png";
import { Button, GoogleIcon } from "@/components/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signInWithGooglePopup } from "@/lib/auth";
import { checkUserStatus, verifyCredentials } from "@/lib/actions";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGooglePopup("signin");
      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Perform pre-login checks against the database
      // This ensures we give specific feedback before attempting Supabase auth
      const status = await checkUserStatus(email);

      if (!status.exists) {
        toast.error("User is not found please signup");
        setLoading(false);
        return;
      }

      // Check if user is an admin (Role ID 3 or 4)
      if (status.isAdmin) {
        toast.error("Please login using the admin portal");
        setLoading(false);
        return;
      }

      // Check if user is verified
      if (!status.isVerified) {
        if (status.roleId === 1 && status.updatedDate) {
          toast.error("Your account is currently ON HOLD, please contact the support team");
          setLoading(false);
          return;
        }

        toast.error("User is not verified, please check your email for the code");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        setLoading(false);
        return;
      }

      // Step 2: Verify credentials against the database hash
      const isValid = await verifyCredentials(email, password);
      if (!isValid) {
        toast.error("Invalid password please try again");
        setLoading(false);
        return;
      }

      // Step 3: Attempt to sign in with Supabase
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    router.push("/");
    router.refresh();
  };

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
              Sign in to your account
            </h1>
            <p className="text-base text-neutral-500">
              Let&apos;s get you back to learning and discovery.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-[#7C1D1D] hover:underline"
                onClick={() => router.push('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                shape="rounded"
                onClick={(e: any) => handleSignIn(e)}
              >
                Sign In
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                shape="rounded"
                className="border-neutral-300"
                onClick={handleGuestLogin}
              >
                Continue as Guest
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              Or continue with
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-neutral-50"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
            </button>
          </div>
        </div>

        <div className="mt-auto flex justify-center">
          <p className="text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#7C1D1D] transition hover:underline"
            >
              Create One
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-end pt-2 lg:flex">
        <Image
          src={sideIllustration}
          alt="Student illustration for sign in"
          width={680}
          height={1024}
          priority
          className="-mr-8 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-user-signin.png";
import { Button, GoogleIcon } from "@/components/button";

export default function SignInPage() {
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
                className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[#7C1D1D] focus:outline-none focus:ring-2 focus:ring-[#7C1D1D]/20"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              icon={<GoogleIcon />}
              iconPosition="left"
              className="border-neutral-300"
              shape="rounded"
            >
              Continue with Google
            </Button>

            <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              OR
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              shape="rounded"
            >
              Continue as Guest
            </Button>
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
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import starLogo from "@/assets/Logo/star-logo-yellow.png";
import sideIllustration from "@/assets/Graphics/side-img-user-signin.png";

export default function SignUpPage() {
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
            {/* Form fields will be added here */}
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

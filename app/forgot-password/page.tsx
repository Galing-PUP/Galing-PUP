"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { checkUserStatus } from "@/lib/actions";

import sideIllustration from "@/assets/Graphics/side-img-staff-registration.png";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Check if user exists first
            const status = await checkUserStatus(email);
            if (!status.exists) {
                toast.error("No account found with this email address.");
                setIsSubmitting(false);
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) {
                throw error;
            }

            toast.success("Password reset link sent! Please check your email.");
            setEmail("");
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast.error(error.message || "Failed to send reset link");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Left Side - Background Illustration */}
            <div className="relative hidden lg:flex lg:w-[45%]">
                <div className="relative h-full w-full overflow-hidden bg-[#3d0a0a]">
                    <Image
                        src={sideIllustration}
                        alt="Forgot password illustration"
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
                        href="/signin" // Default back to generic signin
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
                                Forgot Password?
                            </h1>
                            <p className="text-sm text-neutral-500">
                                Enter your email address and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Address */}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your registered email"
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Link
                                    href="/signin"
                                    className="px-6 py-2.5 text-sm font-semibold text-neutral-700 transition hover:text-neutral-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={!email || isSubmitting}
                                    className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white transition 
                    ${email && !isSubmitting
                                            ? "bg-[#7C1D1D] hover:bg-[#5a1515] cursor-pointer"
                                            : "bg-neutral-400 cursor-not-allowed opacity-70"
                                        }
                  `}
                                >
                                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

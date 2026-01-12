"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import sideIllustration from "@/assets/Graphics/side-img-staff-registration.png";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        const toastId = toast.loading("Updating password...");

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                throw error;
            }

            toast.success("Password updated successfully!", { id: toastId });

            // Redirect to sign in after a short delay
            setTimeout(() => {
                router.push("/signin");
            }, 2000);

        } catch (error: any) {
            console.error("Update password error:", error);
            toast.error(error.message || "Failed to update password", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const doPasswordsMatch = password && password === confirmPassword;

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* Left Side - Background Illustration */}
            <div className="relative hidden lg:flex lg:w-[45%]">
                <div className="relative h-full w-full overflow-hidden bg-[#3d0a0a]">
                    <Image
                        src={sideIllustration}
                        alt="Update password illustration"
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
                        href="/signin"
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
                                Update Password
                            </h1>
                            <p className="text-sm text-neutral-500">
                                Please create a new password for your account.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter new password"
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
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm new password"
                                        className={`w-full rounded-md border px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 
                        ${confirmPassword && !doPasswordsMatch
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
                                    {confirmPassword && !doPasswordsMatch && (
                                        <p className="absolute -bottom-5 left-0 text-xs text-red-600">
                                            Passwords do not match
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-6">
                                <button
                                    type="submit"
                                    disabled={!doPasswordsMatch || isSubmitting}
                                    className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white transition 
                    ${doPasswordsMatch && !isSubmitting
                                            ? "bg-[#7C1D1D] hover:bg-[#5a1515] cursor-pointer"
                                            : "bg-neutral-400 cursor-not-allowed opacity-70"
                                        }
                  `}
                                >
                                    {isSubmitting ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

/**
 * Sign Up Form Component
 *
 * Handles user registration with Lightswind components.
 * Uses React Hook Form + Zod validation.
 * Integrates with Better Auth for registration.
 *
 * @see plan.md - T034
 */

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CiMail } from "react-icons/ci";
import { LuLoaderPinwheel } from "react-icons/lu";
import { TfiLock, TfiUser } from "react-icons/tfi";
import { toast } from "sonner";
import { Button } from "@/components/lightswind/button";
import { Checkbox } from "@/components/lightswind/checkbox";
import { Input } from "@/components/lightswind/input";
import { Label } from "@/components/lightswind/label";
import { signUp } from "@/lib/auth-client";
import { type SignupFormData, signupSchema } from "@/lib/schemas/auth";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { ConfettiButton, type ConfettiButtonHandle } from "../lightswind/confetti-button";
import { PasswordStrengthIndicator } from "../lightswind/password-strength-indicator";

export function SignUpForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const confettiRef = useRef<ConfettiButtonHandle>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);

        try {
            const { error: signUpError } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                callbackURL: "/dashboard",
            });

            if (signUpError) {
                toast.error(signUpError.message || "Failed to create account");
                return;
            }

            toast.success("Account created successfully!");
            confettiRef.current?.triggerConfetti();
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error("Sign up error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-sm text-muted-foreground">Enter your details to get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                        <TfiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" placeholder="John Doe" className="pl-10" {...register("name")} />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <CiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            autoComplete="email"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                {/* Password */}
                {/* Password using PasswordStrengthIndicator */}
                <div className="space-y-2">
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordStrengthIndicator
                                label="Password"
                                placeholder="••••••••"
                                value={field.value}
                                onChange={field.onChange}
                                showScore={true}
                                showScoreNumber={true}
                                showVisibilityToggle={true}
                                startIcon={<TfiLock className="h-4 w-4" />}
                                inputProps={{
                                    autoComplete: "new-password",
                                    className: "pl-10",
                                }}
                            />
                        )}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <TfiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Terms checkbox */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Controller
                            name="acceptTerms"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="acceptTerms"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <label
                            htmlFor="acceptTerms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}
                </div>

                {/* Submit */}
                <ConfettiButton
                    ref={confettiRef}
                    manual
                    confettiOptions={{
                        particleCount: 400,
                        spread: 150
                    }} type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <LuLoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create account"
                    )}
                </ConfettiButton>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" disabled>
                    <BsGoogle />
                    Google
                </Button>
                <Button variant="outline" type="button" disabled>
                    <BsGithub />
                    GitHub
                </Button>
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

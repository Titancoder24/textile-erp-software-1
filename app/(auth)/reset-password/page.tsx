"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error(error.message || "Failed to update password. Please try again.");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    toast.success("Password updated successfully.");

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  }

  if (isSuccess) {
    return (
      <Card className="w-full shadow-xl border-gray-200/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            TextileOS
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            The Textile Industry&apos;s Operating System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">
                Password updated
              </h3>
              <p className="text-sm text-gray-500">
                Your password has been changed successfully.
              </p>
              <p className="text-xs text-gray-400">
                Redirecting you to the dashboard...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-gray-200/80">
      <CardHeader className="pb-4">
        <div className="mb-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            TextileOS
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            The Textile Industry&apos;s Operating System
          </CardDescription>
        </div>
        <div className="pt-2 space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">Set a new password</h2>
          <p className="text-sm text-gray-500">
            Choose a strong password for your account.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              New password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              {...register("password")}
              className={
                errors.password ? "border-red-400 focus-visible:ring-red-400" : ""
              }
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={
                errors.confirmPassword
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

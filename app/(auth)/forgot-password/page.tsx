"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Failed to send reset email. Please try again.");
      setIsLoading(false);
      return;
    }

    setSentToEmail(values.email);
    setEmailSent(true);
    setIsLoading(false);
  }

  if (emailSent) {
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
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">
                Check your inbox
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                We sent a password reset link to{" "}
                <span className="font-medium text-gray-700">{sentToEmail}</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
            onClick={() => {
              setEmailSent(false);
              setSentToEmail("");
            }}
          >
            Try a different email
          </Button>

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
          <h2 className="text-lg font-semibold text-gray-800">Reset your password</h2>
          <p className="text-sm text-gray-500">
            Enter your account email and we&apos;ll send you a reset link.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
              className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
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
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
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

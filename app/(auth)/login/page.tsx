"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { DEMO_ROLES_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message || "Invalid email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleDemoEnter() {
    if (!selectedDemoRole) {
      toast.error("Please select a demo role to continue.");
      return;
    }

    setIsDemoLoading(true);

    try {
      const response = await fetch(
        `/demo?role=${encodeURIComponent(selectedDemoRole)}`
      );

      if (!response.ok) {
        throw new Error("Failed to start demo session");
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to start demo session. Please try again.");
      setIsDemoLoading(false);
    }
  }

  const demoRoleEntries = Object.entries(DEMO_ROLES_DESCRIPTIONS);

  return (
    <Card className="w-full shadow-xl border-gray-200/80">
      <CardHeader className="space-y-1 pb-4">
        <div className="mb-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            TextileOS
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            The Textile Industry&apos;s Operating System
          </CardDescription>
        </div>
        <div className="pt-2">
          <h2 className="text-lg font-semibold text-gray-800">Sign in to your account</h2>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Login Form */}
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
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              className={errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
              Or explore with a demo
            </span>
          </div>
        </div>

        {/* Demo Section */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500 text-center">
            Select a role to experience TextileOS without signing up
          </p>
          <Select value={selectedDemoRole} onValueChange={setSelectedDemoRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a demo role..." />
            </SelectTrigger>
            <SelectContent>
              {demoRoleEntries.map(([role, description]) => (
                <SelectItem key={role} value={role}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
                    </span>
                    <span className="text-xs text-gray-400">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
            onClick={handleDemoEnter}
            disabled={isDemoLoading || !selectedDemoRole}
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting demo...
              </>
            ) : (
              "Enter Demo"
            )}
          </Button>
        </div>

        {/* Setup link */}
        <p className="text-center text-xs text-gray-400">
          New to TextileOS?{" "}
          <Link
            href="/setup"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Set up your company
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Building2, User } from "lucide-react";

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

// Step 1: Company info
const companySchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be under 100 characters"),
  city: z.string().min(2, "City is required").max(100, "City is too long"),
  country: z.string().min(2, "Country is required").max(100, "Country is too long"),
});

// Step 2: Admin user info
const adminSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CompanyFormValues = z.infer<typeof companySchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

const DEFAULT_NUMBER_SERIES = [
  { prefix: "ORD", module: "orders", next_number: 1 },
  { prefix: "INQ", module: "inquiries", next_number: 1 },
  { prefix: "SMP", module: "samples", next_number: 1 },
  { prefix: "LD", module: "lab_dips", next_number: 1 },
  { prefix: "PO", module: "purchase_orders", next_number: 1 },
  { prefix: "GRN", module: "grn", next_number: 1 },
  { prefix: "WO", module: "work_orders", next_number: 1 },
  { prefix: "QC", module: "quality_checks", next_number: 1 },
  { prefix: "SHP", module: "shipments", next_number: 1 },
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyFormValues | null>(null);

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      city: "",
      country: "",
    },
  });

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function handleCompanySubmit(values: CompanyFormValues) {
    setCompanyData(values);
    setStep(2);
  }

  async function handleAdminSubmit(values: AdminFormValues) {
    if (!companyData) {
      toast.error("Company information is missing. Please go back.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Step 1: Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user account. Please try again.");
      }

      const userId = authData.user.id;

      // Step 2: Insert company record
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyData.companyName,
          city: companyData.city,
          country: companyData.country,
          default_currency: "USD",
          financial_year_start: 1,
        })
        .select("id")
        .single();

      if (companyError) {
        throw new Error("Failed to create company record: " + companyError.message);
      }

      const companyId = company.id;

      // Step 3: Insert profile with super_admin role
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        company_id: companyId,
        full_name: values.fullName,
        email: values.email,
        role: "super_admin",
        is_active: true,
      });

      if (profileError) {
        throw new Error("Failed to create user profile: " + profileError.message);
      }

      // Step 4: Insert default number series records
      const numberSeriesInserts = DEFAULT_NUMBER_SERIES.map((series) => ({
        ...series,
        company_id: companyId,
      }));

      const { error: seriesError } = await supabase
        .from("number_series")
        .insert(numberSeriesInserts);

      if (seriesError) {
        // Non-fatal: log but don't block setup
        console.warn("Failed to insert number series:", seriesError.message);
      }

      toast.success("Company setup complete. Welcome to TextileOS!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Setup failed. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full shadow-xl border-gray-200/80">
      <CardHeader className="pb-4">
        <div className="mb-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            TextileOS
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            The Textile Industry&apos;s Operating System
          </CardDescription>
        </div>
        <div className="pt-3 space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">Set up your company</h2>
          <p className="text-sm text-gray-500">
            Step {step} of 2 &mdash;{" "}
            {step === 1 ? "Company information" : "Admin account"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 pt-2">
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > 1 ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                "1"
              )}
            </div>
            <Building2 className="w-3.5 h-3.5" />
            Company
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <User className="w-3.5 h-3.5" />
            Admin
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <form
            onSubmit={companyForm.handleSubmit(handleCompanySubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-gray-700"
              >
                Company name
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Textiles Ltd."
                {...companyForm.register("companyName")}
                className={
                  companyForm.formState.errors.companyName
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {companyForm.formState.errors.companyName && (
                <p className="text-xs text-red-500">
                  {companyForm.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700"
                >
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  {...companyForm.register("city")}
                  className={
                    companyForm.formState.errors.city
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {companyForm.formState.errors.city && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="India"
                  {...companyForm.register("country")}
                  className={
                    companyForm.formState.errors.country
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }
                />
                {companyForm.formState.errors.country && (
                  <p className="text-xs text-red-500">
                    {companyForm.formState.errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-semibold mt-2">
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={adminForm.handleSubmit(handleAdminSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full name
              </Label>
              <Input
                id="fullName"
                placeholder="John Smith"
                autoComplete="name"
                {...adminForm.register("fullName")}
                className={
                  adminForm.formState.errors.fullName
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {adminForm.formState.errors.fullName && (
                <p className="text-xs text-red-500">
                  {adminForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="adminEmail"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@company.com"
                autoComplete="email"
                {...adminForm.register("email")}
                className={
                  adminForm.formState.errors.email
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {adminForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {adminForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="adminPassword"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                {...adminForm.register("password")}
                className={
                  adminForm.formState.errors.password
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {adminForm.formState.errors.password && (
                <p className="text-xs text-red-500">
                  {adminForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...adminForm.register("confirmPassword")}
                className={
                  adminForm.formState.errors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {adminForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {adminForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

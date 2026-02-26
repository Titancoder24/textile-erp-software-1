import { NextRequest, NextResponse } from "next/server";
import { DEMO_ROLES_DESCRIPTIONS } from "@/lib/constants";

const DEMO_COOKIE_NAME = "demo_role";
const DEMO_COOKIE_MAX_AGE = 60 * 60 * 4; // 4 hours in seconds

type DemoRole = keyof typeof DEMO_ROLES_DESCRIPTIONS;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as DemoRole | null;

  // Validate the requested role
  if (!role || !(role in DEMO_ROLES_DESCRIPTIONS)) {
    return NextResponse.json(
      { error: "Invalid or missing demo role" },
      { status: 400 }
    );
  }

  // Build redirect response to dashboard
  const redirectUrl = new URL("/dashboard", request.url);
  const response = NextResponse.redirect(redirectUrl);

  // Set the demo role cookie
  response.cookies.set(DEMO_COOKIE_NAME, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEMO_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

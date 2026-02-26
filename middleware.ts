import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/setup",
  "/forgot-password",
  "/reset-password",
  "/demo",
];

const PORTAL_PREFIXES = ["/buyer", "/vendor", "/buying-house"];

const PORTAL_ROLES = ["buyer_user", "vendor_user", "buying_house_user"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isPortalRoute(pathname: string): boolean {
  return PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check for demo session cookie first
  const demoRole = request.cookies.get("demo_role")?.value;

  // Refresh session - this is important to keep the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user || !!demoRole;

  // Redirect authenticated users away from login page
  if (pathname === "/login" && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Require authentication for all other routes
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check portal route access
  if (isPortalRoute(pathname)) {
    let userRole: string | null = null;

    if (demoRole) {
      userRole = demoRole;
    } else if (user) {
      // Fetch profile to get role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = profile?.role ?? null;
    }

    const hasPortalAccess = userRole && PORTAL_ROLES.includes(userRole);

    if (!hasPortalAccess) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

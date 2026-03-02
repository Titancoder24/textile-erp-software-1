import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, role, department, companyId } = body;

    if (!fullName || !email || !role || !companyId) {
      return NextResponse.json(
        { error: "fullName, email, role, and companyId are required" },
        { status: 400 }
      );
    }

    // Verify the caller is an admin
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    if (
      !["super_admin", "factory_owner"].includes(callerProfile.role) ||
      callerProfile.company_id !== companyId
    ) {
      return NextResponse.json(
        { error: "Only admins can invite users" },
        { status: 403 }
      );
    }

    // Use service role client to create auth user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: service role key not set" },
        { status: 500 }
      );
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create auth user with a temporary password
    const tempPassword =
      "Temp" + Math.random().toString(36).slice(2, 10) + "!1";

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile record
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        company_id: companyId,
        full_name: fullName,
        email,
        role,
        department: department || null,
        is_active: true,
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create profile: " + profileError.message },
        { status: 500 }
      );
    }

    // Send password reset email so user can set their own password
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    return NextResponse.json({
      data: {
        id: authData.user.id,
        email,
        fullName,
        role,
        department,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

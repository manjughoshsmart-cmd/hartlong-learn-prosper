import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify calling user
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete data from tables in dependency order (preserving admin users, roles, profiles, and site_settings)
    await adminClient.from("comment_likes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("bookmarks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("download_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("resource_versions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("resources").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Delete non-admin users: first their profiles, roles, then auth accounts
    const { data: nonAdminRoles } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "user");

    if (nonAdminRoles && nonAdminRoles.length > 0) {
      const userIds = nonAdminRoles.map((r) => r.user_id);
      await adminClient.from("profiles").delete().in("user_id", userIds);
      await adminClient.from("user_roles").delete().in("user_id", userIds);

      // Delete auth users
      for (const uid of userIds) {
        await adminClient.auth.admin.deleteUser(uid);
      }
    }

    // Log the reset action
    await adminClient.from("audit_logs").insert({
      admin_id: user.id,
      action: "database_reset",
      entity_type: "system",
      details: {
        timestamp: new Date().toISOString(),
        non_admin_users_deleted: nonAdminRoles?.length || 0,
      },
    });

    return new Response(JSON.stringify({ success: true, users_deleted: nonAdminRoles?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

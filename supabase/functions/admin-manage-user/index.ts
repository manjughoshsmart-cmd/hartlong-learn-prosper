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

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, target_user_id } = body || {};
    if (!action || !target_user_id || typeof target_user_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing action or target_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent acting on self for destructive ops
    if ((action === "delete" || action === "demote") && target_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot perform this action on your own account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "promote") {
      const { error } = await adminClient
        .from("user_roles")
        .insert({ user_id: target_user_id, role: "admin" });
      if (error && !String(error.message).includes("duplicate")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("audit_logs").insert({
        admin_id: user.id, action: "user_promoted", entity_type: "user", entity_id: target_user_id,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "demote") {
      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", target_user_id)
        .eq("role", "admin");
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("audit_logs").insert({
        admin_id: user.id, action: "user_demoted", entity_type: "user", entity_id: target_user_id,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      // Cleanup user-owned data
      await adminClient.from("comment_likes").delete().eq("user_id", target_user_id);
      await adminClient.from("comments").delete().eq("user_id", target_user_id);
      await adminClient.from("bookmarks").delete().eq("user_id", target_user_id);
      await adminClient.from("download_history").delete().eq("user_id", target_user_id);
      await adminClient.from("notifications").delete().eq("user_id", target_user_id);
      await adminClient.from("user_roles").delete().eq("user_id", target_user_id);
      await adminClient.from("profiles").delete().eq("user_id", target_user_id);

      const { data: files } = await adminClient.storage.from("avatars").list(target_user_id);
      if (files && files.length > 0) {
        await adminClient.storage.from("avatars").remove(files.map((f) => `${target_user_id}/${f.name}`));
      }

      const { error: delErr } = await adminClient.auth.admin.deleteUser(target_user_id);
      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await adminClient.from("audit_logs").insert({
        admin_id: user.id, action: "user_deleted", entity_type: "user", entity_id: target_user_id,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "details") {
      const [profileRes, rolesRes, downloadsRes, bookmarksRes, commentsRes, authUserRes] = await Promise.all([
        adminClient.from("profiles").select("*").eq("user_id", target_user_id).maybeSingle(),
        adminClient.from("user_roles").select("role").eq("user_id", target_user_id),
        adminClient.from("download_history").select("id, resource_id, downloaded_at").eq("user_id", target_user_id).order("downloaded_at", { ascending: false }).limit(50),
        adminClient.from("bookmarks").select("id, resource_id, created_at").eq("user_id", target_user_id).order("created_at", { ascending: false }).limit(50),
        adminClient.from("comments").select("id, content, resource_id, created_at").eq("user_id", target_user_id).order("created_at", { ascending: false }).limit(50),
        adminClient.auth.admin.getUserById(target_user_id),
      ]);

      // Resolve resource titles
      const resourceIds = Array.from(new Set([
        ...(downloadsRes.data || []).map((d) => d.resource_id),
        ...(bookmarksRes.data || []).map((b) => b.resource_id),
        ...(commentsRes.data || []).map((c) => c.resource_id),
      ].filter(Boolean)));
      let resourcesMap: Record<string, string> = {};
      if (resourceIds.length > 0) {
        const { data: rs } = await adminClient.from("resources").select("id, title").in("id", resourceIds);
        resourcesMap = Object.fromEntries((rs || []).map((r) => [r.id, r.title]));
      }

      return new Response(JSON.stringify({
        profile: profileRes.data,
        roles: (rolesRes.data || []).map((r) => r.role),
        email: authUserRes.data?.user?.email || null,
        last_sign_in_at: authUserRes.data?.user?.last_sign_in_at || null,
        created_at: authUserRes.data?.user?.created_at || null,
        downloads: (downloadsRes.data || []).map((d) => ({ ...d, title: resourcesMap[d.resource_id] || "Unknown" })),
        bookmarks: (bookmarksRes.data || []).map((b) => ({ ...b, title: resourcesMap[b.resource_id] || "Unknown" })),
        comments: (commentsRes.data || []).map((c) => ({ ...c, title: resourcesMap[c.resource_id] || "Unknown" })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
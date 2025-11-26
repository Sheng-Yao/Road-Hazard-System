import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS: Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

      // 🔹 GET LIST OF HAZARDS
      if (path.startsWith("/stats")) {
        const { data, error } = await supabase
          .from("road_hazard_final_db")
          .select(
            "id, reported_at, image_url, latitude, longitude, hazard_type, state, risk_level"
          )
          .order("risk_level", { ascending: false })
          .limit(50);

        if (error) throw error;

        return json(data);
      }

      // 🔹 NEW: GET HAZARDS FOR MAP PLOTTING
      if (path.startsWith("/hazard-map")) {
        const { data, error } = await supabase
          .from("road_hazard_final_db")
          .select(
            "id, reported_at, image_url, latitude, longitude, hazard_type, risk_level, repair_material, volume_material_required, manpower_required"
          )
          .order("reported_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return json(data);
      }

      // 🔹 GET SINGLE HAZARD BY ID
      if (path.startsWith("/hazard/")) {
        const id = path.split("/").pop();

        const { data, error } = await supabase
          .from("road_hazard_final_db")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        return json(data);
      }

      /* =========================================================
         🔥 NEW: WORKER FETCH
      ========================================================= */

      if (path.startsWith("/workers")) {
        const { data, error } = await supabase
          .from("workers_db")
          .select("id, name");

        if (error) throw error;

        return json(data);
      }

      /* =========================================================
         🔥 NEW: GET REPAIR TRACKER FOR A SPECIFIC HAZARD
      ========================================================= */

      if (path.startsWith("/repair/") && request.method === "GET") {
        const id = path.split("/").pop();

        const { data, error } = await supabase
          .from("repair_tracker_db")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        return json(data);
      }

      /* =========================================================
         🔥 NEW: UPDATE REPAIR STATUS (FORWARD-ONLY)
      ========================================================= */

      if (path.startsWith("/repair/update/") && request.method === "POST") {
        const id = path.split("/").pop();
        const body = await request.json();

        // Prevent overwriting existing timestamps
        const { data: existing } = await supabase
          .from("repair_tracker_db")
          .select("*")
          .eq("id", id)
          .single();

        const updatePayload = {
          worker: body.worker ?? existing.worker,
          reported_at: existing.reported_at || body.reported_at,
          team_assigned_at: existing.team_assigned_at || body.team_assigned_at,
          on_the_way_at: existing.on_the_way_at || body.on_the_way_at,
          in_progress_at: existing.in_progress_at || body.in_progress_at,
          completed_at: existing.completed_at || body.completed_at,
        };
        const { data, error } = await supabase
          .from("repair_tracker_db")
          .update(updatePayload)
          .eq("id", id)
          .select();

        if (error) throw error;

        return json({ success: true, data });
      }

      /* ========================================================= */
      return new Response("Not Found", { status: 404 });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};

// 🌍 Reusable Response helpers:.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

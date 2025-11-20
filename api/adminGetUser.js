import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ---------------------------------------
   ADMIN PASSWORD (same as analytics)
--------------------------------------- */
const ADMIN_PASSWORD = "rohith21"; // or use process.env.ADMIN_PANEL_KEY

/* ---------------------------------------
   SUPABASE CLIENT
--------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ---------------------------------------
   MAIN ENDPOINT
--------------------------------------- */
export async function POST(req) {
  try {
    const { userId, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Wrong password" }), { status: 401 });
    }

    const { data, error } = await supabase
      .from("student_credentials")
      .select("*")
      .eq("username", userId)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

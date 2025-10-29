// /api/get-attendance.js

import { createClient } from "@supabase/supabase-js";

// Use environment variables! They are kept secret by Vercel and not exposed to frontend.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Use your Service Role key, never expose anon key for writes/secure fetches!
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { username, password } = req.body;

  // Query attendance securely
  const { data, error } = await supabase
    .from("student_credentials")
    .select("*")
    .eq("username", username)
    .eq("password", password) // Change if you use hashed passwords or another auth model
    .maybeSingle();

  if (error || !data) {
    return res.status(401).json({ error: "Invalid credentials or attendance not found" });
  }

  // Record site visit
  await supabase
    .from("site_visits")
    .insert([{ username, visited_at: new Date().toISOString() }]);

  // Return user attendance data
  return res.status(200).json({
    academic_data: data.academic_data,
    biometric_data: data.biometric_data,
    fetched_at: data.fetched_at
  });
}

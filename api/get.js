// /api/get.js
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
console.log("ENV:", process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
console.log("BODY:", req.body);
export default async function handler(req, res) {
  try{
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { username, password } = req.body;
  const { data, error } = await supabase
    .from("student_credentials")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });

  return res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }

}

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "GET")
      return res.status(405).json({ error: "Method Not Allowed" });
    
    const { data, error } = await supabase
      .from("student_credentials")  // or your user table
      .select("username");

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
}

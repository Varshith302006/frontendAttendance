import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Secure password to check (store in env variables ideally)
const LOAD_USERS_PASSWORD = process.env.LOAD_USERS_PASSWORD || "rohith21";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { password } = req.body;
  if (password !== LOAD_USERS_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized: Incorrect password" });
  }

  try {
    const { data, error } = await supabase
      .from("student_credentials")
      .select("username");

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

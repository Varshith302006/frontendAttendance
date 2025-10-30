import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    // Fetch all usernames from student_credentials table
    const { data: users, error } = await supabase
      .from("student_credentials")
      .select("username");

    if (error) return res.status(500).json({ error: error.message });
    if (!users) return res.status(404).json({ error: "No users found" });

    // Send only usernames as an array of strings
    const usernames = users.map(user => user.username);

    return res.status(200).json(usernames);
  } catch (e) {
    console.error("bulk-attendance error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

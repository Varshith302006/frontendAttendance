import { createClient } from "@supabase/supabase-js";

// ----------------------------------------
// ADMIN PASSWORD (Set your own)
// ----------------------------------------
const ADMIN_PASSWORD = "rohith21";

// ----------------------------------------
// SUPABASE CLIENT (Node.js — Vercel format)
// ----------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // MUST USE SERVICE ROLE KEY
);

// ----------------------------------------
// MAIN API HANDLER
// ----------------------------------------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { password } = req.body;

    // Check password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    // Fetch all students
    const { data: students, error: studentsError } = await supabase
      .from("student_credentials")
      .select("username, academic_data, fetched_at");

    if (studentsError) {
      return res.status(500).json({ error: studentsError.message });
    }

    const total_users = students.length;

    // Today's logins
    const today = new Date().toISOString().slice(0, 10);

    const { data: visitData, error: visitError } = await supabase
      .from("site_visits")
      .select("count")
      .eq("date", today)
      .maybeSingle();

    if (visitError) {
      return res.status(500).json({ error: visitError.message });
    }

    const today_logins = visitData?.count || 0;

    // Attendance calculations
    const attendanceList = students.map((s) => {
      let avg = 0;
      if (Array.isArray(s.academic_data) && s.academic_data.length > 0) {
        let total = 0;
        s.academic_data.forEach((sub) => total += Number(sub.percentage || 0));
        avg = total / s.academic_data.length;
      }
      return { username: s.username, avg };
    });

    const low_attendance = attendanceList
      .filter(a => a.avg > 0)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    const high_attendance = attendanceList
      .filter(a => a.avg > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    const dist = {
      "<50": 0, "50-60": 0, "60-70": 0,
      "70-80": 0, "80-90": 0, "90-100": 0
    };

    attendanceList.forEach((a) => {
      if (a.avg < 50) dist["<50"]++;
      else if (a.avg < 60) dist["50-60"]++;
      else if (a.avg < 70) dist["60-70"]++;
      else if (a.avg < 80) dist["70-80"]++;
      else if (a.avg < 90) dist["80-90"]++;
      else dist["90-100"]++;
    });

    // Send final response
    return res.status(200).json({
      total_users,
      today_logins,
      last_fetched_at: students[0]?.fetched_at || null,
      low_attendance,
      high_attendance,
      attendance_distribution: dist
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

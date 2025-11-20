import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ---------------------------------------
   ADMIN PASSWORD (Set your own here)
--------------------------------------- */
const ADMIN_PASSWORD = "rohith21";   // <-- Change this to your desired password

/* ---------------------------------------
   SUPABASE CLIENT
--------------------------------------- */
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_KEY")
);

/* ---------------------------------------
   MAIN ANALYTICS ENDPOINT
--------------------------------------- */
export async function POST(req) {
  try {
    const { password } = await req.json();

    // Validate password
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Wrong Password" }), { status: 401 });
    }

    // Fetch all users
    const { data: students, error } = await supabase
      .from("student_credentials")
      .select("username, academic_data, fetched_at");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const total_users = students.length;

    /* ---------------------------------------
       Today Login Count
    --------------------------------------- */
    const today = new Date().toISOString().slice(0, 10);
    const { data: visitData } = await supabase
      .from("site_visits")
      .select("count")
      .eq("date", today)
      .maybeSingle();

    const today_logins = visitData?.count || 0;

    /* ---------------------------------------
       Attendance Calculations
    --------------------------------------- */
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
      .filter(x => x.avg > 0)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    const high_attendance = attendanceList
      .filter(x => x.avg > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    const dist = { "<50": 0, "50-60": 0, "60-70": 0, "70-80": 0, "80-90": 0, "90-100": 0 };

    attendanceList.forEach(a => {
      if (a.avg < 50) dist["<50"]++;
      else if (a.avg < 60) dist["50-60"]++;
      else if (a.avg < 70) dist["60-70"]++;
      else if (a.avg < 80) dist["70-80"]++;
      else if (a.avg < 90) dist["80-90"]++;
      else dist["90-100"]++;
    });

    /* ---------------------------------------
       Return Final Analytics JSON
    --------------------------------------- */
    return new Response(
      JSON.stringify({
        total_users,
        today_logins,
        last_fetched_at: students[0]?.fetched_at || null,
        low_attendance,
        high_attendance,
        attendance_distribution: dist
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

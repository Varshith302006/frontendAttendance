// injectAttendance.js
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = "https://ywsqpuvraddaimlbiuds.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3FwdXZyYWRkYWltbGJpdWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjMzMDgsImV4cCI6MjA3NjM5OTMwOH0.UqkzzWM7nRvgtNdvRy63LLN-UGv-zeYYx6tRYD5zxdY";
const supabase = createClient(supabaseUrl, supabaseKey);

const INDEX_HTML_PATH = path.resolve(__dirname, "index.html"); // Adjust "index.html" location if needed
const PLACEHOLDER = "<!--ATTENDANCE_INJECT-->";

async function main() {
  const { data, error } = await supabase
    .from("student_credentials")
    .select("username, academic_data, biometric_data, fetched_at");
  if (error) throw error;

  const attendance = {};
  data.forEach(u => {
    attendance[u.username] = {
      academic_data: u.academic_data,
      biometric_data: u.biometric_data,
      fetched_at: u.fetched_at,
      password: u.password 
    };
  });

  const scriptTag = `<script>\nwindow.PRELOADED_ATTENDANCE = ${JSON.stringify(attendance)};\n</script>\n`;
  let html = fs.readFileSync(INDEX_HTML_PATH, "utf8");
  if (!html.includes(PLACEHOLDER)) {
    throw new Error(`Placeholder "${PLACEHOLDER}" not found in index.html`);
  }
  html = html.replace(PLACEHOLDER, scriptTag);
  fs.writeFileSync(INDEX_HTML_PATH, html, "utf8");
  console.log("Attendance data injected.");
}
main().catch(e => { console.error(e); process.exit(1); });

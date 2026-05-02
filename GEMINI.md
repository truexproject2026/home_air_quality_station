# CS423 - Noah AI Smart Home Project

## Architecture
- **Device Layer:** ESP32/Wokwi simulator (sends data via HTTP POST).
- **Tunneling:** `localhost.run` (SSH Tunnel) to expose local API to Wokwi.
- **AI Engine:** Llama 3.3 70B (via Groq API) - *Switched from Gemini for better stability.*
- **Database:** Supabase (PostgreSQL) with Realtime enabled.
- **Frontend:** Next.js (React) Dashboard with modern UI.

## Project Conventions
- **AI Prompts:** ภาษาไทย (Thai) สำหรับคำแนะนำและสรุปผล
- **UI:** Modern Card-based layout with Dynamic Theme (Status-based coloring).
- **Real-time:** บังคับใช้ Supabase Realtime สำหรับตาราง `sensor_logs`.

## How to Run (Full System)
1. **Start Dashboard:** `npm run dev`
2. **Open Tunnel:** `ssh -R 80:localhost:3000 nokey@localhost.run`
3. **Configure Wokwi:** ใส่ URL ท่อใน `serverName` ของ ESP32
4. **AI Analysis:** กดปุ่ม "วิเคราะห์ด้วย AI" บนหน้า Dashboard หรือระบบจะวิเคราะห์อัตโนมัติเมื่อฝุ่นสูง

## Submission Guidelines (CS423)
- Live Demo ต้องแสดง: การหมุนค่าฝุ่น, การเปลี่ยนสถานะหน้าต่าง, กราฟขยับแบบ Real-time และคำแนะนำจาก AI
---
*Updated: 2026-05-02 (Switch to Groq/Llama 3.3)*

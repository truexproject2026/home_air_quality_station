# CS423 Noah AI Smart Home - Air Quality Monitoring

ระบบติดตามคุณภาพอากาศอัจฉริยะ (PM 2.5) พร้อมการวิเคราะห์ด้วย AI (Llama 3.3) สำหรับรายวิชา CS423 Internet of Things

## 🚀 ฟีเจอร์หลัก
- **Real-time Monitoring**: ติดตามค่าฝุ่น PM 2.5 และสถานะหน้าต่างแบบวินาทีต่อวินาที
- **AI Analysis**: ใช้โมเดล **Llama 3.3 70B (via Groq)** ในการวิเคราะห์แนวโน้มและให้คำแนะนำด้านสุขภาพ
- **Stable Simulation**: ระบบอ่านค่าจาก Potentiometer ใน Wokwi อย่างแม่นยำและนิ่ง (Smooth Reading)
- **Responsive Dashboard**: หน้าเว็บทันสมัย อัปเดตกราฟและข้อมูลอัตโนมัติด้วย Supabase Realtime
- **OLED Display**: แสดงสถานะบนหน้าจออุปกรณ์ ESP32 พร้อมระบบ Alert

## 🛠 Tech Stack
- **Hardware**: ESP32 (Wokwi Simulator)
- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI Engine**: Groq (Llama-3.3-70b-versatile)
- **Communication**: REST API via SSH Tunnel (localhost.run)

## 📋 วิธีเริ่มใช้งาน
1. **ติดตั้ง Dependencies**: `npm install`
2. **ตั้งค่า Environment**: สร้างไฟล์ `.env.local` และใส่ค่า:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   GROQ_API_KEY=your_groq_key
   ```
3. **รันระบบ**: `npm run dev`
4. **เปิดท่อเชื่อมต่อ**: `ssh -R 80:localhost:3000 nokey@localhost.run`
5. **รัน Wokwi**: นำ URL จากท่อไปใส่ในโค้ด ESP32

## 📱 สมาชิกกลุ่ม
- โครงการนี้พัฒนาขึ้นเพื่อการศึกษาในรายวิชา CS423

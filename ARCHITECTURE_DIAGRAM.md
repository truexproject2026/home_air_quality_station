# CS423 Smart Home - Noah AI Architecture Diagram

```mermaid
graph TD
    subgraph "Device Layer (Simulator)"
        ESP32[ESP32 in Wokwi]
        PM25[Potentiometer: PM2.5] --> ESP32
        Switch[Slide Switch: Window] --> ESP32
        OLED[OLED Display] <-- ESP32
    end

    subgraph "Communication Layer"
        Tunnel[SSH Tunnel: localhost.run]
        ESP32 -- "HTTP POST (JSON)" --> Tunnel
    end

    subgraph "Application Layer (Backend)"
        NextJS[Next.js API Routes]
        Tunnel -- "Forward to localhost:3000" --> NextJS
    end

    subgraph "Data & AI Layer"
        Supabase[(Supabase Database)]
        Llama[Llama 3.3 AI (Groq)]
        NextJS -- "Insert Logs" --> Supabase
        Llama -- "Analyze History" --> Supabase
        Supabase -- "Real-time Update" --> NextJS
    end

    subgraph "Presentation Layer (Frontend)"
        Dashboard[Next.js React Dashboard]
        NextJS -- "Server Side / Client Subscription" --> Dashboard
        Dashboard -- "Real-time UI Update" --> User((User))
    end
```

## แผนภาพการไหลของข้อมูล (Data Flow)
1. **ESP32 (Wokwi)** อ่านค่าจากตัวหมุน (PM2.5) และสวิตช์ (หน้าต่าง)
2. **ESP32** ส่งข้อมูล JSON ผ่าน **SSH Tunnel** ไปยัง API ท้องถิ่น
3. **Next.js API** รับข้อมูลและบันทึกลงใน **Supabase Table (`sensor_logs`)**
4. **Supabase Realtime** แจ้งเตือนหน้าเว็บเมื่อมีการบันทึกข้อมูลใหม่
5. **Dashboard (Frontend)** อัปเดตตัวเลขและกราฟทันที
6. **Llama 3.3 AI (Groq)** ประมวลผลข้อมูลล่าสุดและประวัติเพื่อสร้างคำแนะนำอัจฉริยะ

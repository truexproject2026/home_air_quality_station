import requests
import time
import random

# URL ของ API ที่เรารันในเครื่อง (Next.js)
API_URL = "http://localhost:3000/api/sensor" 

print("🟢 เริ่มระบบจำลองการส่งข้อมูล (Simulator)...")
print(f"📡 กำลังส่งข้อมูลไปที่: {API_URL}")
print("-----------------------------------------")

try:
    while True:
        is_open = random.choice([0, 1])
        # จำลองค่าฝุ่น: ถ้าเปิดหน้าต่าง (1) ฝุ่นจะเยอะ, ถ้าปิด (0) ฝุ่นจะน้อย
        pm25 = random.uniform(50, 150) if is_open == 1 else random.uniform(10, 35)

        payload = {
            'pm25_value': round(pm25, 2),
            'window_status': is_open
        }

        try:
            response = requests.post(API_URL, json=payload)
            if response.status_code == 201:
                print(f"✅ Success: PM2.5={payload['pm25_value']} | Window={'Open' if is_open else 'Closed'}")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ ไม่สามารถเชื่อมต่อกับ Dashboard ได้! (ลืมรัน 'npm run dev' หรือเปล่า?)")
            
        time.sleep(3) # ส่งทุก 3 วินาที
except KeyboardInterrupt:
    print("\n🛑 หยุดการส่งข้อมูล")

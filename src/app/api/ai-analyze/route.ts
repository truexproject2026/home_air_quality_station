import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  console.log('🤖 Noah AI: Starting analysis with Groq (Llama 3.3 70B)...')
  
  // ดึงค่าจาก environment variables (.env.local)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const MODEL = "llama-3.3-70b-versatile";

  try {
    // ตรวจสอบว่ามี API Key หรือไม่
    if (!GROQ_API_KEY) {
      throw new Error('ไม่พบ GROQ_API_KEY ในระบบ (กรุณาเช็คไฟล์ .env.local)');
    }

    const { data: logs, error: logsError } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) throw new Error('Database Error: ' + logsError.message)
    if (!logs || logs.length === 0) return NextResponse.json({ error: 'ยังไม่มีข้อมูลเซนเซอร์' }, { status: 404 })

    const latest = logs[0]
    const historyText = logs.map(l => `- PM2.5: ${l.pm25_value}, Window: ${l.window_status === 1 ? 'Open' : 'Closed'}`).join('\n')

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "คุณคือ Noah AI ผู้ช่วยบ้านอัจฉริยะ ให้คำแนะนำเรื่องคุณภาพอากาศเป็นภาษาไทย ตอบกลับเป็น JSON เท่านั้น ห้ามมีคำเกริ่น"
          },
          {
            role: "user",
            content: `
              ข้อมูลล่าสุด: PM2.5=${latest.pm25_value}, Window=${latest.window_status === 1 ? 'Open' : 'Closed'}
              ประวัติย้อนหลัง:
              ${historyText}

              ช่วยสรุปและให้คำแนะนำในรูปแบบ JSON นี้:
              {
                "summary_text": "สรุปสั้นๆ 1 ประโยค",
                "recommendation": "คำแนะนำสั้นๆ 1-2 ประโยค",
                "status_color": "green หรือ yellow หรือ red"
              }
            `
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Groq Error Detail:', data.error);
      throw new Error(`Groq API Error: ${data.error.message}`);
    }

    const aiResponse = JSON.parse(data.choices[0].message.content);

    // บันทึกผลลง Database (Optional)
    try {
      await supabase.from('ai_insights').insert([{
        summary_text: aiResponse.summary_text,
        recommendation: aiResponse.recommendation,
        status_color: aiResponse.status_color
      }]);
    } catch (e) {
      console.warn("Insight saving skipped.");
    }

    return NextResponse.json({
      ...aiResponse,
      created_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('AI Error:', error.message)
    return NextResponse.json({ 
      error: `AI Error: ${error.message}` 
    }, { status: 500 })
  }
}

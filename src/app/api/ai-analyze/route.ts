import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
  try {
    // 1. Fetch recent sensor logs (last 24 hours or last 50 entries)
    const { data: logs, error: fetchError } = await supabase
      .from('sensor_logs')
      .select('pm25_value, window_status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;
    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: 'No data to analyze yet' });
    }

    // 2. Prepare data for Gemini
    const dataSummary = logs.map(l => 
      `Time: ${l.created_at}, PM2.5: ${l.pm25_value}, Window: ${l.window_status === 1 ? 'Open' : 'Closed'}`
    ).join('\n');

    const prompt = `
      You are Noah AI, an IoT Smart Home Assistant. 
      Based on the following sensor data logs for PM2.5 and Window Status:
      
      ${dataSummary}

      Please provide:
      1. A brief summary (in Thai) of the air quality trend for today.
      2. A specific recommendation (in Thai) regarding whether the user should open or close the windows based on the PM2.5 levels.

      Format your response as a JSON object with two keys: "summary" and "recommendation".
      Keep the text concise and helpful for a dashboard.
    `;

    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up the response (Gemini sometimes adds markdown backticks)
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResponse = JSON.parse(jsonStr);

    // 4. Save insight to Supabase
    const { data, error: insertError } = await supabase
      .from('ai_insights')
      .insert([
        { 
          summary_text: aiResponse.summary, 
          recommendation: aiResponse.recommendation 
        }
      ])
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'AI Analysis complete', data });

  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

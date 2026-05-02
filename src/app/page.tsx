'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Wind, Home, History, Brain, RefreshCw, AlertTriangle, CheckCircle, Info, Sparkles, Activity
} from 'lucide-react';

interface SensorLog {
  id: string;
  pm25_value: number;
  window_status: number;
  created_at: string;
}

interface AIInsight {
  summary_text: string;
  recommendation: string;
  status_color?: string;
  created_at: string;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const { data: logData, error: logError } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logError) throw logError;
      setLogs(logData || []);

      const { data: aiData, error: aiError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!aiError) setInsight(aiData);

    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    console.log('Starting Noah AI Analysis...');
    try {
      const res = await fetch('/api/ai-analyze', { method: 'POST' });
      const data = await res.json();
      
      if (data.error) {
        console.error('AI API Error:', data.error);
        alert('เกิดข้อผิดพลาดจาก AI: ' + data.error);
        return;
      }

      if (data.summary_text) {
        console.log('AI Analysis Success:', data);
        setInsight(data);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      alert('ไม่สามารถติดต่อ AI ได้ กรุณาเช็คอินเทอร์เน็ตหรือ API Key');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('sensor_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, (payload) => {
        const newLog = payload.new as SensorLog;
        setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
        
        // ถ้าค่าฝุ่นกระโดดสูงมาก ให้สั่ง AI วิเคราะห์อัตโนมัติ
        if (newLog.pm25_value > 100) {
          runAIAnalysis();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const latestLog = logs[0];
  const chartData = [...logs].reverse().map(log => ({
    time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pm25: log.pm25_value,
  }));

  const getPM25Status = (val: number) => {
    if (val <= 15) return { label: 'ดีมาก', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (val <= 25) return { label: 'ดี', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
    if (val <= 37) return { label: 'ปานกลาง', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (val <= 75) return { label: 'เริ่มมีผลต่อสุขภาพ', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'มีผลต่อสุขภาพ', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getAIColor = (status: string | undefined) => {
    if (status === 'red') return 'from-red-600 to-rose-700';
    if (status === 'yellow') return 'from-amber-500 to-orange-600';
    return 'from-indigo-600 to-violet-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Noah AI กำลังเตรียมระบบ...</p>
        </div>
      </div>
    );
  }

  const pmStatus = latestLog ? getPM25Status(latestLog.pm25_value) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Home size={28} />
            </div>
            Noah AI Smart Home
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Activity size={16} className="text-green-500" />
            Live System Monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-indigo-200 transition-all font-bold disabled:opacity-50"
          >
            <Sparkles size={18} className={isAnalyzing ? 'animate-pulse' : ''} />
            {isAnalyzing ? 'Noah กำลังวิเคราะห์...' : 'วิเคราะห์ด้วย AI'}
          </button>
          <button 
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* PM 2.5 Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Wind size={24} />
              </span>
              {pmStatus && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${pmStatus.bg} ${pmStatus.color} ${pmStatus.border} border`}>
                  {pmStatus.label}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">คุณภาพอากาศปัจจุบัน</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-6xl font-black text-slate-900">{latestLog?.pm25_value ?? '--'}</h2>
              <span className="text-slate-400 font-medium">µg/m³</span>
            </div>
          </div>

          {/* AI Insight Card - NEW DESIGN */}
          <div className={`bg-gradient-to-br ${getAIColor(insight?.status_color)} p-6 rounded-3xl shadow-lg text-white relative group transition-all duration-500`}>
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <Brain size={140} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain size={20} />
                  <span className="text-sm font-bold tracking-widest uppercase opacity-80">Smart Insight</span>
                </div>
                {isAnalyzing && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">{insight?.summary_text || 'กำลังรอข้อมูลวิเคราะห์...'}</h3>
              <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-4">
                <p className="text-indigo-50 text-sm leading-relaxed">
                  {insight?.recommendation || 'ระบบกำลังรวบรวมข้อมูลเซนเซอร์เพื่อนำมาประมวลผลคำแนะนำโดย AI'}
                </p>
              </div>
              <p className="text-[10px] mt-4 opacity-50 italic">
                วิเคราะห์ล่าสุดเมื่อ: {insight ? new Date(insight.created_at).toLocaleString('th-TH') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Window Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium mb-4">สถานะช่องระบายอากาศ</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${latestLog?.window_status === 1 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                  <Home size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800">
                    {latestLog?.window_status === 1 ? 'เปิดอยู่ (Open)' : 'ปิดแล้ว (Closed)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">อัปเดตแบบ Real-time จาก Wokwi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <History size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">กราฟแสดงแนวโน้มมลพิษในอากาศ</h3>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pm25" 
                    stroke="#4F46E5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPm)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">ประวัติการตรวจวัด</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">ล่าสุด 10 รายการ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">เวลา</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">PM 2.5</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">หน้าต่าง</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {new Date(log.created_at).toLocaleTimeString('th-TH')}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{log.pm25_value}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${log.window_status === 1 ? 'text-amber-500' : 'text-green-500'}`}>
                          {log.window_status === 1 ? 'OPEN' : 'CLOSED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400 italic">
                        Logged Successfully
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

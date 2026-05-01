'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Wind, Home, History, Brain, RefreshCw, AlertTriangle, CheckCircle, Info 
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
  created_at: string;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch Sensor Logs
      const { data: logData, error: logError } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logError) throw logError;
      setLogs(logData || []);

      // Fetch Latest AI Insight
      const { data: aiData, error: aiError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!aiError) setInsight(aiData);

    } catch (error: any) {
      console.error('Error fetching data:', error.message || error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + (error.message || 'ไม่สามารถติดต่อฐานข้อมูลได้'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('sensor_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_logs' }, (payload) => {
        setLogs((prev) => [payload.new as SensorLog, ...prev.slice(0, 49)]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium text-lg">กำลังโหลดข้อมูล Dashboard...</p>
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
          <p className="text-slate-500 mt-1">CS423 Internet of Things Project Dashboard</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          รีเฟรชข้อมูล
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Real-time Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* PM 2.5 Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
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
            <p className="text-slate-500 text-sm font-medium">ระดับฝุ่น PM 2.5 ในบ้าน</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-6xl font-black text-slate-900">{latestLog?.pm25_value ?? '--'}</h2>
              <span className="text-slate-400 font-medium">µg/m³</span>
            </div>
          </div>

          {/* Window Status Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <span className={`p-3 rounded-2xl ${latestLog?.window_status === 1 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                <Home size={24} />
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">สถานะหน้าต่าง</p>
            <div className="mt-2 flex items-center gap-3">
              {latestLog?.window_status === 1 ? (
                <>
                  <AlertTriangle className="text-amber-500" size={24} />
                  <h2 className="text-2xl font-bold text-slate-800">เปิดอยู่</h2>
                </>
              ) : (
                <>
                  <CheckCircle className="text-green-500" size={24} />
                  <h2 className="text-2xl font-bold text-slate-800">ปิดแล้ว</h2>
                </>
              )}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-lg text-white overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <Brain size={120} />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} />
                <span className="text-sm font-bold tracking-widest uppercase opacity-80">Noah AI Agent</span>
              </div>
              <h3 className="text-xl font-bold mb-3">บทสรุปและการแนะนำ</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                {insight ? insight.summary_text : "ยังไม่มีข้อมูลสรุปจาก AI ในขณะนี้ ระบบจะประมวลผลข้อมูลรายวันเพื่อช่วยให้คุณดูแลสุขภาพได้ดียิ่งขึ้น"}
              </p>
              {insight?.recommendation && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Info className="text-indigo-200 mt-1 shrink-0" size={18} />
                    <p className="text-sm font-medium">{insight.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <History size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">กราฟแนวโน้ม PM 2.5 (ย้อนหลัง 50 รายการ)</h3>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 12}}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pm25" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPm)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Logs Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">ประวัติข้อมูลล่าสุด</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">เวลาที่บันทึก</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ค่า PM 2.5</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">หน้าต่าง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(log.created_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${getPM25Status(log.pm25_value).color}`}>
                          {log.pm25_value}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.window_status === 1 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {log.window_status === 1 ? 'เปิด' : 'ปิด'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                        ยังไม่มีข้อมูลประวัติ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm pb-8">
        © 2026 CS423 IoT Project - พัฒนาโดยใช้ Next.js & Supabase
      </footer>
    </div>
  );
}

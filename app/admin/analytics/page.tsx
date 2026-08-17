"use client";

import { useEffect, useState } from "react";
import { getAnalyticsData } from "./actions";
import { Users, Eye, BarChart, Server, Activity } from "lucide-react";

type AnalyticsData = {
  success: true
  visits: { today: number; todayViews: number; month: number; total: number }
  usage: { bandwidthGB: number; storageGB: number; isVercelConnected: boolean }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData().then((res) => {
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div>فشل في جلب البيانات</div>;

  const storagePercentage = Math.min((data.usage.storageGB / 1) * 100, 100);
  const bandwidthPercentage = Math.min((data.usage.bandwidthGB / 100) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإحصائيات والاستهلاك</h1>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء موقعك واستهلاك الموارد</p>
        </div>
      </div>

      {/* Visits Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-brand" />
          الزيارات والمشاهدات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="زيارات اليوم" value={data.visits.today} icon={<Users />} color="blue" />
          <StatCard title="مشاهدات صفحات اليوم" value={data.visits.todayViews} icon={<Eye />} color="indigo" />
          <StatCard title="زيارات هذا الشهر" value={data.visits.month} icon={<BarChart />} color="emerald" />
          <StatCard title="إجمالي الزيارات" value={data.visits.total} icon={<Activity />} color="purple" />
        </div>
      </div>

      {/* Usage Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-brand" />
          الاستهلاك (Database & Bandwidth)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Storage Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">مساحة التخزين (Database & Blob)</h3>
                <p className="text-sm text-gray-500">الحد الأقصى: 1 GB</p>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {data.usage.storageGB.toFixed(3)} <span className="text-sm font-medium text-gray-500">GB</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${storagePercentage > 85 ? 'bg-red-500' : storagePercentage > 60 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-left">{storagePercentage.toFixed(1)}% مستهلك</p>
          </div>

          {/* Bandwidth Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">نقل البيانات (Bandwidth)</h3>
                <p className="text-sm text-gray-500">السعة الشهرية: 100 GB</p>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {data.usage.bandwidthGB.toFixed(2)} <span className="text-sm font-medium text-gray-500">GB</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${bandwidthPercentage > 85 ? 'bg-red-500' : bandwidthPercentage > 60 ? 'bg-yellow-400' : 'bg-blue-500'}`}
                style={{ width: `${bandwidthPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-start mt-2">
              <p className="text-xs font-bold text-gray-700">{bandwidthPercentage.toFixed(1)}% مستهلك</p>
              <p className="text-[10px] text-gray-500 max-w-[200px] text-left leading-tight">
                * يرجى متابعة الاستهلاك لضمان عدم توقف المتجر عند تجاوز السعة.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-brand/5 text-brand border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

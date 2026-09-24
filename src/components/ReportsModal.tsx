import React from 'react';
import { BarChart3, TrendingUp, Navigation, Battery, TreePine, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { HornbillProfile } from '../types';

interface ReportsViewProps {
  hornbill: HornbillProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ hornbill }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 inline-block mb-3">
            รายงานและสถิติการเคลื่อนที่
          </span>
          <h2 className="text-2xl font-black tracking-tight mb-2">
            การวิเคราะห์เส้นทางการบินและพฤติกรรม: {hornbill.name} ({hornbill.code})
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            ข้อมูลพิกัดส่งตรงจากระบบเซนเซอร์ดาวเทียม บันทึกการเคลื่อนที่ ตำแหน่ง และพารามิเตอร์ของ {hornbill.name} ({hornbill.code})
          </p>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Navigation className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">ระยะบินสะสมทั้งหมด</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">64.8 <span className="text-sm font-semibold text-slate-500">กม.</span></h3>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">ข้าม 2 แนวเทือกเขาหลัก</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">ความเร็วเฉลี่ยขณะร่อน</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">22.4 <span className="text-sm font-semibold text-slate-500">กม./ชม.</span></h3>
          <p className="text-[11px] text-blue-700 font-medium mt-1">ความเร็วสูงสุด 34.6 กม./ชม.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <TreePine className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">ดัชนีกระจายเมล็ดพันธุ์</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">140+ <span className="text-sm font-semibold text-slate-500">เมล็ด/สัปดาห์</span></h3>
          <p className="text-[11px] text-amber-700 font-medium mt-1">ไม้ตระกูลยางและผลไทรป่า</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <Battery className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">สถานะพลังงานโซลาร์</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{hornbill.latestPoint.battery.toFixed(2)}%</h3>
          <p className="text-[11px] text-teal-700 font-medium mt-1">อัตราประจุสมดุลดีเยี่ยม</p>
        </div>
      </div>

      {/* Altitude Profile & Habitat Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elevation Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              ระดับความสูงการบิน (Altitude Profile)
            </h3>
            <span className="text-xs text-slate-500">เมตรจากระดับน้ำทะเล</span>
          </div>

          <div className="space-y-3">
            {hornbill.history.slice(0, 6).map((pt, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">{pt.location} ({pt.time} น.)</span>
                  <span className="font-bold text-slate-900">{pt.altitudeM || 800} ม.</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${((pt.altitudeM || 800) / 1200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forest Habitat Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            สัดส่วนชนิดป่าที่นกกกใช้ประโยชน์ (Habitat Utilization)
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">ป่าดิบชื้นและป่าดิบเขา (Hill Evergreen Forest)</span>
                <span className="font-bold text-emerald-700">58%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '58%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">เป็นแหล่งพักนอนยอดไม้สูงและหากินผลไทรป่า</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">ป่าเบญจพรรณและแนวหุบเขาลำน้ำ (Mixed Deciduous)</span>
                <span className="font-bold text-blue-700">27%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '27%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">ใช้เป็นแนวร่อนลมเดินทางข้ามสันเขา</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">ป่าเต็งรังและป่าสนเขา (Dipterocarp / Pine)</span>
                <span className="font-bold text-amber-700">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">บริเวณรอยต่อดอยขุนตาลและห้างฉัตร</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

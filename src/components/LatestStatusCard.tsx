import React from 'react';
import { RefreshCw, MapPin, BatteryCharging, Thermometer, Compass, RotateCcw } from 'lucide-react';
import { HornbillProfile, TrackingPoint } from '../types';

interface LatestStatusCardProps {
  hornbill: HornbillProfile;
  selectedPoint?: TrackingPoint | null;
  onViewOnMap: () => void;
  onResetToLatest?: () => void;
}

export const LatestStatusCard: React.FC<LatestStatusCardProps> = ({
  hornbill,
  selectedPoint,
  onViewOnMap,
  onResetToLatest,
}) => {
  const isCustomPoint = Boolean(selectedPoint && selectedPoint.index !== hornbill.latestPoint.index);
  const active = selectedPoint || hornbill.latestPoint;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4.5 flex flex-col justify-between h-[520px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCustomPoint ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'
              }`}
            />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isCustomPoint ? `จุดพิกัดที่ #${active.index}` : 'ตำแหน่งล่าสุด'}
            </h3>
            {isCustomPoint && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                ประวัติ
              </span>
            )}
          </div>

          {isCustomPoint && onResetToLatest ? (
            <button
              onClick={onResetToLatest}
              className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-emerald-600" />
              <span>กลับจุดล่าสุด</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>อัปเดต: {active.date} {active.time} น.</span>
            </div>
          )}
        </div>

        {/* Hornbill Photo */}
        <div className="my-3 relative rounded-xl overflow-hidden shadow-xs border border-slate-100 h-40 bg-emerald-950">
          <img
            src={hornbill.photoUrl}
            alt={hornbill.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {hornbill.scientificName}
          </div>
          <div className="absolute bottom-2 left-2 bg-emerald-900/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {hornbill.name}
          </div>
          {isCustomPoint && (
            <div className="absolute bottom-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              จุดที่ {active.index} ({active.time} น.)
            </div>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">รหัสติดตาม</span>
            <span className="font-bold text-slate-900">{hornbill.code}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ชนิด</span>
            <span className="font-semibold text-slate-800">
              {hornbill.thaiSpecies} ({hornbill.englishSpecies})
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">วันที่บันทึก</span>
            <span className="font-medium text-slate-800">{active.date}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">เวลาบันทึก</span>
            <span className="font-medium text-slate-800">{active.time} น.</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ละติจูด</span>
            <span className="font-mono font-bold text-slate-900">
              {Math.abs(active.lat).toFixed(6)}° {active.lat >= 0 ? 'N' : 'S'}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ลองจิจูด</span>
            <span className="font-mono font-bold text-slate-900">
              {Math.abs(active.lng).toFixed(6)}° {active.lng >= 0 ? 'E' : 'W'}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">พื้นที่</span>
            <span className="font-medium text-emerald-800 text-right max-w-[200px] truncate" title={active.address || active.location}>
              {active.address || active.location}
            </span>
          </div>

          {/* Battery Progress */}
          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ระดับแบตเตอรี่</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">{active.battery.toFixed(2)}%</span>
              <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, active.battery))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Device Temp */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-medium">อุณหภูมิอุปกรณ์</span>
            <div className="flex items-center gap-1 font-bold text-amber-600">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{active.temp.toFixed(2)} °C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button: "ดูตำแหน่งบนแผนที่" */}
      <div className="pt-2">
        <button
          onClick={onViewOnMap}
          className="w-full bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow active:scale-[0.99]"
        >
          <Compass className="w-4 h-4 text-emerald-700" />
          <span>{isCustomPoint ? `เลื่อนไปยังจุดที่ #${active.index} บนแผนที่` : 'ดูตำแหน่งบนแผนที่'}</span>
        </button>
      </div>
    </div>
  );
};

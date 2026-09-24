import React from 'react';
import { RefreshCw, MapPin, BatteryCharging, Thermometer, Compass, Calendar, Clock, Feather } from 'lucide-react';
import { HornbillProfile } from '../types';

interface LatestStatusCardProps {
  hornbill: HornbillProfile;
  onViewOnMap: () => void;
}

export const LatestStatusCard: React.FC<LatestStatusCardProps> = ({
  hornbill,
  onViewOnMap,
}) => {
  const latest = hornbill.latestPoint;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4.5 flex flex-col justify-between h-[520px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              ตำแหน่งล่าสุด
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <RefreshCw className="w-3 h-3 text-emerald-600" />
            <span>อัปเดตล่าสุด: {latest.date} {latest.time} น.</span>
          </div>
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
        </div>

        {/* Metadata Details Grid matching Image 2 */}
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
            <span className="text-slate-500 font-medium">วันที่</span>
            <span className="font-medium text-slate-800">{latest.date}</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">เวลา</span>
            <span className="font-medium text-slate-800">{latest.time} น.</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ละติจูด</span>
            <span className="font-mono font-bold text-slate-900">{latest.lat.toFixed(4)}° N</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ลองจิจูด</span>
            <span className="font-mono font-bold text-slate-900">{latest.lng.toFixed(4)}° E</span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">พื้นที่</span>
            <span className="font-medium text-emerald-800 text-right max-w-[200px] truncate" title={latest.address || latest.location}>
              {latest.address ? latest.address : `${latest.location} จ.ลำปาง`}
            </span>
          </div>

          {/* Battery Progress */}
          <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
            <span className="text-slate-500 font-medium">ระดับแบตเตอรี่</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">{latest.battery.toFixed(2)}%</span>
              <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, latest.battery)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Device Temp */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 font-medium">อุณหภูมิอุปกรณ์</span>
            <div className="flex items-center gap-1 font-bold text-amber-600">
              <Thermometer className="w-3.5 h-3.5" />
              <span>{latest.temp.toFixed(2)} °C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button: "ดูตำแหน่งบนแผนที่" matching Image 2 */}
      <div className="pt-2">
        <button
          onClick={onViewOnMap}
          className="w-full bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow active:scale-[0.99]"
        >
          <Compass className="w-4 h-4 text-emerald-700" />
          <span>ดูตำแหน่งบนแผนที่</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { MapPin, BatteryCharging, Thermometer, Zap, SignalHigh } from 'lucide-react';
import { HornbillProfile } from '../types';

interface MetricCardsProps {
  hornbill: HornbillProfile;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ hornbill }) => {
  const latest = hornbill.latestPoint;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {/* Card 1: Hornbill Identification */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition hover:shadow-md hover:border-emerald-200">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-900 ring-2 ring-emerald-500/20 shadow-inner">
            <img
              src={hornbill.photoUrl}
              alt={hornbill.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">รหัสติดตาม</p>
          <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">
            {hornbill.code}
          </h3>
          <p className="text-[11px] text-slate-600 truncate">
            {hornbill.englishSpecies}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium truncate">
            {hornbill.thaiSpecies} ({hornbill.scientificName})
          </p>
        </div>
      </div>

      {/* Card 2: Coordinates & Location */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition hover:shadow-md hover:border-blue-200">
        <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-200">
          <MapPin className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">ตำแหน่งล่าสุด</p>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {latest.lat.toFixed(4)}° N
          </h3>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
            {latest.lng.toFixed(4)}° E
          </h3>
          <p className="text-[11px] text-blue-700 font-medium truncate" title={latest.address || latest.location}>
            {latest.address ? latest.address : `${latest.location} จ.ลำปาง`}
          </p>
        </div>
      </div>

      {/* Card 3: Battery Level */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4 transition hover:shadow-md hover:border-emerald-200">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200">
            <BatteryCharging className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {latest.battery.toFixed(2)}%
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              ระดับแบตเตอรี่
            </p>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, latest.battery)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 text-emerald-400">
          <Zap className="w-6 h-6 fill-emerald-400/20" />
        </div>
      </div>

      {/* Card 4: Device Temperature */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4 transition hover:shadow-md hover:border-amber-200">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-200">
            <Thermometer className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {latest.temp.toFixed(2)} °C
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              อุณหภูมิอุปกรณ์
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              ระดับความสูง {latest.altitudeM || 840} ม.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-amber-400">
          <SignalHigh className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

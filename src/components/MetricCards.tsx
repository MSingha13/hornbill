import React from 'react';
import { MapPin, BatteryCharging, Thermometer, Zap, SignalHigh, RotateCcw } from 'lucide-react';
import { HornbillProfile, TrackingPoint } from '../types';

interface MetricCardsProps {
  hornbill: HornbillProfile;
  selectedPoint?: TrackingPoint | null;
  onResetToLatest?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  hornbill,
  selectedPoint,
  onResetToLatest,
}) => {
  const isCustomPoint = Boolean(selectedPoint && selectedPoint.index !== hornbill.latestPoint.index);
  const active = selectedPoint || hornbill.latestPoint;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {/* Card 1: Hornbill Identification & Point Selector */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-3 transition hover:shadow-md hover:border-emerald-200">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-900 ring-2 ring-emerald-500/20 shadow-inner">
              <img
                src={hornbill.photoUrl}
                alt={hornbill.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isCustomPoint ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs text-slate-500 font-medium">รหัสติดตาม</p>
              {isCustomPoint ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                  จุดที่ #{active.index}
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                  ล่าสุด
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">
              {hornbill.code}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium truncate">
              {active.date} • {active.time} น.
            </p>
          </div>
        </div>

        {isCustomPoint && onResetToLatest && (
          <button
            onClick={onResetToLatest}
            title="กลับไปที่จุดล่าสุด"
            className="shrink-0 text-[11px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-medium px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            <span className="hidden xl:inline">จุดล่าสุด</span>
          </button>
        )}
      </div>

      {/* Card 2: Coordinates & Location */}
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border flex items-center gap-4 transition hover:shadow-md ${
        isCustomPoint ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 hover:border-blue-200'
      }`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${
          isCustomPoint ? 'bg-amber-600 shadow-amber-200' : 'bg-blue-500 shadow-blue-200'
        }`}>
          <MapPin className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">
            {isCustomPoint ? `พิกัด (จุดที่ ${active.index})` : 'ตำแหน่งล่าสุด'}
          </p>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight font-mono">
            {Math.abs(active.lat).toFixed(5)}° {active.lat >= 0 ? 'N' : 'S'}
          </h3>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none mb-1 font-mono">
            {Math.abs(active.lng).toFixed(5)}° {active.lng >= 0 ? 'E' : 'W'}
          </h3>
          <p className="text-[11px] text-blue-700 font-medium truncate" title={active.address || active.location}>
            {active.address || active.location}
          </p>
        </div>
      </div>

      {/* Card 3: Battery Level */}
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border flex items-center justify-between gap-4 transition hover:shadow-md ${
        isCustomPoint ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 hover:border-emerald-200'
      }`}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200">
            <BatteryCharging className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {active.battery.toFixed(2)}%
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isCustomPoint ? `ระดับแบตเตอรี่ (จุดที่ ${active.index})` : 'ระดับแบตเตอรี่'}
            </p>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, active.battery))}%` }}
              />
            </div>
          </div>
        </div>
        <div className="shrink-0 text-emerald-400">
          <Zap className="w-6 h-6 fill-emerald-400/20" />
        </div>
      </div>

      {/* Card 4: Device Temperature & Sensor */}
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border flex items-center justify-between gap-4 transition hover:shadow-md ${
        isCustomPoint ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 hover:border-amber-200'
      }`}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-200">
            <Thermometer className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {active.temp.toFixed(2)} °C
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isCustomPoint ? `อุณหภูมิ (จุดที่ ${active.index})` : 'อุณหภูมิอุปกรณ์'}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5 truncate">
              {active.speedKmh !== undefined && active.speedKmh > 0
                ? `ความเร็ว ${active.speedKmh} km/h`
                : `เวลา ${active.time} น.`}
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

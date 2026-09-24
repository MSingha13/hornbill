import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { HornbillProfile } from '../types';

interface HeaderProps {
  selectedHornbill: HornbillProfile;
  onSelectHornbill: (hornbill: HornbillProfile) => void;
  hornbills: HornbillProfile[];
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedHornbill,
  onSelectHornbill,
  hornbills,
  onRefresh,
  isRefreshing,
  onExportCSV,
}) => {
  return (
    <header className="relative bg-white/95 backdrop-blur-md border-b border-emerald-100/60 shadow-sm overflow-hidden z-20">
      {/* Background ambient banner decoration */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none bg-cover bg-top"
        style={{ backgroundImage: `url('/assets/hornbill_mountain_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/85 via-white/80 to-emerald-50/70 pointer-events-none" />

      <div className="relative max-w-[1700px] mx-auto px-4 lg:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md ring-2 ring-emerald-500/20 bg-emerald-950 flex items-center justify-center transition-transform transform group-hover:scale-105">
              <img
                src="/assets/hornbill_portrait.jpg"
                alt="Hornbill"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase bg-emerald-100/80 px-2 py-0.5 rounded-md">
                ระบบติดตามนกกก
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                <span className={`w-2 h-2 rounded-full ${selectedHornbill.isLiveFeed ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>{selectedHornbill.isLiveFeed ? 'ดาวเทียม Live (GAS Connected)' : 'สัญญาณดาวเทียมปกติ'}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-xs">
                HORNBILL <span className="text-emerald-700">TRACKING</span>
              </h1>
              {hornbills.length > 1 ? (
                <select
                  value={selectedHornbill.code}
                  onChange={(e) => {
                    const found = hornbills.find(h => h.code === e.target.value);
                    if (found) onSelectHornbill(found);
                  }}
                  aria-label="เลือกรหัสติดตามนกกก"
                  className="text-xs font-medium text-emerald-900 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
                >
                  {hornbills.map((h) => (
                    <option key={h.code} value={h.code}>
                      {h.code} - {h.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300/80 rounded-lg px-2.5 py-1">
                  {selectedHornbill.code}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 italic font-medium flex items-center gap-1 mt-0.5">
              <span>“เทคโนโลยีเพื่อการอนุรักษ์ สู่อนาคตที่ยั่งยืน”</span>
            </p>
          </div>
        </div>

        {/* Right: Partner Logos & Top Actions */}
        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          {/* Partner Organization Logos (GISTDA, BSRC, สวนสัตว์เปิดเขาเขียว) */}
          <div className="hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl px-3.5 py-1.5 shadow-2xs">
            {/* GISTDA */}
            <div className="h-7 flex items-center pr-3 border-r border-slate-200/90" title="สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน) - GISTDA">
              <img
                src="/assets/logo_gistda.svg"
                alt="GISTDA"
                className="h-5 w-auto object-contain max-w-[80px]"
              />
            </div>

            {/* BSRC */}
            <div className="h-7 flex items-center pr-3 border-r border-slate-200/90" title="บริษัท บางจาก ศรีราชา จำกัด (มหาชน) - BSRC">
              <img
                src="/assets/logo_bsrc.svg"
                alt="BSRC"
                className="h-5.5 w-auto object-contain max-w-[85px]"
              />
            </div>

            {/* สวนสัตว์เปิดเขาเขียว */}
            <div className="flex items-center" title="สวนสัตว์เปิดเขาเขียว (Khao Kheow Open Zoo)">
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-2xs ring-1 ring-emerald-600/30 flex items-center justify-center bg-white">
                <img
                  src="/assets/logo_khaokheow.svg"
                  alt="สวนสัตว์เปิดเขาเขียว"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-[#0f2e22] hover:bg-[#164232] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>อัปเดตข้อมูล</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

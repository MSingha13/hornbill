import React from 'react';
import { Home, MapPin, Info, Leaf } from 'lucide-react';

export type ActiveTab = 'overview' | 'map' | 'about';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="w-64 bg-[#0a2318] text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20 border-r border-emerald-950">
      {/* Top Logo Section */}
      <div>
        <div className="p-6 text-center border-b border-emerald-900/40">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full bg-amber-400 p-1 shadow-lg ring-4 ring-emerald-600/30">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                <img
                  src="/assets/hornbill_portrait.jpg"
                  alt="Great Hornbill"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0a2318] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
          </div>

          <h2 className="text-base font-black tracking-wide text-white uppercase">
            HORNBILL TRACKING
          </h2>
          <p className="text-xs text-emerald-300 font-medium mt-0.5">
            ระบบติดตามนกกก
          </p>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>หน้าหลัก</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>แผนที่ติดตาม</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <Info className="w-5 h-5" />
            <span>เกี่ยวกับโครงการ</span>
          </button>
        </nav>
      </div>

      {/* Partner Logos Strip in Sidebar */}
      <div className="p-4 border-t border-emerald-900/50 bg-emerald-950/80">
        <p className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-bold mb-2">
          พันธมิตรโครงการชีวานุรักษ์
        </p>
        <div className="grid grid-cols-3 gap-1.5 bg-white/95 rounded-xl p-1.5 shadow-sm border border-emerald-800/30">
          <div className="flex items-center justify-center p-1 bg-white rounded-lg" title="GISTDA (สำนักงานพัฒนาเทคโนโลยีอวกาศฯ)">
            <img src="/assets/logo_gistda.svg" alt="GISTDA" className="h-4 w-auto object-contain" />
          </div>
          <div className="flex items-center justify-center p-1 bg-white rounded-lg" title="BSRC (บมจ. บางจาก ศรีราชา)">
            <img src="/assets/logo_bsrc.svg" alt="BSRC" className="h-4.5 w-auto object-contain" />
          </div>
          <div className="flex items-center justify-center p-1 bg-white rounded-lg" title="สวนสัตว์เปิดเขาเขียว">
            <img src="/assets/logo_khaokheow.svg" alt="สวนสัตว์เปิดเขาเขียว" className="h-5 w-5 rounded-full object-contain" />
          </div>
        </div>
      </div>

      {/* Bottom Forest Silhouette & Tagline */}
      <div className="px-5 py-3.5 border-t border-emerald-900/40 bg-gradient-to-t from-emerald-950 to-transparent">
        <div className="flex items-center justify-between text-xs text-emerald-200/90">
          <div>
            <p className="font-semibold text-emerald-100">อนุรักษ์วันนี้</p>
            <p className="text-[11px] text-emerald-300/80">เพื่ออนาคตที่ยั่งยืน</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-800/60 flex items-center justify-center text-emerald-300">
            <Leaf className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </aside>
  );
};

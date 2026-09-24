import React, { useState } from 'react';
import { Camera, Eye, Radio, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';
import { HornbillProfile } from '../types';

interface CameraViewProps {
  hornbill: HornbillProfile;
  onOpenVoice: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ hornbill, onOpenVoice }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCam, setSelectedCam] = useState<'nest' | 'canopy'>('canopy');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            กล้องตรวจจับรังเทียมและยอดไม้เรือนยอด (Canopy & Nest Cam)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            สถานีกล้องถ่ายทอดสัญญาณความละเอียดสูง อุทยานแห่งชาติแจ้ซ้อน แปลงวิจัยที่ 3
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCam('canopy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCam === 'canopy'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            กล้อง 1: เรือนยอดไม้ยางแดง
          </button>
          <button
            onClick={() => setSelectedCam('nest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCam === 'nest'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            กล้อง 2: โพรงรังเทียมอนุรักษ์
          </button>
        </div>
      </div>

      {/* Main Video Stream Frame */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative aspect-video max-h-[560px] flex items-center justify-center">
        <img
          src={selectedCam === 'canopy' ? '/assets/hornbill_canopy_bg.jpg' : '/assets/hornbill_portrait.jpg'}
          alt="Hornbill live cam"
          className="w-full h-full object-cover opacity-90 transition-all duration-700"
        />

        {/* Live overlay badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            LIVE
          </span>
          <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
            {selectedCam === 'canopy' ? 'อุทยานแห่งชาติแจ้ซ้อน - ยอดไม้ยางแดง' : 'โพรงรังเทียมหมายเลข NB-04'}
          </span>
        </div>

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-3 py-1 rounded-full border border-white/20">
          21 ต.ค. 2569 14:35:12
        </div>

        {/* Floating Hornbill Detection Box */}
        <div className="absolute bottom-16 left-8 sm:left-12 bg-black/75 backdrop-blur-md text-white p-3.5 rounded-2xl border border-emerald-500/40 shadow-xl max-w-xs">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ตรวจพบนกกก (AI Detection: 99.4%)</span>
          </div>
          <p className="text-xs text-slate-200 font-semibold">{hornbill.name} ({hornbill.code})</p>
          <p className="text-[11px] text-slate-400 mt-0.5">พฤติกรรม: กำลังเกาะพักและแต่งขนปีกบนกิ่งไม้ใหญ่</p>
        </div>

        {/* Bottom stream controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span>อัตราความละเอียด: 1080p 60fps</span>
          </div>

          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>ถาม AI เกี่ยวกับสิ่งที่เห็นในกล้อง</span>
          </button>
        </div>
      </div>
    </div>
  );
};

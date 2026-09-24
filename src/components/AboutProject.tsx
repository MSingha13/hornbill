import React from 'react';
import { ShieldCheck, Globe, Leaf, Heart, Feather, Cpu, Satellite } from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            โครงการชีวานุรักษ์ (Bio-Conservation)
          </span>
          <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            พันธกิจเพื่อความหลากหลายทางชีวภาพ
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
          ระบบติดตามนกกก HORNBILL TRACKING
        </h2>
        <p className="text-sm text-emerald-800 font-semibold mt-1">
          ความร่วมมือทางยุทธศาสตร์ระหว่าง GISTDA • BSRC • สวนสัตว์เปิดเขาเขียว
        </p>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-3 leading-relaxed">
          โครงการติดตามพฤติกรรมและการกระจายตัวของนกกาฮัง/นกกก (Great Hornbill) ผ่านปลอกคอดาวเทียมพลังงานแสงอาทิตย์ เพื่อฟื้นฟูระบบนิเวศป่าต้นน้ำและประเมินประสิทธิภาพการกระจายเมล็ดพันธุ์ในผืนป่าภาคเหนือของประเทศไทย
        </p>
      </div>

      {/* 3 Organizations: GISTDA, BSRC, สวนสัตว์เปิดเขาเขียว */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* GISTDA */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
          <div className="h-16 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4 w-full max-w-[200px]">
            <img
              src="/assets/logo_gistda.svg"
              alt="GISTDA"
              className="max-h-10 w-auto object-contain"
            />
          </div>
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full mb-1.5">
            เทคโนโลยีอวกาศ & GIS
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน)
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            พัฒนาระบบเครื่องมือติดตามนกกาฮังด้วยดาวเทียม GNSS น้ำหนักเบา ประมวลผลพิกัดภูมิสารสนเทศ และวิเคราะห์ภาพถ่ายดาวเทียมติดตามพื้นที่เรือนยอดป่า
          </p>
        </div>

        {/* BSRC */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
          <div className="h-16 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4 w-full max-w-[200px]">
            <img
              src="/assets/logo_bsrc.svg"
              alt="BSRC"
              className="max-h-11 w-auto object-contain"
            />
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1.5">
            พลังงาน & ความยั่งยืน
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            บริษัท บางจาก ศรีราชา จำกัด (มหาชน)
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            ผู้ร่วมผลักดันโครงการชีวานุรักษ์ เพื่อส่งเสริมความหลากหลายทางชีวภาพ ฟื้นฟูนกกาฮังคืนสู่ผืนป่าภาคเหนือ และสนับสนุนการมีส่วนร่วมของชุมชนรอบพื้นที่อนุรักษ์
          </p>
        </div>

        {/* สวนสัตว์เปิดเขาเขียว */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
          <div className="h-16 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4 w-full max-w-[200px]">
            <img
              src="/assets/logo_khaokheow.svg"
              alt="สวนสัตว์เปิดเขาเขียว"
              className="max-h-12 w-12 rounded-full object-contain shadow-xs"
            />
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full mb-1.5">
            เพาะขยายพันธุ์ & ฟื้นฟูสัตว์ป่า
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            สวนสัตว์เปิดเขาเขียว
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">องค์การสวนสัตว์แห่งประเทศไทย ในพระบรมราชูปถัมภ์</p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            ศูนย์เพาะเลี้ยงและขยายพันธุ์นกกาฮัง (KKOZ) วิจัยพันธุกรรม ตรวจสุขภาพและฟื้นฟูพฤติกรรมสัตว์ป่าเพื่อเตรียมความพร้อมก่อนปล่อยคืนสู่ธรรมชาติ (Soft Release)
          </p>
        </div>
      </div>

      {/* Tech Specifications */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
          <Cpu className="w-4 h-4" />
          <span>เทคโนโลยีอุปกรณ์ติดตาม</span>
        </div>
        <h3 className="text-xl font-black mb-4">GISTDA Solar GPS Telemetry Collar (Version 2)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-emerald-300 font-semibold">น้ำหนักรวมสายรัด</p>
            <p className="text-lg font-bold text-white mt-1">45 กรัม</p>
            <p className="text-[10px] text-slate-300 mt-1">ไม่เกิน 1.5% ของน้ำหนักตัวนก</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-emerald-300 font-semibold">พลังงาน</p>
            <p className="text-lg font-bold text-white mt-1">Solar + Li-ion</p>
            <p className="text-[10px] text-slate-300 mt-1">ใช้งานต่อเนื่องได้กว่า 5 ปี</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-emerald-300 font-semibold">ความถี่ส่งพิกัด</p>
            <p className="text-lg font-bold text-white mt-1">ทุก 2 ชั่วโมง</p>
            <p className="text-[10px] text-slate-300 mt-1">ปรับตามแสงแดดและการบิน</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-emerald-300 font-semibold">การเชื่อมต่อเสียง AI</p>
            <p className="text-lg font-bold text-white mt-1">Gemini 3.8 Live</p>
            <p className="text-[10px] text-slate-300 mt-1">วิเคราะห์ข้อมูลเสียงเรียลไทม์</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { History, Download, ChevronRight, Filter } from 'lucide-react';
import { TrackingPoint } from '../types';

interface HistoryTableProps {
  history: TrackingPoint[];
  onSelectPoint?: (point: TrackingPoint) => void;
  selectedPoint?: TrackingPoint | null;
  onExportCSV: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  onSelectPoint,
  selectedPoint,
  onExportCSV,
}) => {
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Dynamically extract unique location areas
  const uniqueLocations = Array.from(new Set(history.map(h => h.location || h.address || ''))).filter(Boolean);

  const filteredHistory = history.filter(item => {
    if (filterLocation === 'all') return true;
    const text = `${item.location} ${item.address || ''}`;
    return text.includes(filterLocation);
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar matching Image 2 */}
      <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <History className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            ประวัติตำแหน่ง
          </h3>
          <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            {filteredHistory.length} พิกัด
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Location */}
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">ทุกพื้นที่สำรวจ ({history.length})</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc.length > 25 ? `${loc.slice(0, 25)}...` : loc}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content matching Image 2 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 font-medium">ลำดับ</th>
              <th className="py-3 px-4 font-medium">รหัสติดตาม</th>
              <th className="py-3 px-4 font-medium">วันที่</th>
              <th className="py-3 px-4 font-medium">เวลา</th>
              <th className="py-3 px-4 font-medium">ละติจูด</th>
              <th className="py-3 px-4 font-medium">ลองจิจูด</th>
              <th className="py-3 px-4 font-medium">พื้นที่</th>
              <th className="py-3 px-4 font-medium">ระดับแบตเตอรี่</th>
              <th className="py-3 px-4 font-medium">อุณหภูมิ (°C)</th>
              <th className="py-3 px-4 text-center font-medium">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredHistory.map((row) => {
              const isSelected = selectedPoint?.index === row.index;
              const isLatest = row.index === 1;

              return (
                <tr
                  key={row.index}
                  onClick={() => onSelectPoint && onSelectPoint(row)}
                  className={`hover:bg-emerald-50/50 cursor-pointer transition ${
                    isSelected ? 'bg-emerald-100/50 font-medium' : isLatest ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {isLatest && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                      <span>{row.index}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {row.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{row.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{row.time}</td>
                  <td className="py-3 px-4 font-mono font-medium">{row.lat.toFixed(4)}</td>
                  <td className="py-3 px-4 font-mono font-medium">{row.lng.toFixed(4)}</td>
                  <td className="py-3 px-4 text-emerald-800 font-medium">
                    {row.location}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{row.battery.toFixed(2)}%</span>
                      <div className="w-12 bg-slate-100 rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, row.battery)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {row.temp.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium">
                      <span>{row.activity ? 'ดูพฤติกรรม' : 'พิกัด'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

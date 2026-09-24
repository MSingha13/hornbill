import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { TrackingMap } from './components/TrackingMap';
import { LatestStatusCard } from './components/LatestStatusCard';
import { HistoryTable } from './components/HistoryTable';
import { AboutProject } from './components/AboutProject';
import { HORNBILLS_LIST } from './data/hornbillData';
import { HornbillProfile, TrackingPoint } from './types';
import { transformGasData, GasApiResponse } from './utils/gasDataService';

export default function App() {
  const [hornbills, setHornbills] = useState<HornbillProfile[]>(HORNBILLS_LIST);
  const [selectedHornbill, setSelectedHornbill] = useState<HornbillProfile>(HORNBILLS_LIST[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedPoint, setSelectedPoint] = useState<TrackingPoint | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveSyncError, setLiveSyncError] = useState<string | null>(null);

  // Function to fetch live telemetry from Google Apps Script endpoint via backend proxy
  const fetchLiveTelemetry = useCallback(async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    try {
      const response = await fetch('/api/tracking');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: GasApiResponse = await response.json();

      if (data && data.records && data.records.length > 0) {
        setHornbills((prevList) => {
          const targetIndex = prevList.findIndex(h => h.code === 'KKOZ01');
          const baseProfile = targetIndex >= 0 ? prevList[targetIndex] : prevList[0];
          const updatedProfile = transformGasData(data, baseProfile);

          const nextList = [...prevList];
          if (targetIndex >= 0) {
            nextList[targetIndex] = updatedProfile;
          } else {
            nextList.unshift(updatedProfile);
          }
          return nextList;
        });

        setSelectedHornbill((prevSelected) => {
          if (prevSelected.code === 'KKOZ01' || !prevSelected.code) {
            return transformGasData(data, prevSelected);
          }
          return prevSelected;
        });

        setLiveSyncError(null);
      }
    } catch (err: any) {
      console.warn('Failed to fetch live tracking telemetry:', err?.message);
      setLiveSyncError(err?.message || 'Error fetching live data');
    } finally {
      if (showLoader) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  // Fetch live telemetry on mount and setup polling every 30 seconds
  useEffect(() => {
    fetchLiveTelemetry(false);
    const interval = setInterval(() => {
      fetchLiveTelemetry(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry]);

  // Satellite refresh trigger
  const handleRefresh = () => {
    fetchLiveTelemetry(true);
  };

  // Export CSV with UTF-8 BOM for Thai character display in Excel
  const handleExportCSV = () => {
    const data = selectedHornbill.history;
    const headers = [
      'ลำดับ (No.)',
      'รหัสติดตาม (Code)',
      'วันที่ (Date)',
      'เวลา (Time)',
      'ละติจูด (Lat)',
      'ลองจิจูด (Lng)',
      'พื้นที่ (Location)',
      'ระดับแบตเตอรี่ (%)',
      'อุณหภูมิ (°C)',
      'ระดับความสูง (m)',
      'ความเร็ว (km/h)',
      'พฤติกรรม (Activity)',
    ];

    const rows = data.map((d) => [
      d.index,
      `"${d.code}"`,
      `"${d.date}"`,
      `"${d.time}"`,
      d.lat.toFixed(4),
      d.lng.toFixed(4),
      `"${d.location}"`,
      d.battery.toFixed(2),
      d.temp.toFixed(2),
      d.altitudeM || 0,
      d.speedKmh || 0,
      `"${d.activity || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hornbill_${selectedHornbill.code}_tracking_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewOnMap = () => {
    setActiveTab('overview');
    const target = selectedPoint || selectedHornbill.latestPoint;
    // Force re-trigger selection flyTo by updating state
    setSelectedPoint({ ...target });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-800 font-['Prompt',sans-serif]">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Forest Panorama Overlay */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-top bg-no-repeat transition-all duration-700 opacity-60"
          style={{ backgroundImage: `url('/assets/hornbill_mountain_bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-slate-50/50 to-emerald-950/20 backdrop-blur-[0.5px] pointer-events-none" />

        {/* Top Header */}
        <Header
          selectedHornbill={selectedHornbill}
          onSelectHornbill={(h) => {
            setSelectedHornbill(h);
            setSelectedPoint(null);
          }}
          hornbills={hornbills}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onExportCSV={handleExportCSV}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10">
          <div className="max-w-[1700px] mx-auto space-y-4">
            {/* Overview / Dashboard Tab matching Image 2 */}
            {activeTab === 'overview' && (
              <>
                {/* Live Data Connection Banner */}
                {selectedHornbill.isLiveFeed && (
                  <div className="bg-emerald-950/90 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm border border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-semibold text-emerald-300">
                        เชื่อมต่อสัญญาณข้อมูลดาวเทียมสด (Google Apps Script Live Stream)
                      </span>
                      <span className="hidden md:inline-block text-[11px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200 font-mono">
                        {selectedHornbill.history.length} จุดพิกัด
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-emerald-200">
                      <span>อัปเดตอัตโนมัติทุก 30 วินาที</span>
                      {selectedHornbill.lastSyncedAt && (
                        <span className="text-emerald-400 font-mono text-[11px]">
                          (ซิงก์ล่าสุด {selectedHornbill.lastSyncedAt} น.)
                        </span>
                      )}
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isRefreshing ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลทันที'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 4 Metric KPI Cards with Dynamic Selected Point */}
                <MetricCards
                  hornbill={selectedHornbill}
                  selectedPoint={selectedPoint}
                  onResetToLatest={() => setSelectedPoint(null)}
                />

                {/* Map & Latest Status Card Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Interactive Map (8 cols) */}
                  <div className="lg:col-span-8">
                    <TrackingMap
                      hornbill={selectedHornbill}
                      selectedPoint={selectedPoint}
                      onSelectPoint={(pt) => setSelectedPoint(pt)}
                    />
                  </div>

                  {/* Latest / Selected Status Profile Card (4 cols) */}
                  <div className="lg:col-span-4">
                    <LatestStatusCard
                      hornbill={selectedHornbill}
                      selectedPoint={selectedPoint}
                      onViewOnMap={handleViewOnMap}
                      onResetToLatest={() => setSelectedPoint(null)}
                    />
                  </div>
                </div>

                {/* Position History Table */}
                <HistoryTable
                  history={selectedHornbill.history}
                  selectedPoint={selectedPoint}
                  onSelectPoint={(pt) => setSelectedPoint(pt)}
                  onExportCSV={handleExportCSV}
                />
              </>
            )}

            {/* Map Focus Tab */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      แผนที่ติดตามการบินมุมมองขยาย (Full Tracking View)
                    </h2>
                    <p className="text-xs text-slate-500">
                      เส้นทางการบินสะสมจากดอยขุนตาลถึงแจ้ซ้อน จังหวัดลำปาง
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                </div>
                <TrackingMap
                  hornbill={selectedHornbill}
                  selectedPoint={selectedPoint}
                  onSelectPoint={(pt) => setSelectedPoint(pt)}
                />
              </div>
            )}

            {/* About Project Tab */}
            {activeTab === 'about' && (
              <AboutProject />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Plus, Minus, Maximize2, Compass, MapPin } from 'lucide-react';
import { HornbillProfile, TrackingPoint } from '../types';

interface TrackingMapProps {
  hornbill: HornbillProfile;
  selectedPoint?: TrackingPoint | null;
  onSelectPoint?: (point: TrackingPoint) => void;
}

type MapLayerType = 'topo' | 'street' | 'satellite';

export const TrackingMap: React.FC<TrackingMapProps> = ({
  hornbill,
  selectedPoint,
  onSelectPoint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const latestMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersMapRef = useRef<Map<number, L.Layer>>(new Map());
  const highlightMarkerRef = useRef<L.Marker | null>(null);

  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('topo');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Tile layers definitions
  const tileLayers: Record<MapLayerType, { url: string; attribution: string }> = {
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap, © OpenStreetMap contributors',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = hornbill.latestPoint ? hornbill.latestPoint.lat : 38.959176;
      const initialLng = hornbill.latestPoint ? hornbill.latestPoint.lng : -77.452271;
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialLat, initialLng], 11);

      const tileLayer = L.tileLayer(tileLayers[currentLayer].url, {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const newTile = L.tileLayer(tileLayers[currentLayer].url, {
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [currentLayer]);

  // Update route & markers when hornbill data or history changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markersMapRef.current.clear();
    if (highlightMarkerRef.current) {
      highlightMarkerRef.current.remove();
      highlightMarkerRef.current = null;
    }

    const points = hornbill.history;
    if (!points || points.length === 0) return;

    // Sort chronologically (oldest to newest) for polyline
    const chronological = [...points].sort((a, b) => a.index - b.index).reverse();
    const latLngs: L.LatLngTuple[] = chronological.map(p => [p.lat, p.lng]);

    // Draw route polyline with dashed style matching Image 2
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
    }

    const polyline = L.polyline(latLngs, {
      color: '#059669',
      weight: 4.5,
      dashArray: '8, 8',
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(markersGroup);

    routePolylineRef.current = polyline;

    // Add intermediate waypoint markers (circles)
    chronological.forEach((pt) => {
      const isLatest = pt.index === 1;
      if (isLatest) return; // Latest gets special custom marker

      const circleMarker = L.circleMarker([pt.lat, pt.lng], {
        radius: 7,
        fillColor: '#ffffff',
        color: '#047857',
        weight: 3.5,
        opacity: 1,
        fillOpacity: 1,
      });

      const latCoord = `${Math.abs(pt.lat).toFixed(6)}° ${pt.lat >= 0 ? 'N' : 'S'}`;
      const lngCoord = `${Math.abs(pt.lng).toFixed(6)}° ${pt.lng >= 0 ? 'E' : 'W'}`;

      circleMarker.bindPopup(`
        <div style="font-family: 'Prompt', sans-serif; font-size: 12px; line-height: 1.45; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <b style="color: #047857; font-size: 13px;">${pt.code} (จุดที่ ${pt.index})</b>
            <span style="font-size: 10px; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: 600;">ประวัติ</span>
          </div>
          <div style="color: #334155;">
            <div>🕒 <b>เวลา:</b> ${pt.date} ${pt.time} น.</div>
            <div>📍 <b>พิกัด:</b> ${latCoord}, ${lngCoord}</div>
            <div>🏞️ <b>พื้นที่:</b> ${pt.address || pt.location}</div>
            <div>🔋 <b>แบตเตอรี่:</b> ${pt.battery.toFixed(2)}%</div>
            <div>🌡️ <b>อุณหภูมิ:</b> ${pt.temp.toFixed(2)} °C</div>
            ${pt.speedKmh ? `<div>💨 <b>ความเร็ว:</b> ${pt.speedKmh} km/h</div>` : ''}
          </div>
        </div>
      `);

      circleMarker.on('click', () => {
        if (onSelectPoint) onSelectPoint(pt);
      });

      circleMarker.addTo(markersGroup);
      markersMapRef.current.set(pt.index, circleMarker);
    });

    // Latest position marker with custom Hornbill icon and tooltip matching Image 2
    const latest = hornbill.latestPoint;
    const latestCustomIcon = L.divIcon({
      className: 'latest-hornbill-marker cursor-pointer',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Top Tooltip pill matching Image 2 -->
          <div style="
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 4px 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Prompt', sans-serif;
            text-align: center;
            white-space: nowrap;
            margin-bottom: 6px;
          ">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.1;">
              ${latest.code}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #047857; line-height: 1.1;">
              ตำแหน่งล่าสุด
            </div>
          </div>

          <!-- Pulsing Halo and Avatar Pin -->
          <div style="position: relative; width: 42px; height: 42px;">
            <span style="
              position: absolute;
              inset: -6px;
              border-radius: 9999px;
              background-color: #10b981;
              opacity: 0.4;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
            <div style="
              width: 42px;
              height: 42px;
              border-radius: 9999px;
              border: 3px solid #f59e0b;
              overflow: hidden;
              background: #064e3b;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <img src="${hornbill.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${latest.code}"/>
            </div>
            <!-- Pin bottom tip -->
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid #f59e0b;
            "></div>
          </div>
        </div>
      `,
      iconSize: [120, 95],
      iconAnchor: [60, 88],
      popupAnchor: [0, -90],
    });

    const latestMarker = L.marker([latest.lat, latest.lng], {
      icon: latestCustomIcon,
      zIndexOffset: 1000,
    }).addTo(markersGroup);

    latestMarker.bindPopup(`
      <div style="font-family: 'Prompt', sans-serif; min-width: 190px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; background: #000;">
            <img src="${hornbill.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;"/>
          </div>
          <div>
            <b style="color: #047857; font-size: 14px;">${hornbill.name} (${hornbill.code})</b><br/>
            <span style="font-size: 11px; color: #64748b;">${hornbill.thaiSpecies}</span>
          </div>
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <div>📍 <b>พิกัด:</b> ${Math.abs(latest.lat).toFixed(6)}° ${latest.lat >= 0 ? 'N' : 'S'}, ${Math.abs(latest.lng).toFixed(6)}° ${latest.lng >= 0 ? 'E' : 'W'}</div>
          <div>🏞️ <b>พื้นที่:</b> ${latest.address || latest.location}</div>
          <div>⛰️ <b>ระดับความสูง:</b> ${latest.altitudeM || 450} เมตร</div>
          <div>🔋 <b>แบตเตอรี่:</b> ${latest.battery.toFixed(2)}%</div>
          <div>🌡️ <b>อุณหภูมิ:</b> ${latest.temp.toFixed(2)} °C</div>
          <div>🕒 <b>อัปเดตล่าสุด:</b> ${latest.date} ${latest.time} น.</div>
        </div>
      </div>
    `);

    latestMarker.on('click', () => {
      if (onSelectPoint) onSelectPoint(latest);
    });

    markersMapRef.current.set(latest.index, latestMarker);
    latestMarkerRef.current = latestMarker;

    // Fit bounds smoothly with slight padding
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [hornbill]);

  // Smoothly react to selectedPoint change: flyTo and show active marker highlight
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPoint) return;
    const map = mapInstanceRef.current;

    // Smoothly fly map to selected point coordinates
    map.flyTo([selectedPoint.lat, selectedPoint.lng], 13, { duration: 0.85 });

    // Open popup of the corresponding marker
    const marker = markersMapRef.current.get(selectedPoint.index);
    if (marker && 'openPopup' in marker) {
      (marker as any).openPopup();
    }

    // Add or update active highlighted ring on the selected point
    if (highlightMarkerRef.current) {
      highlightMarkerRef.current.remove();
      highlightMarkerRef.current = null;
    }

    if (markersGroupRef.current && selectedPoint.index !== 1) {
      const activeIcon = L.divIcon({
        className: 'selected-point-indicator',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="
              background: #065f46;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              font-family: 'Prompt', sans-serif;
              padding: 2px 8px;
              border-radius: 9999px;
              white-space: nowrap;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              border: 1.5px solid #ffffff;
              margin-bottom: 4px;
            ">
              📍 จุดที่ #${selectedPoint.index} (${selectedPoint.time} น.)
            </div>
            <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; inset: -4px; border-radius: 9999px; background-color: #10b981; opacity: 0.6; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 20px; height: 20px; border-radius: 9999px; background: #059669; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 10px;">
                ${selectedPoint.index}
              </div>
            </div>
          </div>
        `,
        iconSize: [140, 60],
        iconAnchor: [70, 56],
        popupAnchor: [0, -60],
      });

      const hlMarker = L.marker([selectedPoint.lat, selectedPoint.lng], {
        icon: activeIcon,
        zIndexOffset: 1200,
      }).addTo(markersGroupRef.current);

      highlightMarkerRef.current = hlMarker;
    }
  }, [selectedPoint]);

  // Center on latest point or selected point
  const handleCenterOnLatest = () => {
    if (!mapInstanceRef.current) return;
    const target = selectedPoint || hornbill.latestPoint;
    mapInstanceRef.current.flyTo([target.lat, target.lng], 12, { duration: 1.2 });
    if (latestMarkerRef.current) {
      latestMarkerRef.current.openPopup();
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px] transition-all">
      {/* Top Map Header Bar matching Image 2 */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        {/* Left Dropdown Button: "แผนที่ติดตาม ▾" */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>แผนที่ติดตาม</span>
            <span className="text-slate-400">▾</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ระยะบินสะสม: 64.8 กม.</span>
          </div>
        </div>

        {/* Right Map Controls: Zoom (+/-), Layer switch, Center */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="w-8 h-8 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center transition hover:text-emerald-700 cursor-pointer"
              title="เปลี่ยนชั้นข้อมูลแผนที่"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 text-xs z-50">
                <button
                  onClick={() => { setCurrentLayer('topo'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition ${
                    currentLayer === 'topo' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ภูมิประเทศ (Topo)
                </button>
                <button
                  onClick={() => { setCurrentLayer('street'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition ${
                    currentLayer === 'street' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  แผนที่ถนน (Street)
                </button>
                <button
                  onClick={() => { setCurrentLayer('satellite'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition ${
                    currentLayer === 'satellite' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ดาวเทียม (Satellite)
                </button>
              </div>
            )}
          </div>

          {/* Center on Hornbill */}
          <button
            onClick={handleCenterOnLatest}
            className="w-8 h-8 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center transition hover:text-emerald-700 cursor-pointer"
            title="ปรับมุมมองไปยังตำแหน่งล่าสุดของนกกก"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center transition hover:text-emerald-700 cursor-pointer"
            title="ซูมเข้า"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center transition hover:text-emerald-700 cursor-pointer"
            title="ซูมออก"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Bottom Scale Indicator matching Image 2 */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-md px-2.5 py-1 shadow-xs pointer-events-none">
        <div className="flex items-center gap-3 text-[10px] text-slate-700 font-semibold font-mono">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>20 กม.</span>
        </div>
        <div className="h-1 bg-slate-800 mt-0.5 w-24 rounded-xs"></div>
      </div>

      {/* Attribution matching Image 2 */}
      <div className="absolute bottom-1 right-2 z-[400] text-[10px] text-slate-500/80 bg-white/70 px-2 py-0.5 rounded pointer-events-none">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

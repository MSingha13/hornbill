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
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([17.265, 98.78], 10);

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
        radius: 6.5,
        fillColor: '#ffffff',
        color: '#047857',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      });

      circleMarker.bindPopup(`
        <div style="font-family: 'Prompt', sans-serif; font-size: 12px; line-height: 1.4;">
          <b style="color: #047857;">${pt.code} (จุดที่ ${pt.index})</b><br/>
          <span>เวลา: ${pt.date} ${pt.time} น.</span><br/>
          <span>พิกัด: ${pt.lat.toFixed(4)}°N, ${pt.lng.toFixed(4)}°E</span><br/>
          <span>พื้นที่: ${pt.address || pt.location}</span><br/>
          <span>ความสูง: ${pt.altitudeM || '-'} ม.</span><br/>
          <span>แบตเตอรี่: ${pt.battery}% | อุณหภูมิ: ${pt.temp}°C</span>
        </div>
      `);

      circleMarker.on('click', () => {
        if (onSelectPoint) onSelectPoint(pt);
      });

      circleMarker.addTo(markersGroup);
    });

    // Check if points are in Thailand region or other area
    const isLampangArea = latLngs.some(([lat, lng]) => lat > 15 && lat < 20 && lng > 97 && lng < 101);

    if (isLampangArea) {
      // Add area labels on map (Doi Khun Tan, Lampang, Chae Son) matching Image 2
      const areaLabels = [
        { name: 'อุทยานแห่งชาติดอยขุนตาล', coords: [17.185, 98.61] as [number, number] },
        { name: 'ลำปาง', coords: [17.205, 98.74] as [number, number], isCity: true },
        { name: 'อุทยานแห่งชาติแจ้ซ้อน', coords: [17.31, 98.98] as [number, number] },
      ];

      areaLabels.forEach(area => {
        const labelIcon = L.divIcon({
          className: 'custom-area-label',
          html: `
            <div style="
              font-family: 'Prompt', sans-serif;
              font-size: ${area.isCity ? '14px' : '12px'};
              font-weight: 700;
              color: ${area.isCity ? '#334155' : '#1e3a2b'};
              text-shadow: 0 1px 3px rgba(255,255,255,0.9), 0 0 2px #fff;
              white-space: nowrap;
              pointer-events: none;
              background: rgba(255, 255, 255, 0.4);
              padding: 2px 6px;
              border-radius: 6px;
              backdrop-filter: blur(2px);
            ">
              ${area.name}
            </div>
          `,
          iconAnchor: [40, 10],
        });
        L.marker(area.coords, { icon: labelIcon, interactive: false }).addTo(markersGroup);
      });

      // Highway 1 marker badge
      const hwyIcon = L.divIcon({
        className: 'hwy-badge',
        html: `
          <div style="
            background: #ffffff;
            border: 1.5px solid #64748b;
            border-radius: 4px;
            padding: 1px 5px;
            font-weight: 800;
            font-size: 11px;
            color: #1e293b;
            box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          ">1</div>
        `,
        iconAnchor: [10, 10],
      });
      L.marker([17.24, 98.73], { icon: hwyIcon, interactive: false }).addTo(markersGroup);
    }

    // Latest position marker with custom Hornbill icon and tooltip matching Image 2
    const latest = hornbill.latestPoint;
    const latestCustomIcon = L.divIcon({
      className: 'latest-hornbill-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
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
          <div>📍 <b>พิกัด:</b> ${latest.lat.toFixed(4)}° N, ${latest.lng.toFixed(4)}° E</div>
          <div>🏞️ <b>พื้นที่:</b> ${latest.address ? latest.address : `${latest.location} จ.ลำปาง`}</div>
          <div>⛰️ <b>ระดับความสูง:</b> ${latest.altitudeM || 842} เมตร</div>
          <div>🔋 <b>แบตเตอรี่:</b> ${latest.battery}% (ปกติ)</div>
          <div>🌡️ <b>อุณหภูมิ:</b> ${latest.temp} °C</div>
          <div>🕒 <b>อัปเดตล่าสุด:</b> ${latest.date} ${latest.time} น.</div>
        </div>
      </div>
    `);

    latestMarkerRef.current = latestMarker;

    // Fit bounds smoothly with slight padding
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
  }, [hornbill]);

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

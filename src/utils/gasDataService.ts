import { HornbillProfile, TrackingPoint } from '../types';

export interface GasRecord {
  recordedAt?: string;
  assetId?: string;
  positionId?: string;
  latitude?: string | number;
  longitude?: string | number;
  displayTime?: string;
  receivedTime?: string;
  utcTime?: string;
  localTime?: string;
  battery?: string | number;
  temperature?: string | number;
  speed?: string | number;
  altitude?: string | number;
  address?: string;
}

export interface GasApiResponse {
  success: boolean;
  message?: string;
  latest?: GasRecord;
  records?: GasRecord[];
  fromCache?: boolean;
}

// Helper to format date & time nicely in Thai
function parseDateTime(dateStr?: string, timeStr?: string) {
  // If dateStr has "YYYY-MM-DD HH:mm:ss"
  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.trim().split(' ');
    const [y, m, d] = parts[0].split('-');
    const yearTh = parseInt(y, 10) + 543;
    const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthName = monthsTh[parseInt(m, 10) - 1] || m;
    const formattedDate = `${parseInt(d, 10)} ${monthName} ${yearTh}`;
    const timeFormatted = parts[1] ? parts[1].slice(0, 5) : (timeStr || '12:00');
    return { date: formattedDate, time: timeFormatted };
  }

  // If displayTime format like "9/23/2026 11:07:22 AM"
  if (dateStr && dateStr.includes('/')) {
    try {
      const dt = new Date(dateStr);
      if (!isNaN(dt.getTime())) {
        const yearTh = dt.getFullYear() + 543;
        const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const formattedDate = `${dt.getDate()} ${monthsTh[dt.getMonth()]} ${yearTh}`;
        const hours = dt.getHours().toString().padStart(2, '0');
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        return { date: formattedDate, time: `${hours}:${minutes}` };
      }
    } catch {}
  }

  return { date: dateStr || '23 ก.ย. 2569', time: timeStr || '11:12' };
}

export function transformGasData(response: GasApiResponse, fallbackProfile: HornbillProfile): HornbillProfile {
  if (!response || !response.records || response.records.length === 0) {
    return fallbackProfile;
  }

  const rawRecords = response.records;

  const history: TrackingPoint[] = rawRecords.map((r, i) => {
    const lat = parseFloat(String(r.latitude || 0));
    const lng = parseFloat(String(r.longitude || 0));
    const battery = parseFloat(String(r.battery || 80));
    const temp = parseFloat(String(r.temperature || 20));
    const speed = parseFloat(String(r.speed || 0));
    const altitude = r.altitude ? parseFloat(String(r.altitude)) : 450;

    const { date, time } = parseDateTime(r.recordedAt || r.displayTime);

    // Location name formatting
    let loc = r.address || 'จุดส่งสัญญาณดาวเทียม';
    if (r.address && r.address.includes(',')) {
      // Simplify address display for card
      const parts = r.address.split(',').map(s => s.trim());
      loc = parts.slice(0, 3).join(', ');
    }

    return {
      index: i + 1,
      code: r.assetId || fallbackProfile.code,
      date,
      time,
      lat,
      lng,
      location: loc,
      battery,
      temp,
      altitudeM: altitude,
      speedKmh: speed,
      address: r.address,
      positionId: r.positionId,
      rawRecordedAt: r.recordedAt || r.displayTime,
      rawRecord: r,
      activity: speed > 5 ? 'กำลังบินเคลื่อนที่' : 'เกาะพัก / พักผ่อนบนกิ่งไม้',
    };
  });

  const latestPoint = history[0] || fallbackProfile.latestPoint;

  return {
    ...fallbackProfile,
    code: latestPoint.code,
    isLiveFeed: true,
    lastSyncedAt: new Date().toLocaleTimeString('th-TH'),
    latestPoint,
    history,
    rawGasRecords: rawRecords,
  };
}

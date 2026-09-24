import { HornbillProfile, TrackingPoint } from '../types';

export const KKOZ01_HISTORY: TrackingPoint[] = [
  {
    index: 1,
    code: 'KKOZ01',
    date: '23 ก.ย. 2569',
    time: '11:12',
    lat: 38.959176,
    lng: -77.452271,
    location: 'Air Freight Lane, Carters, Virginia',
    address: 'Air Freight Lane, Carters, Virginia, 20166, USA',
    positionId: '1c793a47-04b7-f111-811e-90b11c455a5d',
    battery: 68.75,
    temp: 19.00,
    altitudeM: 450,
    speedKmh: 0.685,
    activity: 'เกาะพัก / พักผ่อนบนกิ่งไม้'
  },
  {
    index: 2,
    code: 'KKOZ01',
    date: '23 ก.ย. 2569',
    time: '08:22',
    lat: 38.703283,
    lng: -77.787976,
    location: 'Taylor Street, Warrenton, Virginia',
    address: 'Taylor Street, Warrenton, Virginia, 20186, USA',
    positionId: 'dd932308-7ab6-f111-811d-90b11c455a5d',
    battery: 81.25,
    temp: 15.50,
    altitudeM: 450,
    speedKmh: 0,
    activity: 'เกาะพัก / พักผ่อนบนกิ่งไม้'
  },
  {
    index: 3,
    code: 'KKOZ01',
    date: '22 ก.ย. 2569',
    time: '16:19',
    lat: 38.703283,
    lng: -77.787912,
    location: 'Taylor Street, Warrenton, Virginia',
    address: 'Taylor Street, Warrenton, Virginia, 20186, USA',
    positionId: '66ad0328-33b6-f111-811d-90b11c455a5d',
    battery: 81.25,
    temp: 19.00,
    altitudeM: 450,
    speedKmh: 0,
    activity: 'เกาะพัก / พักผ่อนบนกิ่งไม้'
  },
  {
    index: 4,
    code: 'KKOZ01',
    date: '22 ก.ย. 2569',
    time: '10:10',
    lat: 38.888001,
    lng: -77.451906,
    location: 'Taylor Street, Warrenton, Virginia',
    address: 'Taylor Street, Warrenton, Virginia, 20186, USA',
    battery: 81.25,
    temp: 19.00,
    altitudeM: 450,
    speedKmh: 0,
    activity: 'เกาะพัก / พักผ่อนบนกิ่งไม้'
  },
  {
    index: 5,
    code: 'KKOZ01',
    date: '22 ก.ย. 2569',
    time: '06:01',
    lat: 39.412674,
    lng: -77.584707,
    location: 'Taylor Street, Warrenton, Virginia',
    address: 'Taylor Street, Warrenton, Virginia, 20186, USA',
    battery: 81.25,
    temp: 19.00,
    altitudeM: 450,
    speedKmh: 0,
    activity: 'เกาะพัก / พักผ่อนบนกิ่งไม้'
  }
];

export const HORNBILLS_LIST: HornbillProfile[] = [
  {
    code: 'KKOZ01',
    name: '',
    thaiSpecies: 'นกกก หรือ นกกาฮัง',
    englishSpecies: 'Great Hornbill',
    scientificName: 'Buceros bicornis',
    gender: 'เพศผู้ (Male)',
    age: 'ประมาณ 5 ปี (Adult)',
    weightKg: 3.2,
    wingSpanCm: 152,
    collarTag: 'GISTDA-GPS-SOLAR-T2',
    releaseDate: '15 ม.ค. 2568',
    originPark: 'อุทยานแห่งชาติดอยขุนตาล',
    currentPark: 'Air Freight Lane, Virginia, USA',
    photoUrl: '/assets/hornbill_portrait.jpg',
    status: 'active',
    latestPoint: KKOZ01_HISTORY[0],
    history: KKOZ01_HISTORY
  }
];

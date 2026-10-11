import { StationData } from '../types';

export interface TrainServiceProfile {
  id: string;
  number: string;
  name: string;
  category: string;
  route: string;
  zone: string;
  heroStationCode: string;
  heroStationName: string;
  heroScheduledTime: string;
  heroPlatform: string;
  activeSection: string;
  baseCruisingSpeed: number;
  stations: StationData[];
}

export const TRAIN_SERVICES: TrainServiceProfile[] = [
  {
    id: '12951',
    number: '12951',
    name: 'Mumbai Rajdhani Express',
    category: 'PREMIUM COACHING SERVICE',
    route: 'Mumbai Central → New Delhi Corridor',
    zone: 'WCR',
    heroStationCode: 'KOTA',
    heroStationName: 'Kota Junction',
    heroScheduledTime: '16:31',
    heroPlatform: '02',
    activeSection: 'RTM–KOTA',
    baseCruisingSpeed: 82,
    stations: [
      { code: 'MMCT', name: 'Mumbai Central', distanceKm: 0, scheduledTime: '06:00', scheduledMinutes: 360, status: 'passed' },
      { code: 'VDR', name: 'Vadodara', distanceKm: 392, scheduledTime: '11:15', scheduledMinutes: 675, status: 'passed' },
      { code: 'RTM', name: 'Ratlam', distanceKm: 653, scheduledTime: '15:46', scheduledMinutes: 946, status: 'approaching' },
      { code: 'KOTA', name: 'Kota Jn', distanceKm: 920, scheduledTime: '16:31', scheduledMinutes: 991, status: 'next' },
      { code: 'MTJ', name: 'Mathura', distanceKm: 1244, scheduledTime: '17:18', scheduledMinutes: 1038, status: 'downstream' },
      { code: 'NDLS', name: 'New Delhi', distanceKm: 1384, scheduledTime: '17:51', scheduledMinutes: 1071, status: 'downstream' },
    ],
  },
  {
    id: '22436',
    number: '22436',
    name: 'Vande Bharat Express',
    category: 'SEMI HIGH SPEED EXPRESS',
    route: 'New Delhi → Varanasi Corridor',
    zone: 'NR',
    heroStationCode: 'CNB',
    heroStationName: 'Kanpur Central',
    heroScheduledTime: '10:08',
    heroPlatform: '01',
    activeSection: 'ALJN–CNB',
    baseCruisingSpeed: 120,
    stations: [
      { code: 'NDLS', name: 'New Delhi', distanceKm: 0, scheduledTime: '06:00', scheduledMinutes: 360, status: 'passed' },
      { code: 'ALJN', name: 'Aligarh Jn', distanceKm: 131, scheduledTime: '07:12', scheduledMinutes: 432, status: 'passed' },
      { code: 'ETW', name: 'Etawah Jn', distanceKm: 297, scheduledTime: '08:45', scheduledMinutes: 525, status: 'approaching' },
      { code: 'CNB', name: 'Kanpur Central', distanceKm: 437, scheduledTime: '10:08', scheduledMinutes: 608, status: 'next' },
      { code: 'PRYJ', name: 'Prayagraj Jn', distanceKm: 631, scheduledTime: '12:08', scheduledMinutes: 728, status: 'downstream' },
      { code: 'BSB', name: 'Varanasi Jn', distanceKm: 755, scheduledTime: '14:00', scheduledMinutes: 840, status: 'downstream' },
    ],
  },
  {
    id: '12002',
    number: '12002',
    name: 'Bhopal Shatabdi Express',
    category: 'INTERCITY SUPERFAST EXPRESS',
    route: 'New Delhi → Rani Kamlapati (Bhopal)',
    zone: 'NCR',
    heroStationCode: 'GWL',
    heroStationName: 'Gwalior Junction',
    heroScheduledTime: '09:23',
    heroPlatform: '03',
    activeSection: 'AGC–GWL',
    baseCruisingSpeed: 110,
    stations: [
      { code: 'NDLS', name: 'New Delhi', distanceKm: 0, scheduledTime: '06:00', scheduledMinutes: 360, status: 'passed' },
      { code: 'MTJ', name: 'Mathura Jn', distanceKm: 141, scheduledTime: '07:19', scheduledMinutes: 439, status: 'passed' },
      { code: 'AGC', name: 'Agra Cantt', distanceKm: 195, scheduledTime: '07:50', scheduledMinutes: 470, status: 'approaching' },
      { code: 'GWL', name: 'Gwalior Jn', distanceKm: 313, scheduledTime: '09:23', scheduledMinutes: 563, status: 'next' },
      { code: 'VGLJ', name: 'VGL Jhansi', distanceKm: 410, scheduledTime: '10:45', scheduledMinutes: 645, status: 'downstream' },
      { code: 'RKMP', name: 'Rani Kamlapati', distanceKm: 708, scheduledTime: '14:40', scheduledMinutes: 880, status: 'downstream' },
    ],
  },
  {
    id: '12954',
    number: '12954',
    name: 'August Kranti Rajdhani',
    category: 'SUPERFAST COACHING SERVICE',
    route: 'Hazrat Nizamuddin → Mumbai Central',
    zone: 'WR',
    heroStationCode: 'ST',
    heroStationName: 'Surat Junction',
    heroScheduledTime: '05:32',
    heroPlatform: '01',
    activeSection: 'BRC–ST',
    baseCruisingSpeed: 95,
    stations: [
      { code: 'NZM', name: 'Hazrat Nizamuddin', distanceKm: 0, scheduledTime: '17:15', scheduledMinutes: 1035, status: 'passed' },
      { code: 'KOTA', name: 'Kota Jn', distanceKm: 458, scheduledTime: '21:55', scheduledMinutes: 1315, status: 'passed' },
      { code: 'BRC', name: 'Vadodara Jn', distanceKm: 986, scheduledTime: '03:25', scheduledMinutes: 205, status: 'approaching' },
      { code: 'ST', name: 'Surat', distanceKm: 1115, scheduledTime: '05:32', scheduledMinutes: 332, status: 'next' },
      { code: 'BVI', name: 'Borivali', distanceKm: 1349, scheduledTime: '08:48', scheduledMinutes: 528, status: 'downstream' },
      { code: 'MMCT', name: 'Mumbai Central', distanceKm: 1377, scheduledTime: '09:45', scheduledMinutes: 585, status: 'downstream' },
    ],
  },
];

import { StationData, DisruptionType, NetworkConditions } from '../types';

export const CASCADE_FACTOR = 0.4;
export const BASE_RANGE_MINUTES = 2; // ±2 min normally
export const DISRUPTION_RANGE_MULTIPLIER = 2.5; // ±5 min during disruption

export const DISRUPTIONS: Record<DisruptionType, {
  label: string;
  delayMin: number;
  prevSectionDelay: number;
  reason: string;
}> = {
  none: {
    label: 'Normal Operation',
    delayMin: 0,
    prevSectionDelay: 0,
    reason: 'Section clear, line running to scheduled speed',
  },
  severe_weather: {
    label: 'Severe weather ahead',
    delayMin: 5,
    prevSectionDelay: 2,
    reason: 'Adverse visibility in fog/monsoon buffer zone',
  },
  signal_failure: {
    label: 'Signal failure ahead',
    delayMin: 14,
    prevSectionDelay: 5,
    reason: 'Signal failure at MTJ-KOTA section interlocking',
  },
  preceding_train: {
    label: 'Preceding-train delay',
    delayMin: 8,
    prevSectionDelay: 4,
    reason: 'Freight rake headway clearance at outer signal',
  },
  tsr: {
    label: 'Temporary speed restriction',
    delayMin: 6,
    prevSectionDelay: 2,
    reason: 'Track maintenance 45 km/h restriction on curved section',
  },
  level_crossing: {
    label: 'Level-crossing closure',
    delayMin: 10,
    prevSectionDelay: 3,
    reason: 'LC-14 gate lock clearance awaiting road traffic clearance',
  },
};

/** Convert "HH:MM" string to minutes from 00:00 */
export function timeToMinutes(timeStr: string): number {
  const [hh, mm] = timeStr.split(':').map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

/** Convert minutes from 00:00 to "HH:MM" string */
export function minutesToTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = Math.floor(norm / 60).toString().padStart(2, '0');
  const mm = Math.floor(norm % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export interface PredictionResult {
  scheduledEta: string;
  predictedEta: string;
  delayMinutes: number;
  rangeMinutes: number; // e.g. 2 or 5
  rangeLower: string;   // e.g. 16:29
  rangeUpper: string;   // e.g. 16:33
  rangeText: string;    // e.g. "16:42 – 16:52 (±5 min)"
  reason: string;
  isDisrupted: boolean;
}

/**
 * Calculates predicted ETA based on formula:
 * predictedEta = scheduled + disruption delay + 0.4 * previous section delay
 * Range = ±2 min normally, times 2.5 during disruption
 */
export function calculateEta(
  scheduledTime: string,
  disruptionType: DisruptionType,
  overridePrevDelay?: number
): PredictionResult {
  const scheduledMin = timeToMinutes(scheduledTime);
  const disruption = DISRUPTIONS[disruptionType] || DISRUPTIONS.none;
  const prevDelay = overridePrevDelay !== undefined ? overridePrevDelay : disruption.prevSectionDelay;

  // Formula as requested:
  // scheduled + disruption delay + 0.4 x previous section delay
  const cascadeDelay = CASCADE_FACTOR * prevDelay;
  const totalDelayMin = Math.round(disruption.delayMin + cascadeDelay);

  const predictedMin = scheduledMin + totalDelayMin;
  const isDisrupted = disruptionType !== 'none';
  const rangeMin = Math.round(BASE_RANGE_MINUTES * (isDisrupted ? DISRUPTION_RANGE_MULTIPLIER : 1.0));

  const lowerMin = predictedMin - rangeMin;
  const upperMin = predictedMin + rangeMin;

  return {
    scheduledEta: scheduledTime,
    predictedEta: minutesToTime(predictedMin),
    delayMinutes: totalDelayMin,
    rangeMinutes: rangeMin,
    rangeLower: minutesToTime(lowerMin),
    rangeUpper: minutesToTime(upperMin),
    rangeText: `${minutesToTime(lowerMin)} – ${minutesToTime(upperMin)}`,
    reason: disruption.reason,
    isDisrupted,
  };
}

/**
 * Calculates predicted ETA given a set of combined NetworkConditions toggles
 */
export function calculateFromNetworkConditions(
  scheduledTime: string,
  conditions: NetworkConditions
): PredictionResult {
  const scheduledMin = timeToMinutes(scheduledTime);
  let directDelay = 0;
  let prevSectionDelay = 0;
  const reasons: string[] = [];

  if (conditions.unscheduledDisruption) {
    directDelay += 14;
    prevSectionDelay += 5;
    reasons.push('Unscheduled signal interlocking failure at section MTJ-KOTA');
  }
  if (conditions.precedingTrainDelayed) {
    directDelay += 8;
    prevSectionDelay += 4;
    reasons.push('Headway spacing cascade from preceding freight rake');
  }
  if (conditions.tsrActive) {
    directDelay += 6;
    prevSectionDelay += 2;
    reasons.push('Temporary speed restriction (45 km/h limit)');
  }
  if (conditions.severeWeather) {
    directDelay += 5;
    prevSectionDelay += 2;
    reasons.push('Severe weather cautionary running');
  }

  const isDisrupted = directDelay > 0;
  const cascadeDelay = CASCADE_FACTOR * prevSectionDelay;
  const totalDelayMin = Math.round(directDelay + cascadeDelay);

  const predictedMin = scheduledMin + totalDelayMin;
  const rangeMin = Math.round(BASE_RANGE_MINUTES * (isDisrupted ? DISRUPTION_RANGE_MULTIPLIER : 1.0));

  const lowerMin = predictedMin - rangeMin;
  const upperMin = predictedMin + rangeMin;

  const reason = isDisrupted
    ? reasons.join(' • ')
    : 'Section clear, line running to scheduled speed';

  return {
    scheduledEta: scheduledTime,
    predictedEta: minutesToTime(predictedMin),
    delayMinutes: totalDelayMin,
    rangeMinutes: rangeMin,
    rangeLower: minutesToTime(lowerMin),
    rangeUpper: minutesToTime(upperMin),
    rangeText: `${minutesToTime(lowerMin)} – ${minutesToTime(upperMin)}`,
    reason,
    isDisrupted,
  };
}

export type RouteStationWithPrediction = StationData & {
  predictedTime: string;
  delayMin: number;
  rangeMin: number;
  rangeLower: string;
  rangeUpper: string;
  windowText: string;
  stateText: 'ON TIME' | 'DELAYED' | 'PASSED';
};

/**
 * Recalculates all downstream stations with cascading delay effect
 */
export function calculateRouteStationsWithConditions(
  stations: StationData[],
  totalDelay: number,
  isDisrupted: boolean
): RouteStationWithPrediction[] {
  return stations.map((st, idx) => {
    if (st.status === 'passed') {
      return {
        ...st,
        predictedTime: st.scheduledTime,
        delayMin: 0,
        rangeMin: 0,
        rangeLower: st.scheduledTime,
        rangeUpper: st.scheduledTime,
        windowText: '±0 min',
        stateText: 'PASSED',
      };
    }

    if (st.status === 'next') {
      // Hero next station (KOTA)
      const delay = Math.round(totalDelay);
      const predMin = st.scheduledMinutes + delay;
      const range = Math.round(BASE_RANGE_MINUTES * (isDisrupted ? DISRUPTION_RANGE_MULTIPLIER : 1.0));
      return {
        ...st,
        predictedTime: minutesToTime(predMin),
        delayMin: delay,
        rangeMin: range,
        rangeLower: minutesToTime(predMin - range),
        rangeUpper: minutesToTime(predMin + range),
        windowText: `±${range} min`,
        stateText: delay > 0 ? 'DELAYED' : 'ON TIME',
      };
    }

    // Downstream stations: delay cascades forward (0.4x cascade propagation)
    const downstreamFactor = Math.max(0.5, 1 - (idx - 2) * 0.15);
    const downstreamDelay = Math.round(totalDelay * downstreamFactor);
    const predMin = st.scheduledMinutes + downstreamDelay;
    const range = Math.round(BASE_RANGE_MINUTES * (isDisrupted ? (DISRUPTION_RANGE_MULTIPLIER * 1.1) : 1.0));

    return {
      ...st,
      predictedTime: minutesToTime(predMin),
      delayMin: downstreamDelay,
      rangeMin: range,
      rangeLower: minutesToTime(predMin - range),
      rangeUpper: minutesToTime(predMin + range),
      windowText: `±${range} min`,
      stateText: downstreamDelay > 0 ? 'DELAYED' : 'ON TIME',
    };
  });
}

/** Legacy support */
export function calculateRouteStations(
  stations: StationData[],
  disruptionType: DisruptionType
): Array<StationData & {
  predictedTime: string;
  delayMin: number;
  rangeMin: number;
  rangeLower: string;
  rangeUpper: string;
  windowText: string;
  stateText: 'ON TIME' | 'DELAYED' | 'PASSED';
}> {
  const result = calculateEta('16:31', disruptionType);
  return calculateRouteStationsWithConditions(stations, result.delayMinutes, result.isDisrupted);
}

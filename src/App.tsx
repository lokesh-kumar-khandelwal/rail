import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TrainServiceBar } from './components/TrainServiceBar';
import { CockpitDashboard } from './components/CockpitDashboard';
import { SystemPerspectivesTabs } from './components/SystemPerspectivesTabs';
import { StationNode } from './components/PredictedArrivalHero';
import { HowItWorksPage } from './components/HowItWorksPage';
import { NetworkConditions, WeatherInfo, LogEntry } from './types';
import { calculateFromNetworkConditions, calculateRouteStationsWithConditions } from './utils/prediction';
import { fetchLiveWeather, CACHED_WEATHER } from './utils/weather';
import { TRAIN_SERVICES, TrainServiceProfile } from './data/trainServices';

export default function App() {
  const [activePage, setActivePage] = useState<'see-it-work' | 'how-it-works'>('see-it-work');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'passenger' | 'station' | 'control'>('cockpit');
  const [selectedTrainId, setSelectedTrainId] = useState<string>('12951');
  const [weather, setWeather] = useState<WeatherInfo>(CACHED_WEATHER);

  // Active selected train profile
  const selectedTrain: TrainServiceProfile = useMemo(() => {
    return TRAIN_SERVICES.find((t) => t.id === selectedTrainId) || TRAIN_SERVICES[0];
  }, [selectedTrainId]);

  // Network condition toggles
  const [conditions, setConditions] = useState<NetworkConditions>({
    severeWeather: false,
    precedingTrainDelayed: false,
    tsrActive: false,
    unscheduledDisruption: false,
  });

  const [isProofRunning, setIsProofRunning] = useState<boolean>(false);

  // Terminal Logs with realistic operational telemetry
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '13:40:49', type: 'info', message: 'Service initialized to 12951 · route context loaded' },
    { id: '2', time: '13:40:49', type: 'info', message: 'Position update received · section RTM–KOTA context refreshed' },
    { id: '3', time: '13:40:50', type: 'success', message: 'Baseline ETA 16:31 computed from timetable & section history' },
    { id: '4', time: '13:40:52', type: 'info', message: 'Open-Meteo telemetry synced · line clear, track adhesion normal' },
    { id: '5', time: '13:40:55', type: 'info', message: 'Downstream station headway chain calculated (cascade factor: 0.4×)' },
    { id: '6', time: '13:40:58', type: 'success', message: 'XGBoost operational inference ready · 30-second cadence lock' },
  ]);

  const addLog = useCallback((message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [
      { id: Math.random().toString(), time: timeStr, type, message },
      ...prev.slice(0, 24),
    ]);
  }, []);

  // Fetch weather on mount
  useEffect(() => {
    fetchLiveWeather().then((data) => setWeather(data));
  }, []);

  // Handle train service selection change
  const handleTrainChange = (newTrainId: string) => {
    const targetTrain = TRAIN_SERVICES.find((t) => t.id === newTrainId);
    if (!targetTrain) return;

    setSelectedTrainId(newTrainId);
    addLog(`Service changed to ${targetTrain.number} · ${targetTrain.name} route context loaded`, 'info');
    addLog(`Telemetry acquired · active section ${targetTrain.activeSection} synchronized`, 'info');
    addLog(`Baseline scheduled arrival at ${targetTrain.heroStationCode}: ${targetTrain.heroScheduledTime}`, 'success');
  };

  // Calculations for current train and current conditions
  const heroPrediction = useMemo(() => {
    return calculateFromNetworkConditions(selectedTrain.heroScheduledTime, conditions);
  }, [selectedTrain.heroScheduledTime, conditions]);

  const routeStationsWithPrediction = useMemo(() => {
    return calculateRouteStationsWithConditions(
      selectedTrain.stations,
      heroPrediction.delayMinutes,
      heroPrediction.isDisrupted
    );
  }, [selectedTrain.stations, heroPrediction.delayMinutes, heroPrediction.isDisrupted]);

  // Train speed calculation dynamically tied to train profile
  const trainSpeed = useMemo(() => {
    const base = selectedTrain.baseCruisingSpeed;
    if (conditions.unscheduledDisruption) return 0;
    if (conditions.tsrActive) return 45;
    if (conditions.precedingTrainDelayed) return Math.round(base * 0.7);
    if (conditions.severeWeather) return Math.round(base * 0.85);
    return base;
  }, [selectedTrain.baseCruisingSpeed, conditions]);

  // Train position percent along track
  const trainPositionPercent = useMemo(() => {
    if (conditions.unscheduledDisruption) return 43;
    if (conditions.precedingTrainDelayed) return 45;
    if (conditions.tsrActive) return 46;
    return 48;
  }, [conditions]);

  // Periodic simulated telemetry heartbeat to ensure active live feed
  useEffect(() => {
    const interval = setInterval(() => {
      addLog(`RTIS GPS sync · ${selectedTrain.number} in ${selectedTrain.activeSection} · speed ${trainSpeed} km/h nominal`, 'info');
    }, 22000);
    return () => clearInterval(interval);
  }, [addLog, selectedTrain.number, selectedTrain.activeSection, trainSpeed]);

  // Handlers for interactive network inputs
  const handleToggleCondition = (key: keyof NetworkConditions) => {
    setConditions((prev) => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };

      if (key === 'severeWeather') {
        addLog(
          nextVal
            ? `Weather alert: Visibility reduced in ${selectedTrain.activeSection} (+5m)`
            : 'Weather alert cleared · line clear',
          nextVal ? 'warn' : 'info'
        );
      } else if (key === 'precedingTrainDelayed') {
        addLog(
          nextVal
            ? `Headway caution: Preceding rake delayed in ${selectedTrain.activeSection} (+8m cascade)`
            : 'Preceding rake cleared · line clear',
          nextVal ? 'warn' : 'info'
        );
      } else if (key === 'tsrActive') {
        addLog(
          nextVal
            ? `TSR active: Speed restricted to 45 km/h on ${selectedTrain.activeSection} curve (+6m)`
            : 'TSR lifted · track restored to line speed',
          nextVal ? 'warn' : 'info'
        );
      }

      return updated;
    });
  };

  const handleInjectUnscheduled = () => {
    setConditions((prev) => {
      const nextVal = !prev.unscheduledDisruption;
      if (nextVal) {
        addLog(
          `CRITICAL: Signal failure in ${selectedTrain.activeSection} (+14m, ±5m range)`,
          'warn'
        );
      } else {
        addLog(`Signal green wave restored on ${selectedTrain.activeSection}`, 'success');
      }
      return { ...prev, unscheduledDisruption: nextVal };
    });
  };

  // 8-second proof automated run on selected train
  const handleStartProof = () => {
    if (isProofRunning) return;
    setIsProofRunning(true);

    // Step 1 (0s): Reset to baseline
    setConditions({
      severeWeather: false,
      precedingTrainDelayed: false,
      tsrActive: false,
      unscheduledDisruption: false,
    });
    addLog(`8-second proof on ${selectedTrain.number} ${selectedTrain.name}: Baseline verified`, 'info');

    // Step 2 (2s): Trigger disruption
    setTimeout(() => {
      setConditions({
        severeWeather: false,
        precedingTrainDelayed: true,
        tsrActive: false,
        unscheduledDisruption: true,
      });
      addLog(`Disruption injected on ${selectedTrain.activeSection}: Signal hold + cascade delay!`, 'warn');
    }, 2000);

    // Step 3 (5.5s): Partial recovery
    setTimeout(() => {
      setConditions({
        severeWeather: false,
        precedingTrainDelayed: false,
        tsrActive: true,
        unscheduledDisruption: false,
      });
      addLog(`Signal cleared: TSR 45 km/h recovery on ${selectedTrain.activeSection}`, 'info');
    }, 5500);

    // Step 4 (8s): Full recovery
    setTimeout(() => {
      setConditions({
        severeWeather: false,
        precedingTrainDelayed: false,
        tsrActive: false,
        unscheduledDisruption: false,
      });
      setIsProofRunning(false);
      addLog(`Proof complete: ${selectedTrain.number} restored to baseline ETA ${selectedTrain.heroScheduledTime}`, 'success');
    }, 8000);
  };

  const heroStations: StationNode[] = useMemo(() => {
    return selectedTrain.stations.map((st) => ({
      code: st.code,
      name: st.name,
      scheduledTime: st.scheduledTime,
      predictedTime: st.scheduledTime,
      status: st.status,
    }));
  }, [selectedTrain.stations]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-[#E8731A]/20 selection:text-[#12386B]">
      {/* Top Navigation Header */}
      <Header activeTab={activePage} onTabChange={setActivePage} />

      {/* Main Content Area */}
      {activePage === 'see-it-work' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
          {/* Train Service Selection & Cadence Strip */}
          <TrainServiceBar
            trains={TRAIN_SERVICES}
            selectedTrain={selectedTrain}
            selectedTrainId={selectedTrainId}
            onSelectTrain={handleTrainChange}
            isProofRunning={isProofRunning}
          />

          {/* Main Cockpit Dashboard: Hero Prediction + Network Inputs + Forecast Table + Engine Activity */}
          <CockpitDashboard
            selectedTrain={selectedTrain}
            heroPrediction={heroPrediction}
            trainSpeed={trainSpeed}
            trainPositionPercent={trainPositionPercent}
            heroStations={heroStations}
            conditions={conditions}
            onToggleCondition={handleToggleCondition}
            onInjectUnscheduled={handleInjectUnscheduled}
            onStartProof={handleStartProof}
            isProofRunning={isProofRunning}
            routeStationsWithPrediction={routeStationsWithPrediction}
            logs={logs}
          />

          {/* Multi-Perspective Operational Tabs (Passenger, Station Display, Control Room) */}
          <SystemPerspectivesTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedTrain={selectedTrain}
            heroPrediction={heroPrediction}
            onSelectTrain={handleTrainChange}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* Architecture Blueprint & How It Works Page */}
          <HowItWorksPage />
        </main>
      )}

      {/* Footer with SIH badge and Open-Meteo Weather */}
      <Footer weather={weather} />
    </div>
  );
}

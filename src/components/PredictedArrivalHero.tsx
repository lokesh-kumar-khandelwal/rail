import React from 'react';
import { Train, MapPin, Gauge, Radio, ArrowRight } from 'lucide-react';
import { PredictionResult } from '../utils/prediction';

export interface StationNode {
  code: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  status: 'passed' | 'approaching' | 'next' | 'downstream';
}

interface PredictedArrivalHeroProps {
  trainNumber?: string;
  trainName?: string;
  trainCategory?: string;
  trainRoute?: string;
  heroStationCode?: string;
  heroStationName?: string;
  activeSection?: string;
  prediction: PredictionResult;
  trainSpeed: number;
  trainPositionPercent: number; // 0 to 100
  stations: StationNode[];
}

export const PredictedArrivalHero: React.FC<PredictedArrivalHeroProps> = ({
  trainNumber = '12951',
  trainName = 'Mumbai Rajdhani Express',
  trainCategory = 'PREMIUM COACHING SERVICE',
  trainRoute = 'Mumbai Central → New Delhi Corridor',
  heroStationCode = 'KOTA',
  heroStationName = 'Kota Junction',
  activeSection = 'RTM–KOTA',
  prediction,
  trainSpeed,
  trainPositionPercent,
  stations,
}) => {
  const isDelayed = prediction.delayMinutes > 0;

  return (
    <div className="w-full bg-white text-slate-800 rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all">
      {/* Top micro-header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#12386B]">
              {trainNumber} · {trainCategory}
            </span>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
              isDelayed
                ? 'bg-amber-50 border-amber-300 text-[#E8731A]'
                : 'bg-emerald-50 border-emerald-300 text-[#1E8A3C]'
            }`}
          >
            {isDelayed ? `DELAYED (+${prediction.delayMinutes}M)` : 'ON TIME'}
          </span>
        </div>

        {/* Main Title & Route */}
        <div className="mt-3">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#12386B]">
            {trainName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {trainRoute}
          </p>
        </div>

        {/* Prediction Display & Comparison Box */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            {/* Big Predicted Arrival & Inline Delta Badge */}
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>PREDICTED ARRIVAL</span>
                <span className="text-slate-300">·</span>
                <span className="text-[#12386B] font-extrabold">{heroStationCode} JN</span>
              </div>

              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span
                  className={`font-mono text-5xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
                    isDelayed ? 'text-[#E8731A]' : 'text-[#12386B]'
                  }`}
                >
                  {prediction.predictedEta}
                </span>

                {/* Direct High-Contrast Delta Badge */}
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wide border shadow-xs ${
                    isDelayed
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <span>{isDelayed ? `+${prediction.delayMinutes} MIN DELAY` : 'ON SCHEDULE'}</span>
                </div>
              </div>

              {/* Confidence interval + Confidence rating metric */}
              <div className="mt-2 text-xs font-mono font-medium text-slate-700 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Prediction window:</span>
                  <strong className={`font-bold ${isDelayed ? 'text-[#E8731A]' : 'text-[#12386B]'}`}>
                    ± {prediction.rangeMinutes} min
                  </strong>
                </div>

                <span className="text-slate-300 hidden sm:inline">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Model confidence:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span className="w-1.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span className="w-1.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span className="w-1.5 h-2.5 rounded-xs bg-emerald-300" />
                    </span>
                    92%
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Mini-Card with high WCAG contrast */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 sm:px-4 flex items-center gap-4 sm:gap-6 shrink-0 shadow-xs">
              {/* Static schedule */}
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  STATIC SCHEDULE
                </span>
                <span className="font-mono text-base font-bold text-slate-900 mt-0.5">
                  {prediction.scheduledEta}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Fixed Baseline
                </span>
              </div>

              {/* Transition Arrow */}
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              {/* Rail Intelligence Forecast */}
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#12386B] font-bold">
                  INTELLIGENCE FORECAST
                </span>
                <span
                  className={`font-mono text-base font-bold mt-0.5 ${
                    isDelayed ? 'text-[#E8731A]' : 'text-[#12386B]'
                  }`}
                >
                  {prediction.predictedEta}
                </span>
                <span
                  className={`text-[11px] font-bold mt-0.5 ${
                    isDelayed ? 'text-[#E8731A]' : 'text-[#1E8A3C]'
                  }`}
                >
                  {isDelayed ? `+${prediction.delayMinutes}m Cascade` : 'Accurate'}
                </span>
              </div>
            </div>
        </div>
      </div>

      {/* Dynamic Station Route Strip Visualizer */}
      <div className="mt-7 pt-4 border-t border-slate-100">
        <div className="relative py-2">
          {/* Upper Track and Circular Nodes Row */}
          <div className="relative h-8 flex items-center px-4 sm:px-6">
            {/* Base Track Line */}
            <div className="absolute top-1/2 left-4 right-4 sm:left-6 sm:right-6 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full" />

            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 h-1.5 bg-[#E8731A] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${trainPositionPercent}%` }}
            />

            {/* Moving Train Marker on Track */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-700 ease-out flex items-center justify-center"
              style={{ left: `${Math.min(92, Math.max(8, trainPositionPercent))}%` }}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md ring-2 ring-white flex items-center justify-center font-bold transition-all ${
                  isDelayed ? 'bg-[#E8731A] text-white animate-bounce' : 'bg-[#12386B] text-white'
                }`}
                title={`Active Position: ${trainName}`}
              >
                <Train className="w-4 h-4" />
              </div>
            </div>

            {/* Circular Node Markers along the track line */}
            <div className="relative w-full flex justify-between items-center z-10">
              {stations.map((st) => {
                const isPassed = st.status === 'passed';
                const isHero = st.code === heroStationCode || st.status === 'next';

                return (
                  <div key={st.code} className="w-12 sm:w-16 flex items-center justify-center">
                    {isPassed ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400 ring-2 ring-white" />
                    ) : isHero ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#12386B] bg-white flex items-center justify-center ring-4 ring-amber-100 shadow-xs">
                        <div className="w-2 h-2 rounded-full bg-[#E8731A]" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 bg-white ring-2 ring-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Station Labels Row Underneath (Station Code + Status/Time) */}
          <div className="w-full flex justify-between items-start mt-2 px-4 sm:px-6">
            {stations.map((st) => {
              const isPassed = st.status === 'passed';
              const isHero = st.code === heroStationCode || st.status === 'next';

              return (
                <div key={st.code} className="w-12 sm:w-16 flex flex-col items-center text-center">
                  {/* Station Code */}
                  <span
                    className={`font-mono text-xs font-bold leading-tight ${
                      isHero
                        ? 'text-[#12386B] underline decoration-[#E8731A] decoration-2 underline-offset-4'
                        : isPassed
                        ? 'text-slate-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {st.code}
                  </span>

                  {/* Time / Status Label */}
                  <span className="text-[10px] font-mono text-slate-500 mt-1 leading-tight">
                    {isPassed ? 'Passed' : st.scheduledTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Telemetry Info Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-700">
          <div className="flex items-center gap-1.5 text-[#12386B] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#E8731A]" />
            <span>Block Section: <strong className="text-slate-900">{activeSection}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">Kinematic speed:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded border text-[11px] ${
                trainSpeed === 0
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : trainSpeed <= 50
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  trainSpeed === 0 ? 'bg-rose-500' : trainSpeed <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {trainSpeed} km/h {trainSpeed === 0 ? '(HALTED)' : trainSpeed <= 50 ? '(CAUTION)' : '(LINE SPEED)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Radio className="w-3.5 h-3.5 text-[#1E8A3C]" />
            <span>RTIS GNSS Fix: <strong className="text-emerald-700">99.8%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

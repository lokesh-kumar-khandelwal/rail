import React from 'react';
import { CloudSun, Info } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { WeatherInfo } from '../types';

interface FooterProps {
  weather: WeatherInfo;
}

export const Footer: React.FC<FooterProps> = ({ weather }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto py-3 px-4 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Footnote & Weather badge */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-2.5 py-1 rounded-md">
            <Info className="w-3.5 h-3.5 text-[#12386B] shrink-0" />
            <span className="font-medium text-slate-700">
              Prototype uses simulated data and illustrative logic. Production model: XGBoost trained on real historical delays.
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-700 font-medium">
            <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Kota: {weather.condition}</span>
            <StatusChip
              status={weather.isLive ? 'LIVE' : 'SIMULATED'}
              label={weather.isLive ? 'LIVE' : 'CACHED'}
            />
          </div>
        </div>

        {/* SIH official tag line */}
        <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md tracking-wide">
          Smart India Hackathon 2026 | PS 26028 | Team ID 134659
        </div>
      </div>
    </footer>
  );
};

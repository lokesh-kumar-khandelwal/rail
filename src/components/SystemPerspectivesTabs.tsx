import React from 'react';
import { Smartphone, MonitorPlay, Activity } from 'lucide-react';
import { PassengerView } from './views/PassengerView';
import { StationDisplayView } from './views/StationDisplayView';
import { ControlRoomView } from './views/ControlRoomView';
import { TrainServiceProfile } from '../data/trainServices';
import { PredictionResult } from '../utils/prediction';

interface SystemPerspectivesTabsProps {
  activeTab: 'cockpit' | 'passenger' | 'station' | 'control';
  onTabChange: (tab: 'cockpit' | 'passenger' | 'station' | 'control') => void;
  selectedTrain: TrainServiceProfile;
  heroPrediction: PredictionResult;
  onSelectTrain: (trainId: string) => void;
}

export const SystemPerspectivesTabs: React.FC<SystemPerspectivesTabsProps> = ({
  activeTab,
  onTabChange,
  selectedTrain,
  heroPrediction,
  onSelectTrain,
}) => {
  return (
    <div className="mt-2 pt-4 border-t border-slate-200">
      <div className="flex flex-wrap items-center justify-between pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#12386B]">
            SYSTEM PERSPECTIVES
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            Inspect end-user delivery surfaces for {selectedTrain.name}
          </span>
        </div>

        {/* View Selector Tabs */}
        <div
          role="tablist"
          aria-label="System delivery views"
          className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/60 text-xs font-mono"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'cockpit'}
            onClick={() => onTabChange('cockpit')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'cockpit'
                ? 'bg-white text-[#12386B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operations Console
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'passenger'}
            onClick={() => onTabChange('passenger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'passenger'
                ? 'bg-white text-[#12386B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Passenger Card</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'station'}
            onClick={() => onTabChange('station')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'station'
                ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Station Board</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'control'}
            onClick={() => onTabChange('control')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'control'
                ? 'bg-white text-[#12386B] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Control Room</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'passenger' && (
        <div className="py-2">
          <PassengerView
            prediction={heroPrediction}
            trainNumber={selectedTrain.number}
            trainName={selectedTrain.name}
            stationName={selectedTrain.heroStationName}
            stationCode={selectedTrain.heroStationCode}
            platform={selectedTrain.heroPlatform}
          />
        </div>
      )}
      {activeTab === 'station' && (
        <div className="py-2">
          <StationDisplayView
            prediction={heroPrediction}
            activeTrainNumber={selectedTrain.number}
            onSelectTrain={onSelectTrain}
          />
        </div>
      )}
      {activeTab === 'control' && (
        <div className="py-2">
          <ControlRoomView
            prediction={heroPrediction}
            activeTrainNumber={selectedTrain.number}
            activeSection={selectedTrain.activeSection}
            onSelectTrain={onSelectTrain}
          />
        </div>
      )}
    </div>
  );
};

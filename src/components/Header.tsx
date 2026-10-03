'use client';

import React from 'react';
import { CarbonCalculation } from '@/types';

interface HeaderProps {
  calculation: CarbonCalculation | null;
  selectedAlternativeCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ calculation }) => {
  const isHighAnomaly = calculation?.baselineComparison.isAnomaly;
  const currentTCO2e = calculation?.totalEmissionsTCO2e || 17.35;

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Monospace System Telemetry & Brand */}
        <div className="flex items-center space-x-3">
          <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono font-medium text-zinc-400 tracking-wider">
            GREENSCOPE.AI // SCOPE-3 ENGINE
          </div>
          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight">
              GreenScope Concierge
            </h1>
            <p className="text-[11px] text-zinc-500 font-normal hidden sm:block">
              Autonomous Scope 3 Carbon Accounting & Supply Chain Procurement
            </p>
          </div>
        </div>

        {/* Right: Monospace Metric Strip */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full font-mono text-xs">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 flex items-center space-x-2">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">BASELINE:</span>
            <span className="text-zinc-100 font-bold">{currentTCO2e} <span className="text-zinc-400 font-normal">tCO2e</span></span>
          </div>

          <div className={`border rounded px-3 py-1.5 flex items-center space-x-2 ${
            isHighAnomaly 
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-300' 
              : 'bg-zinc-900 border-zinc-800 text-emerald-400'
          }`}>
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">RISK_STATUS:</span>
            <span className="font-bold">
              {isHighAnomaly ? 'ANOMALY DETECTED' : 'NOMINAL BASELINE'}
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 flex items-center space-x-2">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">MAX_REDUCTION:</span>
            <span className="text-emerald-400 font-bold">-63.0%</span>
          </div>

        </div>

      </div>
    </header>
  );
};

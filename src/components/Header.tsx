'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingDown, Layers, Zap } from 'lucide-react';
import { CarbonCalculation } from '@/types';

interface HeaderProps {
  calculation: CarbonCalculation | null;
  selectedAlternativeCount: number;
}

export const Header: React.FC<HeaderProps> = ({ calculation }) => {
  const isHighAnomaly = calculation?.baselineComparison.isAnomaly;
  const currentTCO2e = calculation?.totalEmissionsTCO2e || 17.35;

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Status */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            <Zap className="w-5 h-5 text-emerald-100 fill-emerald-100" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                GreenScope Concierge
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Scope 3 AI Concierge
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Autonomous Carbon Accounting & Supply Chain Procurement Agent
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto max-w-full pb-1 md:pb-0">
          
          {/* Carbon Footprint Stat */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-1.5 flex items-center space-x-3 min-w-[140px]">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Current Carbon</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                {currentTCO2e} <span className="text-xs text-slate-400 font-normal">tCO2e</span>
              </div>
            </div>
          </div>

          {/* High-Risk Anomaly Badge */}
          <div className={`bg-slate-900/90 border rounded-lg px-3.5 py-1.5 flex items-center space-x-3 min-w-[150px] ${
            isHighAnomaly ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
          }`}>
            <div className={`p-2 rounded-md ${
              isHighAnomaly ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {isHighAnomaly ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Risk Level</div>
              <div className={`text-sm font-bold flex items-center gap-1 ${
                isHighAnomaly ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isHighAnomaly ? '1 High Anomaly' : 'Normal Baseline'}
              </div>
            </div>
          </div>

          {/* Potential Reduction Stat */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-1.5 flex items-center space-x-3 min-w-[150px]">
            <div className="p-2 rounded-md bg-teal-500/10 text-teal-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Max Reduction</div>
              <div className="text-sm font-bold text-teal-300 flex items-center gap-1">
                -63.0% <span className="text-xs text-slate-400 font-normal">tCO2e</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

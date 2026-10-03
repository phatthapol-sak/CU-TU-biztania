'use client';

import React from 'react';
import { CarbonCalculation } from '@/types';
import { FileText, Network, BarChart2, ShieldAlert } from 'lucide-react';

export type DashboardTab = 'ingestion' | 'graph' | 'actions';

interface HeaderProps {
  calculation: CarbonCalculation | null;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ calculation, activeTab, onTabChange }) => {
  const isHighAnomaly = calculation?.baselineComparison.isAnomaly;
  const currentTCO2e = calculation?.totalEmissionsTCO2e || 17.35;

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      
      {/* Top Telemetry & System Header */}
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-zinc-900">
        
        {/* Left: System Badge & Brand */}
        <div className="flex items-center space-x-3">
          <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono font-semibold text-zinc-400 tracking-wider whitespace-nowrap">
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
        <div className="flex items-center gap-2 overflow-x-auto max-w-full font-mono text-xs whitespace-nowrap">
          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1 flex items-center space-x-2">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">BASELINE:</span>
            <span className="text-zinc-100 font-bold">{currentTCO2e} <span className="text-zinc-400 font-normal">tCO2e</span></span>
          </div>

          <div className={`border rounded px-3 py-1 flex items-center space-x-2 ${
            isHighAnomaly 
              ? 'bg-rose-950/40 border-rose-800 text-rose-300' 
              : 'bg-zinc-900 border-zinc-800 text-emerald-400'
          }`}>
            <span className="text-zinc-400 text-[10px] uppercase font-semibold">RISK_STATUS:</span>
            <span className="font-bold flex items-center gap-1">
              {isHighAnomaly && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
              {isHighAnomaly ? 'ANOMALY DETECTED' : 'NOMINAL BASELINE'}
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1 flex items-center space-x-2">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold">MAX_REDUCTION:</span>
            <span className="text-emerald-400 font-bold">-63.0%</span>
          </div>
        </div>

      </div>

      {/* Sub-Header 3-Tab Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto">
          
          <button
            onClick={() => onTabChange('ingestion')}
            className={`px-3.5 py-1.5 rounded font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ingestion'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>[01. DOCUMENT INGESTION]</span>
          </button>

          <button
            onClick={() => onTabChange('graph')}
            className={`px-3.5 py-1.5 rounded font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-zinc-400" />
            <span>[02. KNOWLEDGE GRAPH]</span>
            {isHighAnomaly && (
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                1 ANOMALY
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('actions')}
            className={`px-3.5 py-1.5 rounded font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'actions'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>[03. SCENARIO ANALYTICS & ACTIONS]</span>
          </button>

        </div>

        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-zinc-500">
          <span>ACTIVE VIEW:</span>
          <span className="text-zinc-300 font-bold uppercase">{activeTab} MODE</span>
        </div>
      </div>

    </header>
  );
};

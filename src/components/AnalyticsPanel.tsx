'use client';

import React, { useState } from 'react';
import { BarChart2, TrendingDown, BookOpen, Layers, Check } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CarbonCalculation, ExtractedDocumentData, OptimizationAlternative } from '@/types';

interface AnalyticsPanelProps {
  extracted: ExtractedDocumentData | null;
  calculation: CarbonCalculation | null;
  alternatives: OptimizationAlternative[];
  selectedAltId: string;
  onSelectAlternative: (id: string) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  extracted,
  calculation,
  alternatives,
  selectedAltId,
  onSelectAlternative
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'emissionFactors'>('comparison');

  if (!extracted || !calculation) return null;

  const activeAlt = alternatives.find(a => a.id === selectedAltId) || alternatives[0];

  // Recharts scenario data
  const chartData = [
    {
      name: 'Current Baseline',
      Emissions_tCO2e: calculation.totalEmissionsTCO2e,
      Cost_USD: extracted.totalCostUSD,
      UnitCost: extracted.unitCostUSD
    },
    {
      name: activeAlt ? `Green Alt: ${activeAlt.supplierName.split(' ')[0]}` : 'Green Alternative',
      Emissions_tCO2e: activeAlt ? activeAlt.estimatedEmissionsTCO2e : 6.42,
      Cost_USD: activeAlt ? activeAlt.totalCostUSD : 18320,
      UnitCost: activeAlt ? activeAlt.unitCostUSD : 2.29
    }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            3 & 4
          </span>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            Pillar 3 & 4: GHG Analytics & Optimization Scenarios
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scenario Simulation
          </button>
          <button
            onClick={() => setActiveTab('emissionFactors')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'emissionFactors'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EF Audit Database
          </button>
        </div>
      </div>

      {activeTab === 'comparison' ? (
        <div className="space-y-4">
          
          {/* Alternative Scenario Selector Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Multi-Objective Green Procurement Options</span>
              <span className="text-[10px] text-teal-400 font-semibold">Select to compare</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {alternatives.map((alt) => {
                const isSelected = alt.id === selectedAltId;
                return (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative(alt.id)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/80 ring-1 ring-teal-500/50 shadow-md shadow-teal-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-white text-[11px] truncate">{alt.supplierName}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">{alt.recommendationScore}% Match</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mb-2">{alt.materialName}</div>

                    {/* Key Tradeoff Chips */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> -{alt.carbonReductionPercentage}% tCO2e
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium text-[10px]">
                        +{alt.costDiffPercentage}% USD
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 text-[10px]">
                        {alt.transportMode.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Emissions & Cost Simulation (Baseline vs Green Scenario)
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Carbon Footprint (tCO2e)
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span> Total Spend ($ USD)
                </span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={11} domain={[0, 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar yAxisId="left" dataKey="Emissions_tCO2e" name="Emissions (tCO2e)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Cost_USD" name="Cost ($ USD)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* Emission Factors Audit Table */
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              GHG Protocol DEFRA / TGO Reference Standards
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Matched Material Emission Factor</div>
              <div className="font-semibold text-emerald-300">{calculation.matchedMaterialEF.name}</div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Factor: <strong className="text-white">{calculation.matchedMaterialEF.factorKgCO2ePerUnit} {calculation.matchedMaterialEF.unit}</strong></span>
                <span className="text-slate-500">Source: {calculation.matchedMaterialEF.source}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Matched Transport Emission Factor</div>
              <div className="font-semibold text-cyan-300">{calculation.matchedTransportEF.name}</div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Factor: <strong className="text-white">{calculation.matchedTransportEF.factorKgCO2ePerUnit} {calculation.matchedTransportEF.unit}</strong></span>
                <span className="text-slate-500">Source: {calculation.matchedTransportEF.source}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

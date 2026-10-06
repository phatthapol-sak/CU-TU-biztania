'use client';

import React, { useState } from 'react';
import { BarChart2, Check, BookOpen } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

  const isTHB = extracted.supplierName.includes('Thai') || extracted.fileName.includes('THAI');
  const currSym = isTHB ? '฿' : '$';
  const currUnit = isTHB ? 'THB' : 'USD';

  const activeAlt = alternatives.find(a => a.id === selectedAltId) || alternatives[0];

  // Recharts scenario data
  const chartData = [
    {
      name: 'Current Baseline',
      Emissions_tCO2e: calculation.totalEmissionsTCO2e,
      Cost_USD: extracted.totalCostUSD,
    },
    {
      name: activeAlt ? activeAlt.supplierName.split(' ')[0] : 'Green Scenario',
      Emissions_tCO2e: activeAlt ? activeAlt.estimatedEmissionsTCO2e : 6.42,
      Cost_USD: activeAlt ? activeAlt.totalCostUSD : 18320,
    }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4 h-full overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold whitespace-nowrap">
            03
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
            Scope 3 GHG Analytics & Optimization Scenarios
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded border border-zinc-800 font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-0.5 rounded transition-all whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Scenario Matrix
          </button>
          <button
            onClick={() => setActiveTab('emissionFactors')}
            className={`px-3 py-0.5 rounded transition-all whitespace-nowrap ${
              activeTab === 'emissionFactors'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EF Audit Table
          </button>
        </div>
      </div>

      {activeTab === 'comparison' ? (
        <div className="space-y-4">
          
          {/* Symmetrical 2-Column Alternative Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 font-semibold uppercase">
              <span>MULTI-OBJECTIVE PROCUREMENT ALTERNATIVES</span>
              <span className="whitespace-nowrap">SELECT TO SIMULATE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {alternatives.map((alt) => {
                const isSelected = alt.id === selectedAltId;
                return (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative(alt.id)}
                    className={`text-left p-3.5 rounded border transition-all text-xs flex flex-col justify-between font-mono ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-zinc-100 text-[11px] truncate" title={alt.supplierName}>{alt.supplierName}</span>
                      {isSelected ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold flex items-center gap-0.5 whitespace-nowrap">
                          <Check className="w-3 h-3" /> {alt.supplierName.includes('EcoPlast') || alt.id.includes('1') ? 'RECOMMENDED' : 'SELECTED'}
                        </span>
                      ) : alt.supplierName.includes('EcoPlast') || alt.id.includes('1') ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold whitespace-nowrap">RECOMMENDED</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold whitespace-nowrap">ALTERNATIVE</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mb-2.5">{alt.materialName}</div>

                    <div className="flex items-center justify-between gap-1 pt-2 border-t border-zinc-800 text-[10px] whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">
                        -{alt.carbonReductionPercentage}% tCO2e
                      </span>
                      <span className="text-zinc-400">
                        +{alt.costDiffPercentage}% {currUnit}
                      </span>
                      <span className="text-zinc-500 truncate" title={`${alt.transportMode} • ${alt.location}`}>
                        {alt.transportMode.split(' ')[0]} • {alt.location ? alt.location.split(',')[0] : 'TH'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Bar Chart Container (Height 260px) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded p-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-zinc-400 uppercase">
                CARBON FOOTPRINT (tCO2e) & TOTAL SPEND ({currUnit}) SCENARIO COMPARISON
              </span>
              <div className="flex items-center space-x-3 text-zinc-400 whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500"></span> Emissions (tCO2e)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-zinc-400"></span> Total Spend ({currSym} {currUnit})
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 15, left: -5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontFamily="monospace" />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={10} fontFamily="monospace" domain={[0, 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" fontSize={10} fontFamily="monospace" domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '2px', fontSize: '11px', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#f4f4f5', fontWeight: 'bold' }}
                  />
                  <Bar yAxisId="left" dataKey="Emissions_tCO2e" name="Emissions (tCO2e)" fill="#10b981" radius={[0, 0, 0, 0]} barSize={36} />
                  <Bar yAxisId="right" dataKey="Cost_USD" name={`Spend (${currSym} ${currUnit})`} fill="#71717a" radius={[0, 0, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* Emission Factors Data Table */
        <div className="bg-zinc-950 border border-zinc-800 rounded p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              GHG PROTOCOL DEFRA / TGO REFERENCE AUDIT DATABASE
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">MATCHED MATERIAL EMISSION FACTOR</div>
              <div className="font-bold text-zinc-200">{calculation.matchedMaterialEF.name}</div>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-800">
                <span className="text-zinc-400">FACTOR: <strong className="text-emerald-400 font-bold whitespace-nowrap">{calculation.matchedMaterialEF.factorKgCO2ePerUnit} {calculation.matchedMaterialEF.unit}</strong></span>
                <span className="text-zinc-500 font-mono">SOURCE: {calculation.matchedMaterialEF.source}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 rounded border border-zinc-800 space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">MATCHED TRANSPORT EMISSION FACTOR</div>
              <div className="font-bold text-zinc-200">{calculation.matchedTransportEF.name}</div>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-800">
                <span className="text-zinc-400">FACTOR: <strong className="text-emerald-400 font-bold whitespace-nowrap">{calculation.matchedTransportEF.factorKgCO2ePerUnit} {calculation.matchedTransportEF.unit}</strong></span>
                <span className="text-zinc-500 font-mono">SOURCE: {calculation.matchedTransportEF.source}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

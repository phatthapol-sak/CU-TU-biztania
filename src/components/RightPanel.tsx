'use client';

import React from 'react';
import { Bot, FileCheck, Mail, Database, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ActivityLogItem, CarbonCalculation, ExtractedDocumentData, OptimizationAlternative } from '@/types';

interface RightPanelProps {
  extracted: ExtractedDocumentData | null;
  calculation: CarbonCalculation | null;
  selectedAlternative: OptimizationAlternative | null;
  activityLogs: ActivityLogItem[];
  onOpenRFQModal: () => void;
  onOpenEmailModal: () => void;
  onOpenERPModal: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  extracted,
  calculation,
  selectedAlternative,
  activityLogs,
  onOpenRFQModal,
  onOpenEmailModal,
  onOpenERPModal
}) => {
  if (!extracted || !calculation) return null;

  const isAnomaly = calculation.baselineComparison.isAnomaly;
  const alt = selectedAlternative;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4 h-full overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="flex h-5 px-2 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold whitespace-nowrap tracking-tight flex-shrink-0">
            04 & 05
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Bot className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            Copilot Diagnosis & Autonomous Actions
          </h2>
        </div>
        <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
          HUMAN-IN-THE-LOOP
        </span>
      </div>

      {/* Restrained Technical Diagnosis Card */}
      <div className={`p-4 rounded border text-xs font-mono space-y-3 ${
        isAnomaly
          ? 'bg-rose-950/20 border-rose-800 text-rose-200'
          : 'bg-zinc-950 border-zinc-800 text-zinc-200'
      }`}>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            {isAnomaly ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-bold uppercase tracking-wider text-xs whitespace-nowrap">
              {isAnomaly ? 'CARBON ANOMALY DIAGNOSIS' : 'NOMINAL BASELINE AUDIT'}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap flex-shrink-0 ${
            isAnomaly ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {calculation.baselineComparison.anomalySeverity} SEVERITY
          </span>
        </div>

        <p className="text-xs font-sans leading-relaxed text-zinc-300">
          {calculation.baselineComparison.anomalyReason}
        </p>

        {/* Symmetrical 3-Column Trade-off Box */}
        {alt && (
          <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase font-mono">
              <span>RECOMMENDED TRADE-OFF</span>
              <span className="text-zinc-200 font-sans font-bold">{alt.supplierName.split(' ')[0]}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1.5 border-t border-zinc-800 font-mono">
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block">CARBON</span>
                <span className="font-bold text-emerald-400 text-xs">-{alt.carbonReductionPercentage}%</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block">COST</span>
                <span className="font-bold text-zinc-300 text-xs">+{alt.costDiffPercentage}%</span>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500 block">LEAD TIME</span>
                <span className="font-bold text-zinc-300 text-xs">+{alt.leadTimeDays - 3}d</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Action Row Buttons */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase">
          <span>AUTONOMOUS ACTION CENTER</span>
          <span className="whitespace-nowrap">HUMAN APPROVAL</span>
        </div>

        <div className="space-y-2">
          {/* Action 1: Green RFQ Generator */}
          <button
            onClick={onOpenRFQModal}
            className="w-full text-left p-3 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <FileCheck className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 flex-shrink-0" />
              <div>
                <div className="font-semibold text-zinc-200 text-xs">Generate Green RFQ Document</div>
                <div className="text-[10px] text-zinc-500 font-sans">Formal request to {alt?.supplierName || 'Green Supplier'}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* Action 2: Supplier Engagement Negotiation Draft */}
          <button
            onClick={onOpenEmailModal}
            className="w-full text-left p-3 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 flex-shrink-0" />
              <div>
                <div className="font-semibold text-zinc-200 text-xs">Draft Supplier Negotiation Email</div>
                <div className="text-[10px] text-zinc-500 font-sans">Request CFP certification from {extracted.supplierName}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>

          {/* Action 3: Mock ERP Webhook Dispatcher */}
          <button
            onClick={onOpenERPModal}
            className="w-full text-left p-3 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 flex-shrink-0" />
              <div>
                <div className="font-semibold text-zinc-200 text-xs">Dispatch ERP Webhook & Audit Log</div>
                <div className="text-[10px] text-zinc-500 font-sans">Sync decision directly with SAP / NetSuite PO system</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Terminal-Style Concierge Activity Feed */}
      <div className="flex-1 space-y-1.5 flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase">
          <span>CONCIERGE ACTIVITY FEED</span>
          <span className="text-zinc-500 text-[10px] whitespace-nowrap">[STREAM_ACTIVE]</span>
        </div>

        <div className="flex-1 min-h-[180px] max-h-[260px] bg-zinc-950 border border-zinc-800 rounded p-3 overflow-y-auto space-y-1.5 text-[10px] leading-relaxed">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 border-b border-zinc-900/80 pb-1.5 last:border-0">
              <span className="text-zinc-600 shrink-0 whitespace-nowrap">{log.timestamp}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-zinc-400 mr-1.5 whitespace-nowrap">
                  [{log.pillar.toUpperCase()}]
                </span>
                <span className="text-zinc-300 font-sans">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

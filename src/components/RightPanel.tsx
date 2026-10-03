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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col space-y-4 h-full overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold">
            04 & 05
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-zinc-400" />
            Copilot Diagnosis & Autonomous Actions
          </h2>
        </div>
        <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
          HUMAN-IN-THE-LOOP
        </span>
      </div>

      {/* Restrained Technical Diagnosis Card */}
      <div className={`p-3 rounded border text-xs font-mono space-y-2 ${
        isAnomaly
          ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
          : 'bg-zinc-950 border-zinc-800 text-zinc-200'
      }`}>
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center space-x-2">
            {isAnomaly ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-bold uppercase tracking-wider">
              {isAnomaly ? 'CARBON ANOMALY DIAGNOSIS' : 'NOMINAL BASELINE AUDIT'}
            </span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            isAnomaly ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {calculation.baselineComparison.anomalySeverity}
          </span>
        </div>

        <p className="text-[11px] font-sans leading-relaxed text-zinc-300">
          {calculation.baselineComparison.anomalyReason}
        </p>

        {/* Symmetrical 3-Column Trade-off Box */}
        {alt && (
          <div className="bg-zinc-900 border border-zinc-800 rounded p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>RECOMMENDED TRADE-OFF</span>
              <span className="text-zinc-200">{alt.supplierName.split(' ')[0]}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1 border-t border-zinc-800">
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">CARBON</span>
                <span className="font-bold text-emerald-400">-{alt.carbonReductionPercentage}%</span>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">COST</span>
                <span className="font-bold text-zinc-300">+{alt.costDiffPercentage}%</span>
              </div>
              <div className="bg-zinc-950 p-1.5 rounded border border-zinc-800">
                <span className="text-zinc-500 block">LEAD TIME</span>
                <span className="font-bold text-zinc-300">+{alt.leadTimeDays - 3}d</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Action Row Buttons (Clean, Uniform List) */}
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase">
          <span>AUTONOMOUS ACTION CENTER</span>
          <span>HUMAN APPROVAL</span>
        </div>

        <div className="space-y-1.5">
          {/* Action 1: Green RFQ Generator */}
          <button
            onClick={onOpenRFQModal}
            className="w-full text-left p-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5">
              <FileCheck className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
              <div>
                <div className="font-semibold text-zinc-200 text-[11px]">Generate Green RFQ Document</div>
                <div className="text-[10px] text-zinc-500">Formal request to {alt?.supplierName || 'Green Supplier'}</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Action 2: Supplier Engagement Negotiation Draft */}
          <button
            onClick={onOpenEmailModal}
            className="w-full text-left p-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
              <div>
                <div className="font-semibold text-zinc-200 text-[11px]">Draft Negotiation Email</div>
                <div className="text-[10px] text-zinc-500">Request CFP certification from {extracted.supplierName}</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Action 3: Mock ERP Webhook Dispatcher */}
          <button
            onClick={onOpenERPModal}
            className="w-full text-left p-2.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5">
              <Database className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
              <div>
                <div className="font-semibold text-zinc-200 text-[11px]">Dispatch ERP Webhook & Audit Log</div>
                <div className="text-[10px] text-zinc-500">Sync decision directly with SAP / NetSuite PO system</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Terminal-Style Concierge Activity Feed */}
      <div className="flex-1 space-y-1.5 flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase">
          <span>CONCIERGE ACTIVITY FEED</span>
          <span className="text-zinc-500">[STREAM_ACTIVE]</span>
        </div>

        <div className="flex-1 min-h-[160px] max-h-[220px] bg-zinc-950 border border-zinc-800 rounded p-2.5 overflow-y-auto space-y-1.5 text-[10px] leading-relaxed">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 border-b border-zinc-900/80 pb-1 last:border-0">
              <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
              <div className="flex-1">
                <span className="font-bold text-zinc-400 mr-1.5">
                  [{log.pillar.toUpperCase()}]
                </span>
                <span className="text-zinc-300">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

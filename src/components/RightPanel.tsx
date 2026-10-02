'use client';

import React from 'react';
import { Bot, AlertTriangle, FileCheck, Mail, Database, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-5 h-full overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            4 & 5
          </span>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-emerald-400" />
            Pillar 4 & 5: Concierge Copilot & Actions
          </h2>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          AI Agent Ready
        </span>
      </div>

      {/* High-Risk Insight Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        isAnomaly
          ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/20'
          : 'bg-emerald-950/30 border-emerald-500/40'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isAnomaly ? (
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Reasoning Diagnosis</span>
              <h3 className={`text-xs font-bold ${isAnomaly ? 'text-rose-300' : 'text-emerald-300'}`}>
                {isAnomaly ? 'High Scope 3 Carbon Anomaly Flagged' : 'Normal Baseline Footprint'}
              </h3>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            isAnomaly ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {calculation.baselineComparison.anomalySeverity}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {calculation.baselineComparison.anomalyReason}
        </p>

        {/* Trade-off Optimization Summary Box */}
        {alt && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Recommended Action Trade-off
              </span>
              <span className="text-teal-400 font-bold">{alt.supplierName.split(' ')[0]}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800">
              <div className="bg-emerald-950/60 p-2 rounded border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block">Carbon Delta</span>
                <span className="font-bold text-emerald-300 text-xs">-{alt.carbonReductionPercentage}%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cost Delta</span>
                <span className="font-bold text-amber-300 text-xs">+{alt.costDiffPercentage}%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Lead Time</span>
                <span className="font-bold text-slate-200 text-xs">+{alt.leadTimeDays - 3} Days</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Action Center */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Pillar 5: Autonomous Action Center
          </label>
          <span className="text-[10px] text-emerald-400 font-semibold">Human-in-the-Loop</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          
          {/* Action 1: Green RFQ Generator */}
          <button
            onClick={onOpenRFQModal}
            className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between group shadow-sm hover:shadow-emerald-950/50"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                  Generate Green RFQ Document
                </div>
                <div className="text-[11px] text-emerald-200/70">Formal request to {alt?.supplierName || 'Green Supplier'}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 2: Supplier Engagement Negotiation Draft */}
          <button
            onClick={onOpenEmailModal}
            className="w-full text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-xs">Draft Negotiation Email</div>
                <div className="text-[11px] text-slate-400">Request CFP certification from {extracted.supplierName}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 3: Mock ERP Webhook Dispatcher */}
          <button
            onClick={onOpenERPModal}
            className="w-full text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white text-xs">Dispatch ERP Webhook & Audit Log</div>
                <div className="text-[11px] text-slate-400">Sync decision directly with SAP / NetSuite PO system</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>

      {/* Live Concierge Activity Log Feed */}
      <div className="flex-1 space-y-2 flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Concierge Activity Live Feed</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </label>

        <div className="flex-1 min-h-[180px] max-h-[240px] bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 overflow-y-auto space-y-2 font-mono text-[11px]">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 border-b border-slate-900 pb-1.5 last:border-0">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <div className="flex-1">
                <span className={`font-semibold mr-1.5 ${
                  log.pillar === 'Understand' ? 'text-emerald-400' :
                  log.pillar === 'Remember' ? 'text-cyan-400' :
                  log.pillar === 'Retrieve' ? 'text-purple-400' :
                  log.pillar === 'Reason' ? 'text-amber-400' : 'text-teal-300'
                }`}>
                  [{log.pillar}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

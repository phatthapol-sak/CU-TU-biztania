'use client';

import React, { useState } from 'react';
import { X, Check, Send, FileCheck, Mail, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExtractedDocumentData, OptimizationAlternative, ERPActionLog } from '@/types';

interface ActionModalsProps {
  modalType: 'RFQ' | 'EMAIL' | 'ERP' | null;
  onClose: () => void;
  extracted: ExtractedDocumentData | null;
  selectedAlternative: OptimizationAlternative | null;
  onAddAuditLog: (log: ERPActionLog) => void;
  auditLogs: ERPActionLog[];
  showToast: (msg: string) => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  modalType,
  onClose,
  extracted,
  selectedAlternative,
  onAddAuditLog,
  auditLogs,
  showToast
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [rfqNote, setRfqNote] = useState('Expedite dispatch via Electrified Freight rail terminal.');
  const [emailSubject, setEmailSubject] = useState(`Urgent: Scope 3 Carbon Footprint Certification & Greener PP Alternatives - PO #${extracted?.poNumber || '99412'}`);

  if (!modalType || !extracted || !selectedAlternative) return null;

  const alt = selectedAlternative;

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback ignore if confetti canvas context fails
    }
  };

  // RFQ Dispatch Handler
  const handleDispatchRFQ = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      triggerConfetti();
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'GREEN_RFQ',
        targetSupplier: alt.supplierName,
        status: 'DISPATCHED',
        details: `Green RFQ issued for ${extracted.quantity.toLocaleString()} kg of ${alt.materialName} via ${alt.transportMode}. Projected carbon saving: ${alt.carbonReductionPercentage}%.`
      });
      showToast(`✅ Green RFQ successfully dispatched to ${alt.supplierName}!`);
      onClose();
    }, 1200);
  };

  // Email Dispatch Handler
  const handleDispatchEmail = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      triggerConfetti();
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'SUPPLIER_NEGOTIATION',
        targetSupplier: extracted.supplierName,
        status: 'DISPATCHED',
        details: `Diplomatic CFP request email dispatched to ${extracted.supplierName}. Requested ISO 14064 certification and price-matching on recycled rPP.`
      });
      showToast(`✉️ Negotiation email dispatched to ${extracted.supplierName}!`);
      onClose();
    }, 1200);
  };

  // ERP Webhook Dispatch Handler
  const handleDispatchERP = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      triggerConfetti();
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'ERP_WEBHOOK',
        targetSupplier: alt.supplierName,
        status: 'DISPATCHED',
        details: `SAP S/4HANA Purchase Order PO-99412 updated with low-carbon line item SUP-004. Audit log hash generated.`
      });
      showToast(`🚀 Webhook successfully synced with SAP / NetSuite ERP!`);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            {modalType === 'RFQ' && <FileCheck className="w-6 h-6" />}
            {modalType === 'EMAIL' && <Mail className="w-6 h-6" />}
            {modalType === 'ERP' && <Database className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pillar 5: Autonomous Action</span>
            <h2 className="text-lg font-bold text-white">
              {modalType === 'RFQ' && 'Generate & Dispatch Green RFQ Document'}
              {modalType === 'EMAIL' && 'Draft Supplier Negotiation Email'}
              {modalType === 'ERP' && 'Simulate SAP ERP Webhook Integration'}
            </h2>
          </div>
        </div>

        {/* RFQ MODAL CONTENT */}
        {modalType === 'RFQ' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2 font-sans font-bold text-white text-sm">
                <span>REQUEST FOR QUOTATION (RFQ) #RFQ-GREEN-2026-09</span>
                <span className="text-emerald-400">GreenScope AI Concierge</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div><strong>Target Supplier:</strong> {alt.supplierName}</div>
                <div><strong>Material Spec:</strong> {alt.materialName}</div>
                <div><strong>Required Quantity:</strong> {extracted.quantity.toLocaleString()} kg</div>
                <div><strong>Logistics Mode:</strong> {alt.transportMode}</div>
                <div><strong>Target Unit Price:</strong> ${alt.unitCostUSD} / kg</div>
                <div><strong>Required Certification:</strong> {alt.certifications.join(', ')}</div>
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="font-semibold text-slate-300">Additional Instructions for Supplier:</label>
              <textarea
                value={rfqNote}
                onChange={(e) => setRfqNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 font-sans">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchRFQ}
                disabled={isDispatching}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950"
              >
                {isDispatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Dispatching RFQ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Approve & Dispatch RFQ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* EMAIL MODAL CONTENT */}
        {modalType === 'EMAIL' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5 font-sans">
              <label className="font-semibold text-slate-300">Subject:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono space-y-3 leading-relaxed text-slate-300">
              <p>Dear Procurement Team at {extracted.supplierName},</p>
              <p>
                In alignment with GreenScope Corp's 2026 Scope 3 Decarbonization Targets, we recently audited invoice {extracted.documentId} for {extracted.quantity.toLocaleString()} kg of {extracted.materialName}.
              </p>
              <p>
                Our AI Carbon Concierge identified a Scope 3 footprint spike of <strong>{extracted.totalCostUSD} USD / high tCO2e intensity</strong>. To maintain our Tier-1 preferred vendor status, we kindly request:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-emerald-300">
                <li>An updated Product Carbon Footprint (PCF) ISO 14067 certificate.</li>
                <li>Option to transition line items to Recycled PP (rPP) resin or offer price parity.</li>
              </ol>
              <p>We value our partnership and look forward to your response within 5 business days.</p>
              <p>Best regards,<br />GreenScope Autonomous Procurement Concierge</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 font-sans">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchEmail}
                disabled={isDispatching}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950"
              >
                {isDispatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Draft...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Approve & Dispatch Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ERP MODAL CONTENT */}
        {modalType === 'ERP' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">SAP S/4HANA / NetSuite Webhook Payload Preview:</span>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono overflow-x-auto text-[11px] leading-relaxed">
{JSON.stringify(
  {
    event: "PURCHASE_ORDER.SCOPE3_OPTIMIZED",
    timestamp: new Date().toISOString(),
    poNumber: extracted.poNumber,
    originalSupplier: extracted.supplierName,
    recommendedSupplier: alt.supplierName,
    allocatedMaterial: alt.materialName,
    allocatedLogistics: alt.transportMode,
    projectedCarbonReductionPct: alt.carbonReductionPercentage,
    auditHash: "0x8f92a4bc81d720f12"
  },
  null,
  2
)}
              </pre>
            </div>

            {/* Audit Log Trail Table */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Recent Dispatch Audit Trail:</span>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2">Time</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Target</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500">No actions dispatched yet.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-2 font-mono text-slate-500">{log.timestamp}</td>
                          <td className="p-2 font-bold text-emerald-400">{log.actionType}</td>
                          <td className="p-2">{log.targetSupplier}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold text-[10px]">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 font-sans">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleDispatchERP}
                disabled={isDispatching}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-purple-950"
              >
                {isDispatching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Triggering Webhook...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Trigger ERP Webhook Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

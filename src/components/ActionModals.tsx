'use client';

import React, { useState } from 'react';
import { X, Send, FileCheck, Mail, Database } from 'lucide-react';
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

  // RFQ Dispatch Handler
  const handleDispatchRFQ = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'GREEN_RFQ',
        targetSupplier: alt.supplierName,
        status: 'DISPATCHED',
        details: `Green RFQ issued for ${extracted.quantity.toLocaleString()} kg of ${alt.materialName} via ${alt.transportMode}. Projected carbon saving: ${alt.carbonReductionPercentage}%.`
      });
      showToast(`[AUDIT_LOG_COMMITTED]: Green RFQ dispatched to ${alt.supplierName}`);
      onClose();
    }, 800);
  };

  // Email Dispatch Handler
  const handleDispatchEmail = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'SUPPLIER_NEGOTIATION',
        targetSupplier: extracted.supplierName,
        status: 'DISPATCHED',
        details: `Diplomatic CFP request email dispatched to ${extracted.supplierName}. Requested ISO 14064 certification and price-matching on recycled rPP.`
      });
      showToast(`[EMAIL_DISPATCHED]: Negotiation request sent to ${extracted.supplierName}`);
      onClose();
    }, 800);
  };

  // ERP Webhook Dispatch Handler
  const handleDispatchERP = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      onAddAuditLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actionType: 'ERP_WEBHOOK',
        targetSupplier: alt.supplierName,
        status: 'DISPATCHED',
        details: `SAP S/4HANA Purchase Order PO-99412 updated with low-carbon line item SUP-004. Audit log hash generated.`
      });
      showToast(`[SAP_WEBHOOK_ACK 200 OK]: Purchase order PO-99412 synchronized`);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full p-5 space-y-4 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded bg-zinc-950 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">
            {modalType === 'RFQ' && <FileCheck className="w-5 h-5" />}
            {modalType === 'EMAIL' && <Mail className="w-5 h-5" />}
            {modalType === 'ERP' && <Database className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">PILLAR 05 // EXECUTIVE CONTROL</span>
            <h2 className="text-sm font-bold text-zinc-100 uppercase">
              {modalType === 'RFQ' && 'REQUEST FOR QUOTATION (RFQ) DISPATCH'}
              {modalType === 'EMAIL' && 'SUPPLIER CFP NEGOTIATION DRAFT'}
              {modalType === 'ERP' && 'SAP S/4HANA WEBHOOK INTEGRATION'}
            </h2>
          </div>
        </div>

        {/* RFQ MODAL CONTENT */}
        {modalType === 'RFQ' && (
          <div className="space-y-4 text-xs">
            <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-zinc-800 pb-2 font-bold text-zinc-200">
                <span>FORMAL RFQ SPECIFICATION #RFQ-2026-GREEN-09</span>
                <span className="text-zinc-400 font-mono">GREENSCOPE.AI</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                <div><span className="text-zinc-500">TARGET_SUPPLIER:</span> {alt.supplierName}</div>
                <div><span className="text-zinc-500">MATERIAL_SPEC:</span> {alt.materialName}</div>
                <div><span className="text-zinc-500">REQUIRED_QTY:</span> {extracted.quantity.toLocaleString()} kg</div>
                <div><span className="text-zinc-500">LOGISTICS_MODE:</span> {alt.transportMode}</div>
                <div><span className="text-zinc-500">TARGET_UNIT_PRICE:</span> ฿{alt.unitCostUSD} / kg</div>
                <div><span className="text-zinc-500">LOCATION:</span> {alt.location}</div>
                <div className="col-span-2"><span className="text-zinc-500">CERTIFICATION:</span> {alt.certifications.join(', ')}</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-400 text-[10px] uppercase">OPERATIONAL INSTRUCTIONS / REMARKS:</label>
              <textarea
                value={rfqNote}
                onChange={(e) => setRfqNote(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 focus:border-zinc-500 focus:outline-none text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800 text-xs">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-semibold hover:text-zinc-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleDispatchRFQ}
                disabled={isDispatching}
                className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold flex items-center space-x-2 transition-all"
              >
                {isDispatching ? (
                  <span>[DISPATCHING...]</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>APPROVE & DISPATCH RFQ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* EMAIL MODAL CONTENT */}
        {modalType === 'EMAIL' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-400 text-[10px] uppercase">SUBJECT LINE:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 text-xs focus:border-zinc-500 focus:outline-none font-mono"
              />
            </div>

            <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2.5 text-zinc-300 text-[11px] leading-relaxed">
              <p>Dear Procurement Team at {extracted.supplierName},</p>
              <p>
                In alignment with GreenScope Corp's 2026 Scope 3 Decarbonization Targets, we recently audited invoice {extracted.documentId} for {extracted.quantity.toLocaleString()} kg of {extracted.materialName}.
              </p>
              <p>
                Our AI Carbon Concierge identified a Scope 3 footprint spike of <strong>฿{extracted.totalCostUSD.toLocaleString()} THB / high tCO2e intensity</strong>. To maintain Tier-1 status, we request:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-zinc-200">
                <li>Updated Product Carbon Footprint (PCF) ISO 14067 certificate.</li>
                <li>Option to transition line items to Recycled PP (rPP) resin or offer price parity.</li>
              </ol>
              <p>Best regards,<br />GreenScope Procurement Concierge</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800 text-xs">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-semibold hover:text-zinc-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleDispatchEmail}
                disabled={isDispatching}
                className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold flex items-center space-x-2 transition-all"
              >
                {isDispatching ? (
                  <span>[SENDING_EMAIL...]</span>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>APPROVE & DISPATCH EMAIL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ERP MODAL CONTENT */}
        {modalType === 'ERP' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-zinc-400 text-[10px] uppercase">SAP S/4HANA WEBHOOK PAYLOAD [POST /api/v1/erp/procurement/orders]:</span>
              <pre className="bg-zinc-950 p-3 rounded border border-zinc-800 text-zinc-300 font-mono overflow-x-auto text-[10px] leading-relaxed">
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
    auditHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`
  },
  null,
  2
)}
              </pre>
            </div>

            {/* Audit Log Trail Table */}
            <div className="space-y-1">
              <span className="font-semibold text-zinc-400 text-[10px] uppercase">AUDIT LOG TRAIL:</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded overflow-hidden max-h-32 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-1.5">TIMESTAMP</th>
                      <th className="p-1.5">ACTION</th>
                      <th className="p-1.5">TARGET</th>
                      <th className="p-1.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-2 text-center text-zinc-500">No actions recorded in audit log.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-1.5 font-mono text-zinc-500">{log.timestamp}</td>
                          <td className="p-1.5 font-bold text-zinc-200">{log.actionType}</td>
                          <td className="p-1.5">{log.targetSupplier}</td>
                          <td className="p-1.5">
                            <span className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold text-[9px]">
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

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800 text-xs">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-semibold hover:text-zinc-200"
              >
                CLOSE
              </button>
              <button
                onClick={handleDispatchERP}
                disabled={isDispatching}
                className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold flex items-center space-x-2 transition-all"
              >
                {isDispatching ? (
                  <span>[SYNCING_ERP...]</span>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>SYNC ERP WEBHOOK</span>
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

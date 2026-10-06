'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Header, DashboardTab } from '@/components/Header';
import { LeftPanel } from '@/components/LeftPanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { RightPanel } from '@/components/RightPanel';
import { ActionModals } from '@/components/ActionModals';
import { DocumentSwitcher } from '@/components/DocumentSwitcher';
import { ExtractedDocumentData, CarbonCalculation, OptimizationAlternative, ActivityLogItem, ERPActionLog } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';
import { calculateScope3Emissions, generateGreenAlternatives } from '@/lib/calculator';

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4";

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('ingestion');

  // Registered Document List & Active Document Context
  const [documentList, setDocumentList] = useState<ExtractedDocumentData[]>(
    MOCK_DOCUMENT_PRESETS.map(p => p.extracted)
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(
    MOCK_DOCUMENT_PRESETS[0].extracted.documentId
  );
  const [activePresetId, setActivePresetId] = useState<string>('doc-preset-1');

  // Staged Upload & Human-in-the-Loop Commit State
  const [stagedExtracted, setStagedExtracted] = useState<ExtractedDocumentData | null>(
    MOCK_DOCUMENT_PRESETS[0].extracted
  );
  const [isCommitted, setIsCommitted] = useState<boolean>(true);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  // Active Committed Calculation & Alternatives
  const [calculation, setCalculation] = useState<CarbonCalculation | null>(null);
  const [alternatives, setAlternatives] = useState<OptimizationAlternative[]>([]);
  const [selectedAltId, setSelectedAltId] = useState<string>('alt-opt-1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractionSource, setExtractionSource] = useState<'Gemini Vision AI' | 'Preset Mock Engine'>('Preset Mock Engine');

  const [activeModal, setActiveModal] = useState<'RFQ' | 'EMAIL' | 'ERP' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sheet Sync State
  const [isSheetConnected, setIsSheetConnected] = useState<boolean>(false);

  // Activity Feed & Audit Trail State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ERPActionLog[]>([]);

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to add activity log entry
  const addLog = useCallback((pillar: ActivityLogItem['pillar'], message: string, status: ActivityLogItem['status'] = 'info') => {
    const newEntry: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      pillar,
      message,
      status
    };
    setActivityLogs(prev => [newEntry, ...prev]);
  }, []);

  // Active document currently committed to views
  const currentCommittedDoc = documentList.find(d => d.documentId === selectedDocumentId) || documentList[0] || stagedExtracted;

  // ดึงข้อมูลสดจาก Google Sheet มาแปลงเป็นทางเลือก (Alternatives) สำหรับเอกสารที่เลือก
  const fetchGoogleSheetData = useCallback(async (baseExtracted: ExtractedDocumentData, calc: CarbonCalculation) => {
    try {
      addLog('Retrieve', 'Connecting to Google Sheets ERP Database (Direct Export)...', 'info');
      
      const res = await fetch(`/api/sheets?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      const csvText = await res.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const rows = results.data;
          if (rows && rows.length > 0) {
            setIsSheetConnected(true);
            addLog('Retrieve', `Synced ${rows.length} records directly from Google Sheets`, 'success');

            const planARow = rows.find((r: any) => r.plan_type === 'Plan A' || r.material_id === 'MAT-001');
            const sheetBasePrice = planARow ? Number(planARow.price_per_kg) : null;
            const sheetBaseEF = planARow ? Number(planARow.emission_factor) : null;

            // Map Staged PO rows from Google Sheet into registered documentList
            const sheetDocs: ExtractedDocumentData[] = rows
              .filter((r: any) => r.plan_type === 'Staged PO')
              .map((r: any, idx: number) => {
                const poMatch = r.recommendation?.match(/PO:\s*([^|\s]+)/);
                const poNumber = poMatch ? poMatch[1] : (r.po_number || `PO-SHEET-${idx + 1}`);
                const qty = Number(r.quantity) || 2000;
                const dist = Number(r.distance_km) || 120;
                const unitPrice = Number(r.price_per_kg) || 50;
                return {
                  documentId: r.document_id || r.material_id || `DOC-SHEET-${idx + 1}`,
                  documentType: 'Invoice' as const,
                  fileName: `${poNumber}.pdf`,
                  supplierId: r.material_id || `SUP-00${idx + 1}`,
                  supplierName: r.supplier_name || 'Recorded Supplier',
                  materialName: r.material_name || 'Standard Material',
                  materialCategory: r.material_category || 'Plastics & Polymers',
                  quantity: qty,
                  unit: r.unit || 'kg',
                  transportMode: (r.transport_mode as ExtractedDocumentData['transportMode'])
                    || (r.recommendation?.includes('Rail') ? 'Electric Rail Freight' : 'Road Diesel Freight'),
                  distanceKm: dist,
                  totalCostUSD: Number(r.total_cost) || (unitPrice * qty),
                  unitCostUSD: unitPrice,
                  issueDate: r.issue_date || '2026-09-28',
                  poNumber: poNumber
                };
              });

            if (sheetDocs.length > 0) {
              setDocumentList(prev => {
                const combined = [...prev, ...sheetDocs, ...MOCK_DOCUMENT_PRESETS.map(p => p.extracted)];
                return Array.from(new Map(combined.map(item => [item.documentId, item])).values());
              });
            }

            const basePrice = sheetBasePrice || baseExtracted.unitCostUSD || 50;
            const baseEF = sheetBaseEF || calc.matchedMaterialEF?.factorKgCO2ePerUnit || 1.63;
            const qty = baseExtracted.quantity || 2000;
            const distanceKm = baseExtracted.distanceKm || 120;

            const dynamicOpts: OptimizationAlternative[] = rows
              .filter((r: any) => r.plan_type && r.plan_type !== 'Plan A' && r.plan_type !== 'Staged PO')
              .map((r: any, idx: number) => {
                const altEF = Number(r.emission_factor) || 0.5;
                const altPrice = Number(r.price_per_kg) || 58;
                const leadTimeDays = Number(r.lead_time_days) || 3;

                const reduction = Math.max(0, Math.round(((baseEF - altEF) / baseEF) * 100));
                const costIncrease = Math.round(((altPrice - basePrice) / basePrice) * 100);

                const totalCost = qty * altPrice;
                const isEco = r.plan_type === 'Plan B' || (r.transport_mode && r.transport_mode.includes('Rail'));
                const trnFactor = isEco ? 0.028 : 0.105;
                const transportTon = (qty / 1000) * distanceKm * trnFactor / 1000;
                const materialTon = (qty * altEF) / 1000;
                const totalCarbonTon = Number((materialTon + transportTon).toFixed(2));

                const transportMode = r.transport_mode 
                  ? (r.transport_mode.includes('Rail') || r.transport_mode.includes('EV') ? 'Electric Rail Freight' : 'Road Diesel Freight')
                  : (isEco ? 'Electric Rail Freight' : 'Road Diesel Freight');
                const score = r.plan_type === 'Plan B' ? 96 : 82;

                const certifications = r.certifications 
                  ? r.certifications.split(',').map((c: string) => c.trim())
                  : (r.plan_type === 'Plan B'
                    ? ['ISCC PLUS', 'ISO 14067', 'TGO Green Label']
                    : ['USDA BioPreferred', 'ISCC PLUS', 'ISO 14064']);

                const location = r.location || (r.plan_type === 'Plan B' ? 'Chonburi, Thailand' : 'Rayong, Thailand');

                return {
                  id: `sheet-alt-${idx + 1}`,
                  supplierId: r.material_id || `SUP-00${idx + 2}`,
                  supplierName: r.supplier_name || 'EcoPlast Solutions',
                  materialName: r.material_name || 'Recycled PP (rPP)',
                  transportMode,
                  distanceKm,
                  unitCostUSD: altPrice,
                  totalCostUSD: totalCost,
                  estimatedEmissionsTCO2e: totalCarbonTon,
                  carbonReductionPercentage: reduction,
                  costDiffPercentage: costIncrease,
                  leadTimeDays,
                  certifications,
                  location,
                  recommendationScore: score,
                };
              });

            setAlternatives(dynamicOpts);
            if (dynamicOpts.length > 0) setSelectedAltId(dynamicOpts[0].id);
            addLog('Reason', `Optimizer loaded ${dynamicOpts.length} low-carbon scenarios from Google Sheet`, 'info');
          }
        },
      });
    } catch {
      addLog('Retrieve', 'Could not sync Sheet, falling back to local dataset', 'warning');
      const opts = generateGreenAlternatives(baseExtracted, calc);
      setAlternatives(opts);
      if (opts.length > 0) setSelectedAltId(opts[0].id);
    }
  }, [addLog]);

  // Switch Active Document Context (Tab 2 or Tab 3 Document Switcher)
  const handleSwitchDocument = (docId: string) => {
    setSelectedDocumentId(docId);
    const targetDoc = documentList.find(d => d.documentId === docId);
    if (targetDoc) {
      setStagedExtracted(targetDoc);
      setIsCommitted(true);

      const calc = calculateScope3Emissions(targetDoc);
      setCalculation(calc);

      if (targetDoc.materialCategory === 'Plastics & Polymers' || targetDoc.materialName.toLowerCase().includes('pp') || targetDoc.materialName.toLowerCase().includes('poly')) {
        fetchGoogleSheetData(targetDoc, calc);
      } else {
        setIsSheetConnected(false);
        const opts = generateGreenAlternatives(targetDoc, calc);
        setAlternatives(opts);
        if (opts.length > 0) setSelectedAltId(opts[0].id);
      }

      addLog('Remember', `Switched active document context to PO: ${targetDoc.poNumber || targetDoc.documentId} (${targetDoc.supplierName})`, 'info');
    }
  };

  // Stage 1: Ingest document for review in Tab 1 without committing yet
  const processStagedDocument = (extractedData: ExtractedDocumentData, source: 'Gemini Vision AI' | 'Preset Mock Engine') => {
    setIsProcessing(true);
    setExtractionSource(source);

    addLog('Understand', `Ingested ${extractedData.documentType} (${extractedData.fileName}) [STAGED FOR REVIEW]`, 'info');
    
    setTimeout(() => {
      setStagedExtracted(extractedData);
      setIsCommitted(false);
      addLog('Understand', `Staged document schema parsed: Supplier=${extractedData.supplierName}, Qty=${extractedData.quantity}kg`, 'success');
      setIsProcessing(false);
    }, 400);
  };

  // Clear / Reset Ingested Rows handler
  const handleClearIngestedRows = async () => {
    setIsCommitting(true);
    addLog('Act', 'Clearing extra ingested rows in Google Sheet ERP Database...', 'info');

    try {
      await fetch('/api/sheets/clear', { method: 'POST' });
      setDocumentList(MOCK_DOCUMENT_PRESETS.map(p => p.extracted));
      const defaultDoc = MOCK_DOCUMENT_PRESETS[0].extracted;
      setSelectedDocumentId(defaultDoc.documentId);
      setStagedExtracted(defaultDoc);
      setIsCommitted(true);

      const calc = calculateScope3Emissions(defaultDoc);
      setCalculation(calc);
      await fetchGoogleSheetData(defaultDoc, calc);

      showToast('Reset completed: Ingested rows cleared');
      addLog('Act', 'Ingested rows cleared. Reset to baseline ERP dataset', 'success');
    } catch {
      addLog('Act', 'Failed to clear ingested rows', 'warning');
    } finally {
      setIsCommitting(false);
    }
  };

  // Stage 2: Append & Commit to Google Sheet Database API POST (Called ONLY on explicit user click)
  const commitDocumentToGoogleSheet = async (targetExtracted?: ExtractedDocumentData) => {
    const docToCommit = targetExtracted || stagedExtracted;
    if (!docToCommit) return;

    if (isCommitted && documentList.some(d => d.documentId === docToCommit.documentId)) {
      showToast(`Document ${docToCommit.documentId} is already committed to Google Sheet`);
      return;
    }

    setIsCommitting(true);
    addLog('Act', `Appending document ${docToCommit.documentId} to Google Sheet ERP Database...`, 'info');

    try {
      const res = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docToCommit)
      });
      const data = await res.json();

      if (data.success) {
        // 1. Add new document to registered documentList if not present
        setDocumentList(prev => {
          const exists = prev.some(d => d.documentId === docToCommit.documentId);
          return exists ? prev : [docToCommit, ...prev];
        });

        setSelectedDocumentId(docToCommit.documentId);
        setStagedExtracted(docToCommit);
        setIsCommitted(true);

        // 2. Calculate Scope 3 emissions for committed document
        const calc = calculateScope3Emissions(docToCommit);
        setCalculation(calc);

        // 3. Re-sync alternatives and update global states
        if (docToCommit.materialCategory === 'Plastics & Polymers' || docToCommit.materialName.toLowerCase().includes('pp') || docToCommit.materialName.toLowerCase().includes('poly')) {
          await fetchGoogleSheetData(docToCommit, calc);
        } else {
          setIsSheetConnected(false);
          const opts = generateGreenAlternatives(docToCommit, calc);
          setAlternatives(opts);
          if (opts.length > 0) setSelectedAltId(opts[0].id);
        }

        // 4. Add to audit trail
        setAuditLogs(prev => [
          {
            id: data.transactionId,
            timestamp: new Date().toLocaleTimeString(),
            actionType: 'ERP_WEBHOOK',
            targetSupplier: docToCommit.supplierName,
            status: 'APPROVED',
            details: `Appended document ${docToCommit.documentId} (${docToCommit.materialName}) to Google Sheet ERP database.`
          },
          ...prev
        ]);

        addLog('Remember', `Connected nodes: [${docToCommit.supplierName}] -> [${docToCommit.materialName}] in Knowledge Graph`, 'info');
        addLog('Retrieve', `Matched EF: Material=${calc.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg`, 'info');

        if (calc.baselineComparison.isAnomaly) {
          addLog('Reason', `Carbon Anomaly Flagged: ${calc.totalEmissionsTCO2e} tCO2e (Exceeds sustainable target ${calc.baselineComparison.baselineTCO2e} tCO2e by +${calc.baselineComparison.diffPercentage}%)`, 'warning');
        } else {
          addLog('Reason', `Carbon Footprint Nominal: ${calc.totalEmissionsTCO2e} tCO2e within expected parameters`, 'success');
        }

        addLog('Act', `[DATABASE_UPDATED]: Document ${docToCommit.documentId} appended to Google Sheet ERP. Baseline updated to ${calc.totalEmissionsTCO2e} tCO2e`, 'success');
        showToast(`[DATABASE_UPDATED]: Document appended to Google Sheet ERP (${docToCommit.documentId})`);
      }
    } catch {
      addLog('Act', `Failed to append ${docToCommit.documentId} to Google Sheet ERP Database`, 'warning');
    } finally {
      setIsCommitting(false);
    }
  };

  useEffect(() => {
    const defaultDoc = MOCK_DOCUMENT_PRESETS[0].extracted;
    setStagedExtracted(defaultDoc);
    setSelectedDocumentId(defaultDoc.documentId);
    setIsCommitted(true);
    const calc = calculateScope3Emissions(defaultDoc);
    setCalculation(calc);
    fetchGoogleSheetData(defaultDoc, calc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const matched = MOCK_DOCUMENT_PRESETS.find(p => p.id === presetId);
    if (matched) {
      processStagedDocument(matched.extracted, 'Preset Mock Engine');
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    addLog('Understand', `Uploading custom document file: ${file.name}`, 'info');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: base64, fileName: file.name })
        });
        const data = await res.json();
        if (data.success) {
          processStagedDocument(data.extracted, data.source);
        } else {
          processStagedDocument(MOCK_DOCUMENT_PRESETS[0].extracted, 'Preset Mock Engine');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      processStagedDocument(MOCK_DOCUMENT_PRESETS[0].extracted, 'Preset Mock Engine');
    }
  };

  const selectedAlt = alternatives.find(a => a.id === selectedAltId) || alternatives[0] || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* Top Telemetry & Tab Navigation Header */}
      <Header
        calculation={calculation}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        maxReduction={alternatives.length > 0 ? Math.max(...alternatives.map(a => a.carbonReductionPercentage)) : 78}
      />

      {/* Sync Status Badge Bar */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-6 py-1.5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSheetConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="font-mono text-zinc-400">
            {isSheetConnected ? 'Live ERP Database Connected (Google Sheet Direct)' : 'Local Static Fallback Active'}
          </span>
          <a
            href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=0#gid=0`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-2"
          >
            [View Google Sheet ERP ↗]
          </a>
        </div>
        {currentCommittedDoc && calculation && (
          <button
            onClick={() => fetchGoogleSheetData(currentCommittedDoc, calculation)}
            className="text-zinc-400 hover:text-white font-mono transition-colors text-[11px] underline underline-offset-4 cursor-pointer"
          >
            ↻ Re-sync Sheet Data
          </button>
        )}
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 px-3.5 py-2 rounded font-mono text-xs shadow-lg">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Multi-Tab View Content */}
      <main className="flex-1 p-5 max-w-[1600px] mx-auto w-full space-y-4">
        
        {/* TAB 1: Document Ingestion & Human Review */}
        {activeTab === 'ingestion' && (
          <div className="w-full">
            <LeftPanel
              stagedExtracted={stagedExtracted}
              documentList={documentList}
              selectedDocumentId={selectedDocumentId}
              onSelectDocumentId={handleSwitchDocument}
              onSelectPreset={handleSelectPreset}
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              extractionSource={extractionSource}
              isExpandedView={true}
              isCommitted={isCommitted}
              isCommitting={isCommitting}
              onCommitDocument={() => commitDocumentToGoogleSheet()}
              onClearIngestedRows={handleClearIngestedRows}
            />
          </div>
        )}

        {/* TAB 2: Knowledge Graph (Reflects Committed Data + Document Switcher) */}
        {activeTab === 'graph' && (
          <div className="w-full space-y-4">
            <DocumentSwitcher
              documents={documentList}
              selectedDocId={selectedDocumentId}
              onSelectDoc={handleSwitchDocument}
            />
            <KnowledgeGraph extracted={currentCommittedDoc} calculation={calculation} />
          </div>
        )}

        {/* TAB 3: Actions & Trade-off Analytics (Reflects Committed Data + Document Switcher) */}
        {activeTab === 'actions' && (
          <div className="w-full space-y-4">
            <DocumentSwitcher
              documents={documentList}
              selectedDocId={selectedDocumentId}
              onSelectDoc={handleSwitchDocument}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
              <div className="lg:col-span-6">
                <AnalyticsPanel
                  extracted={currentCommittedDoc}
                  calculation={calculation}
                  alternatives={alternatives}
                  selectedAltId={selectedAltId}
                  onSelectAlternative={(id) => {
                    setSelectedAltId(id);
                    const matched = alternatives.find(a => a.id === id);
                    if (matched) {
                      addLog('Reason', `Simulating Scenario: ${matched.supplierName} (-${matched.carbonReductionPercentage}% tCO2e)`, 'info');
                    }
                  }}
                />
              </div>

              <div className="lg:col-span-6">
                <RightPanel
                  extracted={currentCommittedDoc}
                  calculation={calculation}
                  selectedAlternative={selectedAlt}
                  activityLogs={activityLogs}
                  onOpenRFQModal={() => setActiveModal('RFQ')}
                  onOpenEmailModal={() => setActiveModal('EMAIL')}
                  onOpenERPModal={() => setActiveModal('ERP')}
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Action Modals */}
      <ActionModals
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        extracted={currentCommittedDoc}
        selectedAlternative={selectedAlt}
        onAddAuditLog={(log) => setAuditLogs(prev => [log, ...prev])}
        auditLogs={auditLogs}
        showToast={showToast}
      />

    </div>
  );
}
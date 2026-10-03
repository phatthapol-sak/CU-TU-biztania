'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Header, DashboardTab } from '@/components/Header';
import { LeftPanel } from '@/components/LeftPanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { RightPanel } from '@/components/RightPanel';
import { ActionModals } from '@/components/ActionModals';
import { ExtractedDocumentData, CarbonCalculation, OptimizationAlternative, ActivityLogItem, ERPActionLog } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';
import { calculateScope3Emissions, generateGreenAlternatives } from '@/lib/calculator';

// ใช้ Direct Export URL จาก Sheet ID ของคุณ เพื่อให้ดึงข้อมูลสดทันที ไม่ติด Google CDN Cache
const SHEET_ID = "17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4";
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('ingestion');
  const [activePresetId, setActivePresetId] = useState<string>('doc-preset-1');
  const [currentExtracted, setCurrentExtracted] = useState<ExtractedDocumentData | null>(null);
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
  const addLog = (pillar: ActivityLogItem['pillar'], message: string, status: ActivityLogItem['status'] = 'info') => {
    const newEntry: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      pillar,
      message,
      status
    };
    setActivityLogs(prev => [newEntry, ...prev]);
  };

  // ดึงข้อมูลสดจาก Google Sheet มาแปลงเป็นทางเลือก (Alternatives)
  const fetchGoogleSheetData = async (baseExtracted: ExtractedDocumentData, calc: CarbonCalculation) => {
    try {
      addLog('Retrieve', 'Connecting to Google Sheets ERP Database (Direct Export)...', 'info');
      
      // เรียกผ่าน Server Proxy /api/sheets เพื่อป้องกันปัญหา Browser CORS
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

            // 1. ดึงค่าฐานจาก Plan A ใน Google Sheet (ถ้ามีระบุไว้)
            const planARow = rows.find((r: any) => r.plan_type === 'Plan A' || r.material_id === 'MAT-001');
            const sheetBasePrice = planARow ? Number(planARow.price_per_kg) : null;
            const sheetBaseEF = planARow ? Number(planARow.emission_factor) : null;

            // ค่าฐานสำหรับคำนวณ (ใช้จาก Sheet ก่อน ถ้าไม่มีให้ fallback ไปที่เอกสาร)
            const basePrice = sheetBasePrice || baseExtracted.unitCostUSD || 50;
            const baseEF = sheetBaseEF || calc.matchedMaterialEF?.factorKgCO2ePerUnit || 1.63;
            const qty = baseExtracted.quantity || 2000;
            const distanceKm = baseExtracted.distanceKm || 120;

            // 2. แปลง Plan อื่นๆ (Plan B, C ฯลฯ) ให้เป็นการ์ดทางเลือกตาม Interface OptimizationAlternative
            const dynamicOpts: OptimizationAlternative[] = rows
              .filter((r: any) => r.plan_type !== 'Plan A')
              .map((r: any, idx: number) => {
                const altEF = Number(r.emission_factor) || 0.5;
                const altPrice = Number(r.price_per_kg) || 58;
                const leadTimeDays = Number(r.lead_time_days) || 3;

                // คำนวณ % การลดคาร์บอนและ % ราคาเทียบกับ Plan A
                const reduction = Math.max(0, Math.round(((baseEF - altEF) / baseEF) * 100));
                const costIncrease = Math.round(((altPrice - basePrice) / basePrice) * 100);

                const totalCost = qty * altPrice;
                // คำนวณคาร์บอน (วัสดุ + การขนส่ง)
                const isEco = r.plan_type === 'Plan B' || reduction >= 60;
                const trnFactor = isEco ? 0.028 : 0.096; // Electric Rail vs Road Freight
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
            showToast('⚡ Live ERP Database Synchronized with Google Sheet');
          }
        },
      });
    } catch {
      addLog('Retrieve', 'Could not sync Sheet, falling back to local dataset', 'warning');
      const opts = generateGreenAlternatives(baseExtracted, calc);
      setAlternatives(opts);
      if (opts.length > 0) setSelectedAltId(opts[0].id);
    }
  };

  // Process Document (Preset or Upload)
  const processDocumentData = (extractedData: ExtractedDocumentData, source: 'Gemini Vision AI' | 'Preset Mock Engine') => {
    setIsProcessing(true);
    setExtractionSource(source);

    addLog('Understand', `Ingested ${extractedData.documentType} (${extractedData.fileName})`, 'info');
    
    setTimeout(async () => {
      setCurrentExtracted(extractedData);
      addLog('Understand', `Schema parsed: Supplier=${extractedData.supplierName}, Qty=${extractedData.quantity}kg`, 'success');
      addLog('Remember', `Connected nodes: [${extractedData.supplierName}] -> [${extractedData.materialName}]`, 'info');

      const calc = calculateScope3Emissions(extractedData);
      setCalculation(calc);
      addLog('Retrieve', `Matched EF: Material=${calc.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg`, 'info');

      // ดึงทางเลือกจาก Google Sheet สดๆ (สำหรับกลุ่มเม็ดพลาสติก PP) หรือสร้างตามหมวดหมู่เอกสาร
      if (extractedData.materialCategory === 'Plastics & Polymers' || extractedData.materialName.toLowerCase().includes('pp') || extractedData.materialName.toLowerCase().includes('poly')) {
        await fetchGoogleSheetData(extractedData, calc);
      } else {
        setIsSheetConnected(false);
        const opts = generateGreenAlternatives(extractedData, calc);
        setAlternatives(opts);
        if (opts.length > 0) setSelectedAltId(opts[0].id);
        addLog('Reason', `Generated ${opts.length} low-carbon packaging alternatives from green catalog`, 'info');
      }

      if (calc.baselineComparison.isAnomaly) {
        addLog('Reason', `Carbon Anomaly Flagged: ${calc.totalEmissionsTCO2e} tCO2e (Exceeds sustainable target ${calc.baselineComparison.baselineTCO2e} tCO2e by +${calc.baselineComparison.diffPercentage}%)`, 'warning');
      } else {
        addLog('Reason', `Carbon Footprint Nominal: ${calc.totalEmissionsTCO2e} tCO2e within expected parameters`, 'success');
      }

      setIsProcessing(false);
    }, 500);
  };

  useEffect(() => {
    const defaultPreset = MOCK_DOCUMENT_PRESETS[0];
    processDocumentData(defaultPreset.extracted, 'Preset Mock Engine');
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const matched = MOCK_DOCUMENT_PRESETS.find(p => p.id === presetId);
    if (matched) {
      processDocumentData(matched.extracted, 'Preset Mock Engine');
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
          processDocumentData(data.extracted, data.source);
        } else {
          processDocumentData(MOCK_DOCUMENT_PRESETS[0].extracted, 'Preset Mock Engine');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      processDocumentData(MOCK_DOCUMENT_PRESETS[0].extracted, 'Preset Mock Engine');
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
            href="https://docs.google.com/spreadsheets/d/17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-2"
          >
            [View Google Sheet ERP ↗]
          </a>
        </div>
        {currentExtracted && calculation && (
          <button
            onClick={() => fetchGoogleSheetData(currentExtracted, calculation)}
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
      <main className="flex-1 p-5 max-w-[1600px] mx-auto w-full">
        
        {/* TAB 1: Document Ingestion */}
        {activeTab === 'ingestion' && (
          <div className="w-full">
            <LeftPanel
              currentExtracted={currentExtracted}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              extractionSource={extractionSource}
              isExpandedView={true}
            />
          </div>
        )}

        {/* TAB 2: Knowledge Graph */}
        {activeTab === 'graph' && (
          <div className="w-full space-y-4">
            <KnowledgeGraph extracted={currentExtracted} calculation={calculation} />
          </div>
        )}

        {/* TAB 3: Actions & Trade-off Analytics */}
        {activeTab === 'actions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
            <div className="lg:col-span-6">
              <AnalyticsPanel
                extracted={currentExtracted}
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
                extracted={currentExtracted}
                calculation={calculation}
                selectedAlternative={selectedAlt}
                activityLogs={activityLogs}
                onOpenRFQModal={() => setActiveModal('RFQ')}
                onOpenEmailModal={() => setActiveModal('EMAIL')}
                onOpenERPModal={() => setActiveModal('ERP')}
              />
            </div>
          </div>
        )}

      </main>

      {/* Action Modals */}
      <ActionModals
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        extracted={currentExtracted}
        selectedAlternative={selectedAlt}
        onAddAuditLog={(log) => setAuditLogs(prev => [log, ...prev])}
        auditLogs={auditLogs}
        showToast={showToast}
      />

    </div>
  );
}
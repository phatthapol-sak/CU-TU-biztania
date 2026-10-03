'use client';

import React, { useState, useEffect } from 'react';
import { Header, DashboardTab } from '@/components/Header';
import { LeftPanel } from '@/components/LeftPanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { RightPanel } from '@/components/RightPanel';
import { ActionModals } from '@/components/ActionModals';
import { ExtractedDocumentData, CarbonCalculation, OptimizationAlternative, ActivityLogItem, ERPActionLog } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';
import { calculateScope3Emissions, generateGreenAlternatives } from '@/lib/calculator';

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

  // Process Document (Preset or Upload)
  const processDocumentData = (extractedData: ExtractedDocumentData, source: 'Gemini Vision AI' | 'Preset Mock Engine') => {
    setIsProcessing(true);
    setExtractionSource(source);

    // Initial logs
    addLog('Understand', `Ingested ${extractedData.documentType} (${extractedData.fileName})`, 'info');
    
    setTimeout(() => {
      setCurrentExtracted(extractedData);
      addLog('Understand', `Schema parsed: Supplier=${extractedData.supplierName}, Qty=${extractedData.quantity}kg`, 'success');

      // Pillar 2: Remember & Connect
      addLog('Remember', `Connected nodes: [${extractedData.supplierName}] -> [${extractedData.materialName}]`, 'info');

      // Pillar 3: Retrieve Emission Factors
      const calc = calculateScope3Emissions(extractedData);
      setCalculation(calc);
      addLog('Retrieve', `Matched EF: Material=${calc.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg, Transport=${calc.matchedTransportEF.factorKgCO2ePerUnit} kgCO2e/t-km`, 'info');

      // Pillar 4: Reason & Optimization
      const opts = generateGreenAlternatives(extractedData, calc);
      setAlternatives(opts);
      if (opts.length > 0) setSelectedAltId(opts[0].id);

      if (calc.baselineComparison.isAnomaly) {
        addLog('Reason', `Carbon Anomaly Flagged: ${calc.totalEmissionsTCO2e} tCO2e (Exceeds threshold of 10.0 tCO2e)`, 'warning');
      } else {
        addLog('Reason', `Carbon Footprint Nominal: ${calc.totalEmissionsTCO2e} tCO2e within expected parameters`, 'success');
      }

      addLog('Reason', `Optimizer evaluated ${opts.length} low-carbon procurement scenarios`, 'info');

      setIsProcessing(false);
    }, 500);
  };

  // On initial mount, load preset 1
  useEffect(() => {
    const defaultPreset = MOCK_DOCUMENT_PRESETS[0];
    processDocumentData(defaultPreset.extracted, 'Preset Mock Engine');
  }, []);

  // Handle selecting preset
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const matched = MOCK_DOCUMENT_PRESETS.find(p => p.id === presetId);
    if (matched) {
      processDocumentData(matched.extracted, 'Preset Mock Engine');
    }
  };

  // Handle custom file upload
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
      />

      {/* Minimal Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 px-3.5 py-2 rounded font-mono text-xs shadow-lg">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Multi-Tab View Content Container */}
      <main className="flex-1 p-5 max-w-[1600px] mx-auto w-full">
        
        {/* TAB 1: DOCUMENT INGESTION & TECHNICAL INSPECTOR */}
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

        {/* TAB 2: SUPPLY CHAIN KNOWLEDGE GRAPH */}
        {activeTab === 'graph' && (
          <div className="w-full space-y-4">
            <KnowledgeGraph extracted={currentExtracted} calculation={calculation} />
          </div>
        )}

        {/* TAB 3: SCENARIO ANALYTICS & AUTONOMOUS ACTIONS */}
        {activeTab === 'actions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
            
            {/* Left 6 Columns: Analytics Matrix & Recharts Simulation */}
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
                    addLog('Reason', `Simulating Green Scenario: ${matched.supplierName} (-${matched.carbonReductionPercentage}% tCO2e)`, 'info');
                  }
                }}
              />
            </div>

            {/* Right 6 Columns: Copilot Diagnosis & Action Center */}
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

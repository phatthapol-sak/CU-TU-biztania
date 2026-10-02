'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { LeftPanel } from '@/components/LeftPanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { RightPanel } from '@/components/RightPanel';
import { ActionModals } from '@/components/ActionModals';
import { ExtractedDocumentData, CarbonCalculation, OptimizationAlternative, ActivityLogItem, ERPActionLog } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';
import { calculateScope3Emissions, generateGreenAlternatives } from '@/lib/calculator';

export default function Home() {
  const [activePresetId, setActivePresetId] = useState<string>('doc-preset-1');
  const [currentExtracted, setCurrentExtracted] = useState<ExtractedDocumentData | null>(null);
  const [calculation, setCalculation] = useState<CarbonCalculation | null>(null);
  const [alternatives, setAlternatives] = useState<OptimizationAlternative[]>([]);
  const [selectedAltId, setSelectedAltId] = useState<string>('alt-opt-1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractionSource, setExtractionSource] = useState<'Gemini Vision AI' | 'Preset Mock Engine'>('Preset Mock Engine');

  const [activeModal, setActiveModal] = useState<'RFQ' | 'EMAIL' | 'ERP' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Concierge Activity Feed State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ERPActionLog[]>([]);

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
    addLog('Understand', `Multimodal Ingestion: Received ${extractedData.documentType} (${extractedData.fileName})`, 'info');
    
    setTimeout(() => {
      setCurrentExtracted(extractedData);
      addLog('Understand', `Schema Extracted: Supplier=${extractedData.supplierName}, Qty=${extractedData.quantity}kg`, 'success');

      // Pillar 2: Remember & Connect
      addLog('Remember', `Connected node [${extractedData.supplierName}] -> [${extractedData.materialName}] in Knowledge Graph`, 'info');

      // Pillar 3: Retrieve Emission Factors
      const calc = calculateScope3Emissions(extractedData);
      setCalculation(calc);
      addLog('Retrieve', `Matched EF: Material=${calc.matchedMaterialEF.factorKgCO2ePerUnit} ${calc.matchedMaterialEF.unit}, Transport=${calc.matchedTransportEF.factorKgCO2ePerUnit}`, 'info');

      // Pillar 4: Reason & Optimization
      const opts = generateGreenAlternatives(extractedData, calc);
      setAlternatives(opts);
      if (opts.length > 0) setSelectedAltId(opts[0].id);

      if (calc.baselineComparison.isAnomaly) {
        addLog('Reason', `🚨 High Carbon Anomaly Flagged! Footprint (${calc.totalEmissionsTCO2e} tCO2e) exceeds threshold (10.0 tCO2e).`, 'warning');
      } else {
        addLog('Reason', `Carbon Footprint (${calc.totalEmissionsTCO2e} tCO2e) within standard baseline parameters.`, 'success');
      }

      addLog('Reason', `Multi-Objective Optimizer identified ${opts.length} lower-carbon procurement scenarios.`, 'info');

      setIsProcessing(false);
    }, 600);
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

    // Call API route /api/extract
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
          // Fallback preset if error
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header calculation={calculation} selectedAlternativeCount={alternatives.length} />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="bg-emerald-900/90 border border-emerald-400 text-emerald-100 px-4 py-3 rounded-xl shadow-xl shadow-emerald-950/50 flex items-center space-x-2 text-xs font-semibold">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main 3-Panel Grid Dashboard */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Panel: Pillar 1 Ingestion & Document Inspector (3 columns on large screen) */}
        <div className="lg:col-span-3 h-full">
          <LeftPanel
            currentExtracted={currentExtracted}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
            extractionSource={extractionSource}
          />
        </div>

        {/* Center Panel: Pillar 2 Knowledge Graph & Pillar 3/4 Analytics (5 columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <KnowledgeGraph extracted={currentExtracted} calculation={calculation} />
          <AnalyticsPanel
            extracted={currentExtracted}
            calculation={calculation}
            alternatives={alternatives}
            selectedAltId={selectedAltId}
            onSelectAlternative={(id) => {
              setSelectedAltId(id);
              const matched = alternatives.find(a => a.id === id);
              if (matched) {
                addLog('Reason', `Selected Green Scenario: ${matched.supplierName} (-${matched.carbonReductionPercentage}% tCO2e)`, 'info');
              }
            }}
          />
        </div>

        {/* Right Panel: Pillar 4 Reason & Pillar 5 Act Copilot Actions (4 columns) */}
        <div className="lg:col-span-4 h-full">
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

'use client';

import React, { useState } from 'react';
import { Upload, FileText, Check, Database, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { ExtractedDocumentData } from '@/types';

interface LeftPanelProps {
  stagedExtracted: ExtractedDocumentData | null;
  documentList: ExtractedDocumentData[];
  selectedDocumentId: string;
  onSelectDocumentId: (docId: string) => void;
  onSelectPreset?: (presetId: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  extractionSource: 'Gemini Vision AI' | 'Preset Mock Engine';
  isExpandedView?: boolean;
  isCommitted: boolean;
  isCommitting: boolean;
  onCommitDocument: () => void;
  onClearIngestedRows?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  stagedExtracted,
  documentList,
  selectedDocumentId,
  onSelectDocumentId,
  onSelectPreset,
  onFileUpload,
  isProcessing,
  extractionSource,
  isExpandedView = false,
  isCommitted,
  isCommitting,
  onCommitDocument,
  onClearIngestedRows
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4 h-full overflow-y-auto ${
      isExpandedView ? 'w-full' : ''
    }`}>
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold whitespace-nowrap">
            01
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
            Multimodal Document Ingestion & Technical Inspector
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded whitespace-nowrap">
            {extractionSource}
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap border ${
            isCommitted
              ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
              : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
          }`}>
            {isCommitted ? '[SYNCED TO GOOGLE SHEET]' : '[STAGED FOR REVIEW]'}
          </span>
        </div>
      </div>

      {/* Responsive Layout Grid */}
      <div className={`grid gap-4 ${isExpandedView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Left Sub-Section: Registered Document Selector & Upload Dropzone */}
        <div className={`space-y-4 ${isExpandedView ? 'lg:col-span-5' : ''}`}>
          
          {/* Registered Documents List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 font-semibold uppercase">
              <span>REGISTERED DOCUMENTS ({documentList.length})</span>
              {onClearIngestedRows && (
                <button
                  onClick={onClearIngestedRows}
                  className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Clear extra ingested rows and reset to default dataset"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Ingested Rows</span>
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {documentList.map((doc) => {
                const isSelected = doc.documentId === (stagedExtracted?.documentId || selectedDocumentId);
                return (
                  <button
                    key={doc.documentId}
                    onClick={() => onSelectDocumentId(doc.documentId)}
                    disabled={isProcessing || isCommitting}
                    className={`w-full text-left p-3 rounded border text-xs transition-all flex items-center justify-between font-mono cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-medium'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="truncate text-[11px] font-semibold text-zinc-200" title={doc.materialName}>
                          {doc.poNumber ? `[${doc.poNumber}] ` : ''}{doc.supplierName}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{doc.materialName}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] text-zinc-400 font-semibold uppercase block">UPLOAD NEW INVOICE / BOM</span>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded p-4 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-zinc-500 bg-zinc-800/40'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isProcessing || isCommitting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5 text-zinc-400 text-xs font-mono">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-[11px] whitespace-nowrap">Drop PDF / PNG / JPG file or <strong className="text-zinc-200 underline font-normal">browse</strong></span>
                <span className="text-[10px] text-zinc-500">Supports Invoices, BOMs, and Shipping Waybills</span>
              </div>
            </div>
          </div>

          {/* Review Notice Box */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-[11px] space-y-1 text-zinc-400">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>HUMAN-IN-THE-LOOP WORKFLOW</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
              Verify the material specification and transport parameters on the right. Click <strong className="text-zinc-200">Upload & Commit to Google Sheet Database</strong> to record the new document and update global Scope 3 calculations across all views.
            </p>
          </div>

        </div>

        {/* Right Sub-Section: Technical Inspector Sheet & Commit Button */}
        <div className={`space-y-3 flex flex-col ${isExpandedView ? 'lg:col-span-7' : ''}`}>
          
          {/* View Mode Toggle Bar */}
          <div className="flex items-center justify-between bg-zinc-950 p-1 rounded border border-zinc-800 text-[11px] font-mono">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex-1 py-1 rounded font-medium transition-all text-center cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Technical Sheet View
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex-1 py-1 rounded font-medium transition-all text-center cursor-pointer ${
                viewMode === 'json'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Raw Extracted JSON
            </button>
          </div>

          {/* Technical Inspector Box */}
          <div className="flex-1 min-h-[300px] bg-zinc-950 border border-zinc-800 rounded p-4 font-mono overflow-y-auto">
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-10 text-zinc-400 font-mono text-xs">
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                <span>[GEMINI_VISION_AI_PROCESSING...]</span>
              </div>
            ) : viewMode === 'visual' && stagedExtracted ? (
              <div className="space-y-3.5 text-xs">
                {/* Header snippet */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">{stagedExtracted.documentType}</span>
                    <div className="font-bold text-zinc-100 text-sm">{stagedExtracted.documentId}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded border font-bold ${
                      isCommitted
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                        : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                    }`}>
                      {isCommitted ? 'COMMITTED TO SHEET' : 'PENDING COMMIT'}
                    </span>
                    <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold whitespace-nowrap">
                      PO: {stagedExtracted.poNumber}
                    </span>
                  </div>
                </div>

                {/* Structured Key-Value Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">SUPPLIER_NAME</span>
                    <span className="font-bold text-zinc-200 truncate block mt-0.5 text-xs" title={stagedExtracted.supplierName}>
                      {stagedExtracted.supplierName}
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">ISSUE_DATE</span>
                    <span className="font-bold text-zinc-300 block mt-0.5 text-xs">{stagedExtracted.issueDate}</span>
                  </div>
                </div>

                {/* Line Item Box */}
                <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 space-y-2.5 text-[11px]">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">MATERIAL LINE ITEM AUDIT</span>
                  <div className="font-bold text-zinc-100 text-xs">{stagedExtracted.materialName}</div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block text-[9px]">QUANTITY</span>
                      <span className="font-bold text-zinc-200 whitespace-nowrap">{stagedExtracted.quantity.toLocaleString()} {stagedExtracted.unit}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">UNIT_PRICE</span>
                      <span className="font-bold text-zinc-200 whitespace-nowrap">
                        {stagedExtracted.supplierName.includes('Thai') || stagedExtracted.fileName.includes('THAI') ? '฿' : '$'}
                        {stagedExtracted.unitCostUSD} / {stagedExtracted.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">TOTAL_VALUE</span>
                      <span className="font-bold text-emerald-400 whitespace-nowrap">
                        {stagedExtracted.supplierName.includes('Thai') || stagedExtracted.fileName.includes('THAI') ? '฿' : '$'}
                        {stagedExtracted.totalCostUSD.toLocaleString()} {stagedExtracted.supplierName.includes('Thai') || stagedExtracted.fileName.includes('THAI') ? 'THB' : 'USD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logistics Box */}
                <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 text-[11px] space-y-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">FREIGHT & LOGISTICS PARAMETERS</span>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-200">{stagedExtracted.transportMode}</span>
                    <span className="text-zinc-400 font-mono whitespace-nowrap">{stagedExtracted.distanceKm} km route</span>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="text-[11px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(stagedExtracted, null, 2)}
              </pre>
            )}
          </div>

          {/* Prominent Executive Commit Action Button */}
          {stagedExtracted && (
            <div className="pt-1">
              <button
                onClick={onCommitDocument}
                disabled={isCommitted || isCommitting || isProcessing}
                className={`py-3 px-4 rounded w-full font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${
                  isCommitted
                    ? 'bg-zinc-900 text-emerald-400 border-emerald-800/80 cursor-default'
                    : isCommitting
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-wait'
                    : 'bg-zinc-100 hover:bg-white text-zinc-950 border-zinc-200 cursor-pointer shadow-md'
                }`}
              >
                {isCommitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>[APPENDING_TO_GOOGLE_SHEET...]</span>
                  </>
                ) : isCommitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>[✓ SYNCED TO GOOGLE SHEET DATABASE]</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-zinc-950" />
                    <span>Upload & Commit to Google Sheet Database</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

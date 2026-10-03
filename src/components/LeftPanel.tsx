'use client';

import React, { useState } from 'react';
import { Upload, FileText, Check, Code, Truck, Package, DollarSign, MapPin } from 'lucide-react';
import { DocumentPreset, ExtractedDocumentData } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';

interface LeftPanelProps {
  currentExtracted: ExtractedDocumentData | null;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  extractionSource: 'Gemini Vision AI' | 'Preset Mock Engine';
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  currentExtracted,
  activePresetId,
  onSelectPreset,
  onFileUpload,
  isProcessing,
  extractionSource
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col space-y-4 h-full overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold">
            01
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
            Multimodal Document Ingestion
          </h2>
        </div>
        <span className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
          {extractionSource}
        </span>
      </div>

      {/* Preset Document Selector (Clean List Items) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 font-semibold uppercase">
          <span>DEMO DOCUMENT PRESETS</span>
          <span>SELECT TO INGEST</span>
        </div>
        <div className="space-y-1">
          {MOCK_DOCUMENT_PRESETS.map((preset: DocumentPreset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                disabled={isProcessing}
                className={`w-full text-left px-3 py-2 rounded border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-medium'
                    : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span className="truncate text-[11px] font-mono">{preset.title}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Upload Dropzone */}
      <div className="space-y-1">
        <span className="font-mono text-[10px] text-zinc-400 font-semibold uppercase">CUSTOM FILE UPLOAD</span>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border border-dashed rounded p-3 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-zinc-500 bg-zinc-800/40'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center space-x-2 text-zinc-400 text-xs py-0.5 font-mono">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">Drop PDF / Image file or <strong className="text-zinc-200 underline font-normal">browse</strong></span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between bg-zinc-950 p-1 rounded border border-zinc-800 text-[11px] font-mono">
        <button
          onClick={() => setViewMode('visual')}
          className={`flex-1 py-1 rounded font-medium transition-all text-center ${
            viewMode === 'visual'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Technical Sheet
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`flex-1 py-1 rounded font-medium transition-all text-center ${
            viewMode === 'json'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Raw JSON Schema
        </button>
      </div>

      {/* Technical Data Inspector */}
      <div className="flex-1 min-h-[260px] bg-zinc-950 border border-zinc-800 rounded p-3 font-mono overflow-y-auto">
        {isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-8 text-zinc-400 font-mono text-xs">
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
            <span>[GEMINI_VISION_AI_PROCESSING...]</span>
          </div>
        ) : viewMode === 'visual' && currentExtracted ? (
          <div className="space-y-3 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase">{currentExtracted.documentType}</span>
                <div className="font-bold text-zinc-100 text-xs">{currentExtracted.documentId}</div>
              </div>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                {currentExtracted.poNumber}
              </span>
            </div>

            {/* Structured Technical Key-Value Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 block uppercase">SUPPLIER</span>
                <span className="font-semibold text-zinc-200 truncate block mt-0.5">{currentExtracted.supplierName}</span>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 block uppercase">ISSUE_DATE</span>
                <span className="font-semibold text-zinc-300 block mt-0.5">{currentExtracted.issueDate}</span>
              </div>
            </div>

            <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800 space-y-2 text-[11px]">
              <div className="text-[9px] text-zinc-500 font-bold uppercase">MATERIAL SPECIFICATION</div>
              <div className="font-bold text-zinc-100">{currentExtracted.materialName}</div>
              <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-zinc-800 text-[10px]">
                <div>
                  <span className="text-zinc-500 block">QTY</span>
                  <span className="font-semibold text-zinc-200">{currentExtracted.quantity.toLocaleString()} {currentExtracted.unit}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">UNIT_COST</span>
                  <span className="font-semibold text-zinc-200">${currentExtracted.unitCostUSD}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">TOTAL_USD</span>
                  <span className="font-semibold text-emerald-400">${currentExtracted.totalCostUSD.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800 text-[11px]">
              <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">LOGISTICS PARAMETERS</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300">{currentExtracted.transportMode}</span>
                <span className="text-zinc-400 font-semibold">{currentExtracted.distanceKm} km</span>
              </div>
            </div>
          </div>
        ) : (
          <pre className="text-[10px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(currentExtracted, null, 2)}
          </pre>
        )}
      </div>

    </div>
  );
};

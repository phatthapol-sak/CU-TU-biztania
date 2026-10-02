'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Code, Sparkles, Truck, Package, DollarSign, MapPin } from 'lucide-react';
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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-5 h-full overflow-y-auto">
      
      {/* Pillar Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            1
          </span>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Pillar 1: Multimodal Ingestion
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          {extractionSource}
        </span>
      </div>

      {/* Preset Document Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Preloaded Demo Document Presets</span>
          <span className="text-[10px] text-slate-400 font-normal">Click to ingest</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {MOCK_DOCUMENT_PRESETS.map((preset: DocumentPreset) => {
            const isSelected = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                disabled={isProcessing}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start space-x-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate flex items-center justify-between">
                    <span>{preset.title}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Upload Dropzone */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Upload Custom Invoice / BOM / Waybill</label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald-500 bg-emerald-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
            <div className="p-2.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              <span className="text-emerald-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-[10px] text-slate-500">Supports PDF, PNG, JPG (Invoice / Waybill / Shipping manifest)</p>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="flex items-center justify-between bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setViewMode('visual')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 ${
            viewMode === 'visual'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Visual Document</span>
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 ${
            viewMode === 'json'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Extracted JSON Schema</span>
        </button>
      </div>

      {/* Document Inspector Card */}
      <div className="flex-1 min-h-[260px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 overflow-y-auto">
        {isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-emerald-400">Gemini Vision AI Extracting Schema...</p>
            <p className="text-[11px] text-slate-400 max-w-xs">Parsing material specification, freight distance, and logistics parameters.</p>
          </div>
        ) : viewMode === 'visual' && currentExtracted ? (
          <div className="space-y-4 text-xs">
            {/* Header snippet */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentExtracted.documentType}</span>
                <h3 className="text-sm font-bold text-white">{currentExtracted.documentId}</h3>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[11px]">
                {currentExtracted.poNumber}
              </span>
            </div>

            {/* Supplier & Date */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 block">Supplier</span>
                <span className="font-semibold text-emerald-300 text-[11px] truncate block">{currentExtracted.supplierName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Issue Date</span>
                <span className="font-semibold text-slate-300 text-[11px] block">{currentExtracted.issueDate}</span>
              </div>
            </div>

            {/* Extracted Line Item Box */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Line Item Extracted</span>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-white text-[11px]">{currentExtracted.materialName}</div>
                      <div className="text-[10px] text-slate-400">{currentExtracted.materialCategory}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Quantity</span>
                    <span className="font-semibold text-white">{currentExtracted.quantity.toLocaleString()} {currentExtracted.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Unit Cost</span>
                    <span className="font-semibold text-white">${currentExtracted.unitCostUSD}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Cost</span>
                    <span className="font-semibold text-emerald-400 flex items-center">
                      <DollarSign className="w-3 h-3 -mr-0.5" />
                      {currentExtracted.totalCostUSD.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Freight / Logistics Box */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Logistics & Freight Details</span>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-teal-400" />
                    <span className="font-medium text-slate-200">{currentExtracted.transportMode}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{currentExtracted.distanceKm} km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(currentExtracted, null, 2)}
          </pre>
        )}
      </div>

    </div>
  );
};

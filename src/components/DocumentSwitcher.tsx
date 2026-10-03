'use client';

import React from 'react';
import { FileText, Check, Layers } from 'lucide-react';
import { ExtractedDocumentData } from '@/types';

interface DocumentSwitcherProps {
  documents: ExtractedDocumentData[];
  selectedDocId: string;
  onSelectDoc: (docId: string) => void;
}

export const DocumentSwitcher: React.FC<DocumentSwitcherProps> = ({
  documents,
  selectedDocId,
  onSelectDoc
}) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs font-mono">
      
      {/* Switcher Label */}
      <div className="flex items-center space-x-2 text-zinc-400 font-semibold uppercase tracking-wider shrink-0">
        <Layers className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-[10px]">ACTIVE DOCUMENT SWITCHER:</span>
      </div>

      {/* Horizontal Document Tab Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-0.5">
        {documents.map((doc) => {
          const isSelected = doc.documentId === selectedDocId;
          const shortSupplier = doc.supplierName.split(' ')[0];
          return (
            <button
              key={doc.documentId}
              onClick={() => onSelectDoc(doc.documentId)}
              className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold shadow-sm ring-1 ring-zinc-500'
                  : 'bg-zinc-950/80 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>[{doc.poNumber || doc.documentId} - {shortSupplier}]</span>
              {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

    </div>
  );
};

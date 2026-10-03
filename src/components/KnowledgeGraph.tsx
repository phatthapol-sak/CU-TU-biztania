'use client';

import React, { useState } from 'react';
import { Network, Factory, Truck, Box, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CarbonCalculation, ExtractedDocumentData } from '@/types';

interface KnowledgeGraphProps {
  extracted: ExtractedDocumentData | null;
  calculation: CarbonCalculation | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ extracted, calculation }) => {
  const [selectedStage, setSelectedStage] = useState<string>('outcome');

  if (!extracted || !calculation) {
    return (
      <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 font-mono text-xs">
        [GRAPH_DATA_UNAVAILABLE]
      </div>
    );
  }

  const isAnomaly = calculation.baselineComparison.isAnomaly;
  const severity = calculation.baselineComparison.anomalySeverity;

  // Stages definition
  const stages = [
    {
      id: 'supplier',
      stageNum: '01',
      title: 'Tier-1 Supplier',
      name: extracted.supplierName,
      detail: `ID: ${extracted.supplierId}`,
      metric: extracted.issueDate,
      icon: Factory,
      statusColor: 'border-zinc-700 text-zinc-300'
    },
    {
      id: 'logistics',
      stageNum: '02',
      title: 'Logistics Carrier',
      name: extracted.transportMode,
      detail: `${extracted.distanceKm} km freight route`,
      metric: calculation.matchedTransportEF.source.split('/')[0],
      icon: Truck,
      statusColor: 'border-zinc-700 text-zinc-300'
    },
    {
      id: 'material',
      stageNum: '03',
      title: 'Material Ingestion',
      name: extracted.materialName,
      detail: `${extracted.quantity.toLocaleString()} ${extracted.unit} @ $${extracted.unitCostUSD}/kg`,
      metric: `${calculation.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg`,
      icon: Box,
      statusColor: isAnomaly ? 'border-rose-800 bg-rose-950/20 text-rose-300' : 'border-zinc-700 text-zinc-300'
    },
    {
      id: 'production',
      stageNum: '04',
      title: 'Production Facility',
      name: 'Assembly Hub 1 (Line A)',
      detail: `PO Ref: ${extracted.poNumber}`,
      metric: `$${extracted.totalCostUSD.toLocaleString()} USD`,
      icon: Box,
      statusColor: 'border-zinc-700 text-zinc-300'
    }
  ];

  // Selected details resolver
  const getStageDetail = (id: string) => {
    switch (id) {
      case 'supplier':
        return {
          label: 'TIER-1 VENDOR SPECIFICATION',
          data: [
            { key: 'SUPPLIER_NAME', val: extracted.supplierName },
            { key: 'VENDOR_ID', val: extracted.supplierId },
            { key: 'DOCUMENT_ID', val: extracted.documentId },
            { key: 'DOCUMENT_TYPE', val: extracted.documentType }
          ]
        };
      case 'logistics':
        return {
          label: 'FREIGHT & LOGISTICS PARAMETERS',
          data: [
            { key: 'TRANSPORT_MODE', val: extracted.transportMode },
            { key: 'ROUTE_DISTANCE', val: `${extracted.distanceKm} km` },
            { key: 'MATCHED_FACTOR', val: `${calculation.matchedTransportEF.factorKgCO2ePerUnit} kgCO2e/tonne-km` },
            { key: 'EF_SOURCE', val: calculation.matchedTransportEF.source }
          ]
        };
      case 'material':
        return {
          label: 'RAW MATERIAL EMISSION FACTOR AUDIT',
          data: [
            { key: 'MATERIAL_TRADE_NAME', val: extracted.materialName },
            { key: 'QUANTITY_INGESTED', val: `${extracted.quantity.toLocaleString()} ${extracted.unit}` },
            { key: 'PRIMARY_EF', val: `${calculation.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg` },
            { key: 'MATERIAL_EMISSIONS', val: `${(calculation.materialEmissionsKgCO2e / 1000).toFixed(2)} tCO2e` }
          ]
        };
      case 'production':
        return {
          label: 'FACILITY & PURCHASE ORDER ROUTING',
          data: [
            { key: 'FACILITY_DESTINATION', val: 'GreenScope Assembly Hub 1, Columbus OH' },
            { key: 'PO_NUMBER', val: extracted.poNumber },
            { key: 'TOTAL_COMMITTED_COST', val: `$${extracted.totalCostUSD.toLocaleString()} USD` },
            { key: 'CARBON_INTENSITY', val: `${calculation.carbonIntensityPerUSD} kgCO2e / $` }
          ]
        };
      case 'outcome':
      default:
        return {
          label: 'SCOPE 3 CARBON AUDIT OUTCOME',
          data: [
            { key: 'TOTAL_FOOTPRINT', val: `${calculation.totalEmissionsTCO2e} tCO2e` },
            { key: 'RISK_SEVERITY', val: severity },
            { key: 'BASELINE_THRESHOLD', val: `${calculation.baselineComparison.baselineTCO2e} tCO2e` },
            { key: 'DEVIATION_DELTA', val: `${calculation.baselineComparison.diffPercentage > 0 ? '+' : ''}${calculation.baselineComparison.diffPercentage}%` }
          ]
        };
    }
  };

  const selectedData = getStageDetail(selectedStage);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col space-y-4">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold">
            02
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-zinc-400" />
            Supply Chain Architecture Flow
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase">Interactive Stage Inspector</span>
      </div>

      {/* Symmetrical 4-Stage Horizontal Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {stages.map((stg) => {
          const IconComp = stg.icon;
          const isSelected = selectedStage === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => setSelectedStage(stg.id)}
              className={`text-left p-3 rounded border transition-all flex flex-col justify-between h-28 relative ${
                isSelected
                  ? 'bg-zinc-800/90 border-zinc-600 ring-1 ring-zinc-500'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              } ${stg.statusColor}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-zinc-500 font-bold">{stg.stageNum}. {stg.title}</span>
                <IconComp className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              <div>
                <div className="font-sans font-bold text-xs text-zinc-100 truncate mt-1">
                  {stg.name}
                </div>
                <div className="font-mono text-[10px] text-zinc-400 truncate">
                  {stg.detail}
                </div>
              </div>

              <div className="pt-1.5 border-t border-zinc-800/80 font-mono text-[10px] text-zinc-500 flex justify-between">
                <span>METRIC</span>
                <span className="text-zinc-300 font-semibold">{stg.metric}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Symmetrical Connector Lines to Centered Outcome Node */}
      <div className="relative flex flex-col items-center py-1">
        <div className="w-[1px] h-4 bg-zinc-800"></div>

        {/* Centered Scope 3 Audit Outcome Node */}
        <button
          onClick={() => setSelectedStage('outcome')}
          className={`w-full max-w-md text-center p-3 rounded border transition-all ${
            selectedStage === 'outcome' ? 'ring-1 ring-zinc-400' : ''
          } ${
            isAnomaly
              ? 'bg-rose-950/30 border-rose-800 text-rose-200'
              : 'bg-zinc-950 border-zinc-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              {isAnomaly ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              STAGE 05: SCOPE 3 CARBON AUDIT OUTCOME
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isAnomaly ? 'bg-rose-900/60 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {severity} SEVERITY
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-zinc-800/80">
            <span className="text-zinc-400">EMISSION_FOOTPRINT:</span>
            <span className="font-bold text-sm text-zinc-100">{calculation.totalEmissionsTCO2e} tCO2e</span>
            <span className="text-zinc-500 text-[10px]">THRESHOLD: 10.0 tCO2e</span>
          </div>
        </button>
      </div>

      {/* Selected Node Telemetry Strip */}
      <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono">
        <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-2 uppercase">
          {selectedData.label}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {selectedData.data.map((item, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800/80 p-2 rounded">
              <div className="text-[9px] text-zinc-500 uppercase">{item.key}</div>
              <div className="text-[11px] font-bold text-zinc-200 truncate mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Network, Factory, Truck, Box, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CarbonCalculation, ExtractedDocumentData } from '@/types';

interface KnowledgeGraphProps {
  extracted: ExtractedDocumentData | null;
  calculation: CarbonCalculation | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ extracted, calculation }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-carbon');

  if (!extracted || !calculation) {
    return (
      <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 font-mono text-xs">
        [GRAPH_DATA_UNAVAILABLE]
      </div>
    );
  }

  const isAnomaly = calculation.baselineComparison.isAnomaly;
  const severity = calculation.baselineComparison.anomalySeverity;

  // Topological Node Data
  const nodes = [
    {
      id: 'node-supplier',
      title: 'Tier-1 Supplier',
      name: extracted.supplierName,
      value: `ID: ${extracted.supplierId}`,
      subtext: `Issued: ${extracted.issueDate}`,
      type: 'SUPPLIER',
      icon: Factory,
      x: 100,
      y: 170
    },
    {
      id: 'node-logistics',
      title: 'Logistics Freight',
      name: extracted.transportMode,
      value: `${extracted.distanceKm} km route`,
      subtext: `${calculation.matchedTransportEF.factorKgCO2ePerUnit} kgCO2e/t-km`,
      type: 'LOGISTICS',
      icon: Truck,
      x: 340,
      y: 90
    },
    {
      id: 'node-material',
      title: 'Material Specification',
      name: extracted.materialName,
      value: `${extracted.quantity.toLocaleString()} ${extracted.unit}`,
      subtext: `${calculation.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg`,
      type: 'MATERIAL',
      icon: Box,
      x: 340,
      y: 250
    },
    {
      id: 'node-production',
      title: 'Production Facility',
      name: 'Assembly Hub 1 (Line A)',
      value: `PO: ${extracted.poNumber}`,
      subtext: `$${extracted.totalCostUSD.toLocaleString()} USD`,
      type: 'PRODUCT',
      icon: Box,
      x: 580,
      y: 90
    },
    {
      id: 'node-carbon',
      title: 'Scope 3 Audit Outcome',
      name: `${calculation.totalEmissionsTCO2e} tCO2e Footprint`,
      value: isAnomaly ? '⚠️ High Carbon Anomaly' : '✓ Nominal Baseline',
      subtext: `Threshold: 10.0 tCO2e`,
      type: 'EMISSION_SCORE',
      icon: isAnomaly ? ShieldAlert : CheckCircle2,
      x: 580,
      y: 250,
      isHigh: isAnomaly
    }
  ];

  // Topological Edge Connections
  const edges = [
    { id: 'e1', source: 'node-supplier', target: 'node-logistics', label: 'TRANSPORTED_BY' },
    { id: 'e2', source: 'node-supplier', target: 'node-material', label: 'SUPPLIES' },
    { id: 'e3', source: 'node-material', target: 'node-production', label: 'IN_PRODUCT' },
    { id: 'e4', source: 'node-material', target: 'node-carbon', label: 'EMITS' },
    { id: 'e5', source: 'node-logistics', target: 'node-carbon', label: 'EMITS' }
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[4];

  // Node Inspector Data generator
  const getNodeInspectorData = (nodeId: string) => {
    switch (nodeId) {
      case 'node-supplier':
        return [
          { key: 'SUPPLIER_NAME', val: extracted.supplierName },
          { key: 'VENDOR_ID', val: extracted.supplierId },
          { key: 'DOCUMENT_REF', val: extracted.documentId },
          { key: 'ISSUE_DATE', val: extracted.issueDate }
        ];
      case 'node-logistics':
        return [
          { key: 'TRANSPORT_MODE', val: extracted.transportMode },
          { key: 'FREIGHT_DISTANCE', val: `${extracted.distanceKm} km` },
          { key: 'MATCHED_FACTOR', val: `${calculation.matchedTransportEF.factorKgCO2ePerUnit} kgCO2e/t-km` },
          { key: 'FACTOR_SOURCE', val: calculation.matchedTransportEF.source }
        ];
      case 'node-material':
        return [
          { key: 'MATERIAL_NAME', val: extracted.materialName },
          { key: 'QUANTITY', val: `${extracted.quantity.toLocaleString()} ${extracted.unit}` },
          { key: 'PRIMARY_EF', val: `${calculation.matchedMaterialEF.factorKgCO2ePerUnit} kgCO2e/kg` },
          { key: 'EMISSIONS_TOTAL', val: `${(calculation.materialEmissionsKgCO2e / 1000).toFixed(2)} tCO2e` }
        ];
      case 'node-production':
        return [
          { key: 'FACILITY_DESTINATION', val: 'GreenScope Assembly Hub 1, Columbus OH' },
          { key: 'PO_NUMBER', val: extracted.poNumber },
          { key: 'TOTAL_COST_USD', val: `$${extracted.totalCostUSD.toLocaleString()}` },
          { key: 'CARBON_INTENSITY', val: `${calculation.carbonIntensityPerUSD} kgCO2e / $` }
        ];
      case 'node-carbon':
      default:
        return [
          { key: 'SCOPE3_FOOTPRINT', val: `${calculation.totalEmissionsTCO2e} tCO2e` },
          { key: 'RISK_SEVERITY', val: severity },
          { key: 'BASELINE_THRESHOLD', val: `${calculation.baselineComparison.baselineTCO2e} tCO2e` },
          { key: 'DELTA_PERCENT', val: `${calculation.baselineComparison.diffPercentage > 0 ? '+' : ''}${calculation.baselineComparison.diffPercentage}%` }
        ];
    }
  };

  const inspectorData = getNodeInspectorData(selectedNodeId);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold">
            02
          </span>
          <h2 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-zinc-400" />
            Supply Chain Knowledge Graph & Topological Network
          </h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded whitespace-nowrap">
          Interactive Node Inspector
        </span>
      </div>

      {/* Spacious SVG Canvas */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded p-4 overflow-hidden min-h-[380px] flex items-center justify-center">
        
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:28px_28px] opacity-25 pointer-events-none"></div>

        <svg viewBox="0 0 680 340" className="w-full h-auto max-h-[420px] relative z-10">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa" />
            </marker>
          </defs>

          {/* Render SVG Connector Lines */}
          {edges.map(edge => {
            const srcNode = nodes.find(n => n.id === edge.source);
            const tgtNode = nodes.find(n => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            const isConnectedToActive = selectedNodeId === edge.source || selectedNodeId === edge.target;

            return (
              <g key={edge.id}>
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={isConnectedToActive ? '#a1a1aa' : '#3f3f46'}
                  strokeWidth={isConnectedToActive ? 2 : 1.2}
                  strokeDasharray={isConnectedToActive ? 'none' : '4 3'}
                  markerEnd={isConnectedToActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                  className="transition-all duration-200"
                />
                
                {/* Edge Label Badge */}
                <rect
                  x={(srcNode.x + tgtNode.x) / 2 - 28}
                  y={(srcNode.y + tgtNode.y) / 2 - 8}
                  width="56"
                  height="16"
                  rx="2"
                  fill="#09090b"
                  stroke="#27272a"
                  strokeWidth="0.8"
                />
                <text
                  x={(srcNode.x + tgtNode.x) / 2}
                  y={(srcNode.y + tgtNode.y) / 2 + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Interactive Nodes */}
          {nodes.map(node => {
            const isSelected = node.id === selectedNodeId;
            const IconComponent = node.icon;

            let cardFill = '#18181b';
            let cardStroke = '#27272a';
            let titleColor = '#f4f4f5';

            if (node.isHigh) {
              cardFill = '#270e0f';
              cardStroke = '#9f1239';
              titleColor = '#fecdd3';
            } else if (isSelected) {
              cardStroke = '#71717a';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer group"
              >
                {/* Outer Selection Highlight Ring */}
                {isSelected && (
                  <rect
                    x="-76"
                    y="-36"
                    width="152"
                    height="72"
                    rx="6"
                    fill="none"
                    stroke={node.isHigh ? '#f43f5e' : '#a1a1aa'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Card Body */}
                <rect
                  x="-72"
                  y="-32"
                  width="144"
                  height="64"
                  rx="4"
                  fill={cardFill}
                  stroke={isSelected ? '#e4e4e7' : cardStroke}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  className="transition-all duration-200 group-hover:scale-105"
                />

                {/* Node Title & Icon */}
                <g transform="translate(-62, -20)">
                  <text
                    x="0"
                    y="0"
                    fill="#a1a1aa"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="700"
                    className="pointer-events-none uppercase tracking-wider"
                  >
                    {node.title}
                  </text>
                </g>

                <g transform="translate(48, -24)">
                  <IconComponent className={`w-3.5 h-3.5 ${node.isHigh ? 'text-rose-400' : 'text-zinc-400'}`} />
                </g>

                {/* Node Name */}
                <text
                  x="-62"
                  y="2"
                  fill={titleColor}
                  fontSize="8.5"
                  fontFamily="sans-serif"
                  fontWeight="700"
                  className="pointer-events-none select-none"
                >
                  {node.name.length > 18 ? node.name.substring(0, 16) + '...' : node.name}
                </text>

                {/* Node Subtext Values */}
                <text
                  x="-62"
                  y="14"
                  fill="#71717a"
                  fontSize="7.5"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {node.value}
                </text>
                <text
                  x="-62"
                  y="24"
                  fill="#52525b"
                  fontSize="7"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {node.subtext}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Telemetry Inspector Strip */}
      <div className="bg-zinc-950 border border-zinc-800 rounded p-3.5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>SELECTED_NODE: [{activeNode.title.toUpperCase()}]</span>
            <span className="text-zinc-500">ID: {activeNode.id}</span>
          </span>
          <span className="text-zinc-300 font-bold text-[11px]">{activeNode.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {inspectorData.map((item, idx) => (
            <div key={idx} className="bg-zinc-900 p-2 rounded border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">{item.key}</span>
              <span className="text-[11px] font-bold text-zinc-200 truncate block mt-0.5 whitespace-nowrap">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

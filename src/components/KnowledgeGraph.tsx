'use client';

import React, { useState } from 'react';
import { Network, Factory, Truck, Box, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { CarbonCalculation, ExtractedDocumentData, GraphNode, GraphEdge } from '@/types';

interface KnowledgeGraphProps {
  extracted: ExtractedDocumentData | null;
  calculation: CarbonCalculation | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ extracted, calculation }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-carbon');

  if (!extracted || !calculation) {
    return (
      <div className="h-64 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-xs">
        No graph data available
      </div>
    );
  }

  const isAnomaly = calculation.baselineComparison.isAnomaly;
  const severity = calculation.baselineComparison.anomalySeverity;

  // Build dynamic Graph Nodes based on current extraction
  const nodes: GraphNode[] = [
    {
      id: 'node-supplier',
      label: extracted.supplierName,
      type: 'SUPPLIER',
      value: extracted.supplierId,
      subtext: 'Primary Tier-1 Supplier',
      x: 100,
      y: 80
    },
    {
      id: 'node-material',
      label: extracted.materialName,
      type: 'MATERIAL',
      value: `${extracted.quantity.toLocaleString()} ${extracted.unit}`,
      subtext: calculation.matchedMaterialEF.name,
      x: 290,
      y: 70
    },
    {
      id: 'node-logistics',
      label: extracted.transportMode,
      type: 'LOGISTICS',
      value: `${extracted.distanceKm} km`,
      subtext: calculation.matchedTransportEF.name,
      x: 290,
      y: 190
    },
    {
      id: 'node-product',
      label: 'Assembly Hub 1 (Product Line A)',
      type: 'PRODUCT',
      value: extracted.poNumber,
      subtext: 'Manufacturing Facility',
      x: 480,
      y: 80
    },
    {
      id: 'node-carbon',
      label: 'Scope 3 Footprint',
      type: 'EMISSION_SCORE',
      severity: severity === 'CRITICAL' || severity === 'HIGH' ? 'HIGH' : severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
      value: `${calculation.totalEmissionsTCO2e} tCO2e`,
      subtext: isAnomaly ? '⚠️ High Carbon Anomaly' : '✓ Normal Emission Range',
      x: 480,
      y: 190
    }
  ];

  const edges: GraphEdge[] = [
    { id: 'edge-1', source: 'node-supplier', target: 'node-material', label: 'SUPPLIES' },
    { id: 'edge-2', source: 'node-supplier', target: 'node-logistics', label: 'TRANSPORTED_BY' },
    { id: 'edge-3', source: 'node-material', target: 'node-product', label: 'IN_PRODUCT' },
    { id: 'edge-4', source: 'node-material', target: 'node-carbon', label: 'EMITS' },
    { id: 'edge-5', source: 'node-logistics', target: 'node-carbon', label: 'EMITS' }
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[4];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            2
          </span>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Network className="w-4 h-4 text-emerald-400" />
            Pillar 2: Dynamic Supply Chain Knowledge Graph
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">Interactive Canvas</span>
      </div>

      {/* SVG Knowledge Graph Visualizer */}
      <div className="relative bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 overflow-hidden min-h-[260px] flex items-center justify-center">
        
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>

        <svg viewBox="0 0 580 250" className="w-full h-auto max-h-[260px] relative z-10">
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connections / Edges */}
          {edges.map(edge => {
            const srcNode = nodes.find(n => n.id === edge.source);
            const tgtNode = nodes.find(n => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;
            if (srcNode.x === undefined || srcNode.y === undefined || tgtNode.x === undefined || tgtNode.y === undefined) return null;

            const isConnectedToActive = selectedNodeId === edge.source || selectedNodeId === edge.target;

            return (
              <g key={edge.id}>
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={isConnectedToActive ? '#10b981' : '#334155'}
                  strokeWidth={isConnectedToActive ? 2.5 : 1.5}
                  strokeDasharray={isConnectedToActive ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />
                {/* Midpoint Label */}
                <rect
                  x={(srcNode.x + tgtNode.x) / 2 - 24}
                  y={(srcNode.y + tgtNode.y) / 2 - 8}
                  width="48"
                  height="14"
                  rx="3"
                  fill="#020617"
                  stroke="#1e293b"
                  strokeWidth="0.5"
                />
                <text
                  x={(srcNode.x + tgtNode.x) / 2}
                  y={(srcNode.y + tgtNode.y) / 2 + 2}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="600"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map(node => {
            const isSelected = node.id === selectedNodeId;

            let bgColor = '#0f172a';
            let strokeColor = '#334155';
            let textColor = '#f8fafc';

            if (node.type === 'EMISSION_SCORE') {
              if (node.severity === 'HIGH') {
                bgColor = '#450a0a';
                strokeColor = '#f43f5e';
                textColor = '#fda4af';
              } else if (node.severity === 'MEDIUM') {
                bgColor = '#451a03';
                strokeColor = '#f59e0b';
                textColor = '#fcd34d';
              } else {
                bgColor = '#064e3b';
                strokeColor = '#10b981';
                textColor = '#6ee7b7';
              }
            } else if (node.type === 'SUPPLIER') {
              strokeColor = '#06b6d4';
            } else if (node.type === 'MATERIAL') {
              strokeColor = '#10b981';
            } else if (node.type === 'LOGISTICS') {
              strokeColor = '#8b5cf6';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer group"
              >
                {/* Outer halo when selected */}
                {isSelected && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="animate-ping opacity-50"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r="24"
                  fill={bgColor}
                  stroke={isSelected ? '#38bdf8' : strokeColor}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter={isSelected ? 'url(#glow)' : undefined}
                  className="transition-all duration-200 group-hover:scale-110"
                />

                {/* Node Icon */}
                <g transform="translate(-8, -8)">
                  {node.type === 'SUPPLIER' && <Factory className="w-4 h-4 text-cyan-400" />}
                  {node.type === 'MATERIAL' && <Box className="w-4 h-4 text-emerald-400" />}
                  {node.type === 'LOGISTICS' && <Truck className="w-4 h-4 text-purple-400" />}
                  {node.type === 'PRODUCT' && <Box className="w-4 h-4 text-slate-300" />}
                  {node.type === 'EMISSION_SCORE' && (
                    node.severity === 'HIGH' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )
                  )}
                </g>

                {/* Label text below node */}
                <text
                  y="38"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="9"
                  fontWeight="700"
                  className="pointer-events-none select-none"
                >
                  {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                </text>
                <text
                  y="48"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  className="pointer-events-none select-none"
                >
                  {node.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Bar */}
      {activeNode && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Graph Node Selected ({activeNode.type})
              </div>
              <div className="font-semibold text-white text-xs">{activeNode.label}</div>
              <div className="text-[11px] text-slate-400">{activeNode.subtext}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Attribute Value</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">{activeNode.value}</span>
          </div>
        </div>
      )}

    </div>
  );
};

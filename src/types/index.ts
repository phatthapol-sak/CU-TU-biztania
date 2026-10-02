export interface ExtractedDocumentData {
  documentId: string;
  documentType: 'Invoice' | 'Waybill' | 'BOM';
  fileName: string;
  supplierId: string;
  supplierName: string;
  materialName: string;
  materialCategory: string;
  quantity: number; // in unit (e.g. kg)
  unit: string; // e.g. "kg", "tonnes"
  transportMode: 'Road Diesel Freight' | 'Electric Rail Freight' | 'Ocean Freight' | 'Air Freight';
  distanceKm: number;
  totalCostUSD: number;
  unitCostUSD: number;
  issueDate: string;
  poNumber: string;
}

export interface EmissionFactor {
  id: string;
  name: string;
  category: 'Material' | 'Transport';
  factorKgCO2ePerUnit: number; // e.g. 2.10 kgCO2e/kg or 0.105 kgCO2e/tonne-km
  unit: string; // "kgCO2e/kg" or "kgCO2e/tonne-km"
  source: string; // e.g. "DEFRA 2024", "TGO Standard"
  description: string;
}

export interface CarbonCalculation {
  materialEmissionsKgCO2e: number;
  transportEmissionsKgCO2e: number;
  totalEmissionsKgCO2e: number;
  totalEmissionsTCO2e: number;
  carbonIntensityPerUSD: number; // kgCO2e / $
  matchedMaterialEF: EmissionFactor;
  matchedTransportEF: EmissionFactor;
  baselineComparison: {
    baselineTCO2e: number;
    diffTCO2e: number;
    diffPercentage: number;
    isAnomaly: boolean;
    anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    anomalyReason: string;
  };
}

export interface OptimizationAlternative {
  id: string;
  supplierId: string;
  supplierName: string;
  materialName: string;
  transportMode: 'Road Diesel Freight' | 'Electric Rail Freight' | 'Ocean Freight' | 'Air Freight';
  distanceKm: number;
  unitCostUSD: number;
  totalCostUSD: number;
  estimatedEmissionsTCO2e: number;
  carbonReductionPercentage: number;
  costDiffPercentage: number;
  leadTimeDays: number;
  certifications: string[];
  location: string;
  recommendationScore: number;
}

export interface DocumentPreset {
  id: string;
  title: string;
  subtitle: string;
  documentType: 'Invoice' | 'Waybill' | 'BOM';
  fileName: string;
  extracted: ExtractedDocumentData;
  rawText: string;
  svgMockType: 'virgin_pp' | 'recycled_rpp' | 'cardboard';
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  pillar: 'Understand' | 'Remember' | 'Retrieve' | 'Reason' | 'Act';
  message: string;
  status: 'info' | 'warning' | 'success' | 'processing';
  details?: string;
}

export interface ERPActionLog {
  id: string;
  timestamp: string;
  actionType: 'GREEN_RFQ' | 'SUPPLIER_NEGOTIATION' | 'ERP_WEBHOOK';
  targetSupplier: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED';
  details: string;
  payload?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'SUPPLIER' | 'MATERIAL' | 'LOGISTICS' | 'EMISSION_SCORE' | 'PRODUCT';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  value?: string;
  subtext?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'SUPPLIES' | 'TRANSPORTED_BY' | 'IN_PRODUCT' | 'EMITS';
}

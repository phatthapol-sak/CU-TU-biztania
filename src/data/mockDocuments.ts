import { DocumentPreset } from '@/types';

export const MOCK_DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: 'doc-preset-1',
    title: 'Supplier A - Virgin PP Plastic Invoice',
    subtitle: 'High Carbon Anomaly | 8,000 kg Virgin Polypropylene',
    documentType: 'Invoice',
    fileName: 'INV-2026-SUPA-8841.pdf',
    svgMockType: 'virgin_pp',
    extracted: {
      documentId: 'INV-2026-SUPA-8841',
      documentType: 'Invoice',
      fileName: 'INV-2026-SUPA-8841.pdf',
      supplierId: 'SUP-001',
      supplierName: 'PetroChem Global Supplies Corp.',
      materialName: 'Virgin Polypropylene (PP) Polymer Resin Granules',
      materialCategory: 'Plastics & Polymers',
      quantity: 8000,
      unit: 'kg',
      transportMode: 'Road Diesel Freight',
      distanceKm: 650,
      totalCostUSD: 17600,
      unitCostUSD: 2.20,
      issueDate: '2026-09-28',
      poNumber: 'PO-99412'
    },
    rawText: `INVOICE #INV-2026-SUPA-8841
Vendor: PetroChem Global Supplies Corp. (ID: SUP-001)
Date: 28 September 2026 | Purchase Order: PO-99412
Bill To: GreenScope Enterprise Mfg Ltd.

Line Items:
1. Virgin Polypropylene (PP) Polymer Resin Granules
   Qty: 8,000.00 kg @ $2.20 / kg = $17,600.00 USD
   Material Specification: Prime fossil-based virgin homopolymer resin, Grade V-PP700.

Freight Details:
   Logistics Carrier: TransEast Freight Logistics
   Mode: Heavy Diesel Truck (Road)
   Origin: PetroChem Plant 4, Houston TX
   Destination: GreenScope Assembly Hub 1, Columbus OH
   Distance: 650 km

Total Invoice Amount: $17,600.00 USD
Payment Terms: Net 30`
  },
  {
    id: 'doc-preset-2',
    title: 'Supplier B - Recycled Polymer Waybill',
    subtitle: 'Medium Carbon | 6,000 kg Post-Consumer rPP',
    documentType: 'Waybill',
    fileName: 'WAYBILL-SUPB-2026-042.pdf',
    svgMockType: 'recycled_rpp',
    extracted: {
      documentId: 'WAYBILL-SUPB-2026-042',
      documentType: 'Waybill',
      fileName: 'WAYBILL-SUPB-2026-042.pdf',
      supplierId: 'SUP-002',
      supplierName: 'EcoPolymer Solutions Ltd.',
      materialName: 'Post-Consumer Recycled Polypropylene (rPP) Resin',
      materialCategory: 'Plastics & Polymers',
      quantity: 6000,
      unit: 'kg',
      transportMode: 'Electric Rail Freight',
      distanceKm: 450,
      totalCostUSD: 13680,
      unitCostUSD: 2.28,
      issueDate: '2026-09-29',
      poNumber: 'PO-99415'
    },
    rawText: `SHIPPING WAYBILL #WAYBILL-SUPB-2026-042
Shipper: EcoPolymer Solutions Ltd. (ID: SUP-002)
Date: 29 September 2026 | Ref PO: PO-99415
Consignee: GreenScope Enterprise Mfg Ltd.

Cargo Manifest:
1. Post-Consumer Recycled Polypropylene (rPP) Resin Pellets
   Net Weight: 6,000.00 kg @ $2.28 / kg = $13,680.00 USD
   Certification: GRS (Global Recycled Standard) 4.0 Verified

Logistics Routing:
   Carrier: GreenRail Logistics Express
   Transport Mode: Electrified Rail Cargo
   Route Distance: 450 km

Total Value Declaration: $13,680.00 USD`
  },
  {
    id: 'doc-preset-3',
    title: 'Supplier C - Packaging Cardboard',
    subtitle: 'Low Carbon Baseline | 3,000 kg Corrugated Packaging',
    documentType: 'BOM',
    fileName: 'BOM-SUPC-CARD-109.pdf',
    svgMockType: 'cardboard',
    extracted: {
      documentId: 'BOM-SUPC-CARD-109',
      documentType: 'BOM',
      fileName: 'BOM-SUPC-CARD-109.pdf',
      supplierId: 'SUP-003',
      supplierName: 'BioPack Sustainable Packaging Inc.',
      materialName: 'Corrugated Cardboard Packaging Box',
      materialCategory: 'Packaging Supplies',
      quantity: 3000,
      unit: 'kg',
      transportMode: 'Road Diesel Freight',
      distanceKm: 120,
      totalCostUSD: 2550,
      unitCostUSD: 0.85,
      issueDate: '2026-09-30',
      poNumber: 'PO-99420'
    },
    rawText: `BILL OF MATERIALS / DISPATCH #BOM-SUPC-CARD-109
Supplier: BioPack Sustainable Packaging Inc. (ID: SUP-003)
Date: 30 September 2026 | Ref PO: PO-99420

Component Specification:
1. Heavy-duty Corrugated Cardboard Packaging Boxes (75% Recycled Pulp)
   Qty: 3,000 kg @ $0.85 / kg = $2,550.00 USD

Transport:
   Carrier: Local Express Delivery
   Mode: Road Diesel Truck
   Distance: 120 km

Total Component Cost: $2,550.00 USD`
  }
];

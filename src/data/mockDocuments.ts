import { DocumentPreset } from '@/types';

export const MOCK_DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: 'doc-preset-1',
    title: 'Supplier A - Virgin PP Resin Invoice',
    subtitle: 'High Carbon Anomaly | 2,000 kg Virgin Polypropylene',
    documentType: 'Invoice',
    fileName: 'INV-2026-THAIPLUST-01.pdf',
    svgMockType: 'virgin_pp',
    extracted: {
      documentId: 'INV-2026-THAIPLUST-01',
      documentType: 'Invoice',
      fileName: 'INV-2026-THAIPLUST-01.pdf',
      supplierId: 'SUP-001',
      supplierName: 'Thai Plastics Industry Co., Ltd.',
      materialName: 'Virgin PP Resin (Virgin Polypropylene)',
      materialCategory: 'Plastics & Polymers',
      quantity: 2000,
      unit: 'kg',
      transportMode: 'Road Diesel Freight',
      distanceKm: 120,
      totalCostUSD: 100000,
      unitCostUSD: 50.00,
      issueDate: '2026-09-28',
      poNumber: 'PO-99412'
    },
    rawText: `INVOICE #INV-2026-THAIPLUST-01
Vendor: Thai Plastics Industry Co., Ltd. (ID: SUP-001)
Date: 28 September 2026 | Purchase Order: PO-99412
Bill To: GreenScope Enterprise Mfg Ltd.

Line Items:
1. Virgin Polypropylene (PP) Polymer Resin Granules
   Qty: 2,000.00 kg @ ฿50.00 THB / kg = ฿100,000.00 THB
   Material Specification: Prime fossil-based virgin homopolymer resin.

Freight Details:
   Logistics Carrier: TransEast Freight Logistics
   Mode: Heavy Diesel Truck (Road)
   Origin: Rayong Plant, Thailand
   Destination: GreenScope Assembly Hub 1, Chonburi
   Distance: 120 km

Total Invoice Amount: ฿100,000.00 THB
Payment Terms: Net 30`
  },
  {
    id: 'doc-preset-2',
    title: 'Supplier B - Recycled Polymer Waybill',
    subtitle: 'Medium Carbon | 4,000 kg Post-Consumer rPP',
    documentType: 'Waybill',
    fileName: 'WAYBILL-2026-THAIPOLY-02.pdf',
    svgMockType: 'recycled_rpp',
    extracted: {
      documentId: 'WAYBILL-2026-THAIPOLY-02',
      documentType: 'Waybill',
      fileName: 'WAYBILL-2026-THAIPOLY-02.pdf',
      supplierId: 'SUP-002',
      supplierName: 'Thai EcoPolymer Solutions Co., Ltd.',
      materialName: 'Post-Consumer Recycled Polypropylene (rPP) Resin',
      materialCategory: 'Plastics & Polymers',
      quantity: 4000,
      unit: 'kg',
      transportMode: 'Electric Rail Freight',
      distanceKm: 150,
      totalCostUSD: 232000,
      unitCostUSD: 58.00,
      issueDate: '2026-09-29',
      poNumber: 'PO-99415'
    },
    rawText: `SHIPPING WAYBILL #WAYBILL-2026-THAIPOLY-02
Shipper: Thai EcoPolymer Solutions Co., Ltd. (ID: SUP-002)
Date: 29 September 2026 | Ref PO: PO-99415
Consignee: GreenScope Enterprise Mfg Ltd.

Cargo Manifest:
1. Post-Consumer Recycled Polypropylene (rPP) Resin Pellets
   Net Weight: 4,000.00 kg @ ฿58.00 THB / kg = ฿232,000.00 THB
   Certification: GRS (Global Recycled Standard) 4.0 & TGO Eco-Label Verified

Logistics Routing:
   Carrier: GreenRail Logistics Express
   Transport Mode: Electrified Rail Cargo
   Route: Samut Prakan -> Chonburi (150 km)

Total Value Declaration: ฿232,000.00 THB`
  },
  {
    id: 'doc-preset-3',
    title: 'Supplier C - Packaging Cardboard',
    subtitle: 'Low Carbon Baseline | 3,000 kg Corrugated Packaging',
    documentType: 'BOM',
    fileName: 'BOM-2026-THAIPACK-03.pdf',
    svgMockType: 'cardboard',
    extracted: {
      documentId: 'BOM-2026-THAIPACK-03',
      documentType: 'BOM',
      fileName: 'BOM-2026-THAIPACK-03.pdf',
      supplierId: 'SUP-003',
      supplierName: 'Thai BioPack Packaging Co., Ltd.',
      materialName: 'Corrugated Cardboard Packaging Box',
      materialCategory: 'Packaging Supplies',
      quantity: 3000,
      unit: 'kg',
      transportMode: 'Road Diesel Freight',
      distanceKm: 80,
      totalCostUSD: 75000,
      unitCostUSD: 25.00,
      issueDate: '2026-09-30',
      poNumber: 'PO-99420'
    },
    rawText: `BILL OF MATERIALS / DISPATCH #BOM-2026-THAIPACK-03
Supplier: Thai BioPack Packaging Co., Ltd. (ID: SUP-003)
Date: 30 September 2026 | Ref PO: PO-99420

Component Specification:
1. Heavy-duty Corrugated Cardboard Packaging Boxes (75% Recycled Pulp)
   Qty: 3,000 kg @ ฿25.00 THB / kg = ฿75,000.00 THB

Transport:
   Carrier: Thai Green Logistics
   Mode: Road Diesel Truck
   Route: Saraburi -> Chonburi (80 km)

Total Component Cost: ฿75,000.00 THB`
  }
];
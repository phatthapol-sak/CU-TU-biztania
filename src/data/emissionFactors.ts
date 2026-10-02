import { EmissionFactor } from '@/types';

export const MATERIAL_EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'ef-mat-001',
    name: 'Virgin Polypropylene (PP) Polymer Resin',
    category: 'Material',
    factorKgCO2ePerUnit: 2.10,
    unit: 'kgCO2e/kg',
    source: 'DEFRA 2024 / Plastics Europe LCA',
    description: 'Fossil-fuel based primary virgin PP resin production cradle-to-gate.'
  },
  {
    id: 'ef-mat-002',
    name: 'Post-Consumer Recycled Polypropylene (rPP)',
    category: 'Material',
    factorKgCO2ePerUnit: 0.78,
    unit: 'kgCO2e/kg',
    source: 'TGO Standard / Ecoinvent 3.10',
    description: 'Mechanically recycled rPP pellets from post-consumer waste stream.'
  },
  {
    id: 'ef-mat-003',
    name: 'Corrugated Cardboard Packaging Box',
    category: 'Material',
    factorKgCO2ePerUnit: 0.95,
    unit: 'kgCO2e/kg',
    source: 'DEFRA 2024 Scope 3',
    description: 'Standard corrugated packaging material containing 75% recycled pulp.'
  },
  {
    id: 'ef-mat-004',
    name: 'Bio-based Polyethylene (Bio-PE)',
    category: 'Material',
    factorKgCO2ePerUnit: 0.45,
    unit: 'kgCO2e/kg',
    source: 'ISCC PLUS Certified LCA',
    description: 'Sugarcane ethanol-derived bio-polyethylene with negative biogenic carbon accounting offset.'
  },
  {
    id: 'ef-mat-005',
    name: 'Virgin High-Density Polyethylene (HDPE)',
    category: 'Material',
    factorKgCO2ePerUnit: 1.95,
    unit: 'kgCO2e/kg',
    source: 'DEFRA 2024',
    description: 'Virgin petrochemical HDPE granules.'
  }
];

export const TRANSPORT_EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'ef-trn-001',
    name: 'Road Diesel Freight (Heavy Duty Truck >3.5t)',
    category: 'Transport',
    factorKgCO2ePerUnit: 0.105,
    unit: 'kgCO2e/tonne-km',
    source: 'GLEC Framework v3.0 / DEFRA 2024',
    description: 'Heavy duty articulated diesel truck transport per tonne-kilometer.'
  },
  {
    id: 'ef-trn-002',
    name: 'Electric Rail Freight',
    category: 'Transport',
    factorKgCO2ePerUnit: 0.028,
    unit: 'kgCO2e/tonne-km',
    source: 'IEA Electric Rail Standard',
    description: 'Electrified freight train logistics utilizing grid power.'
  },
  {
    id: 'ef-trn-003',
    name: 'Ocean Freight Container Ship',
    category: 'Transport',
    factorKgCO2ePerUnit: 0.016,
    unit: 'kgCO2e/tonne-km',
    source: 'IMO GHG Study',
    description: 'Deep-sea container vessel shipping per tonne-km.'
  },
  {
    id: 'ef-trn-004',
    name: 'Air Freight Cargo Jet',
    category: 'Transport',
    factorKgCO2ePerUnit: 0.850,
    unit: 'kgCO2e/tonne-km',
    source: 'IATA Carbon Calculator',
    description: 'Dedicated air cargo freighter flight transport per tonne-km.'
  }
];

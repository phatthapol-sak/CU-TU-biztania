import { ExtractedDocumentData, CarbonCalculation, OptimizationAlternative, EmissionFactor } from '@/types';
import { MATERIAL_EMISSION_FACTORS, TRANSPORT_EMISSION_FACTORS } from '@/data/emissionFactors';

/**
 * Matches an extracted material trade name to the closest standard Emission Factor.
 */
export function matchMaterialEmissionFactor(materialName: string): EmissionFactor {
  const lower = materialName.toLowerCase();
  if (lower.includes('recycled') || lower.includes('rpp')) {
    return MATERIAL_EMISSION_FACTORS.find(ef => ef.id === 'ef-mat-002') || MATERIAL_EMISSION_FACTORS[1];
  }
  if (lower.includes('cardboard') || lower.includes('packaging')) {
    return MATERIAL_EMISSION_FACTORS.find(ef => ef.id === 'ef-mat-003') || MATERIAL_EMISSION_FACTORS[2];
  }
  if (lower.includes('bio') || lower.includes('sugarcane')) {
    return MATERIAL_EMISSION_FACTORS.find(ef => ef.id === 'ef-mat-004') || MATERIAL_EMISSION_FACTORS[3];
  }
  if (lower.includes('hdpe')) {
    return MATERIAL_EMISSION_FACTORS.find(ef => ef.id === 'ef-mat-005') || MATERIAL_EMISSION_FACTORS[4];
  }
  // Default to Virgin PP
  return MATERIAL_EMISSION_FACTORS.find(ef => ef.id === 'ef-mat-001') || MATERIAL_EMISSION_FACTORS[0];
}

/**
 * Matches an extracted transport mode string to standard Transport EF.
 */
export function matchTransportEmissionFactor(transportMode: string): EmissionFactor {
  const lower = transportMode.toLowerCase();
  if (lower.includes('rail') || lower.includes('train')) {
    return TRANSPORT_EMISSION_FACTORS.find(ef => ef.id === 'ef-trn-002') || TRANSPORT_EMISSION_FACTORS[1];
  }
  if (lower.includes('ocean') || lower.includes('ship') || lower.includes('sea')) {
    return TRANSPORT_EMISSION_FACTORS.find(ef => ef.id === 'ef-trn-003') || TRANSPORT_EMISSION_FACTORS[2];
  }
  if (lower.includes('air') || lower.includes('flight') || lower.includes('plane')) {
    return TRANSPORT_EMISSION_FACTORS.find(ef => ef.id === 'ef-trn-004') || TRANSPORT_EMISSION_FACTORS[3];
  }
  // Default to Road Diesel Freight
  return TRANSPORT_EMISSION_FACTORS.find(ef => ef.id === 'ef-trn-001') || TRANSPORT_EMISSION_FACTORS[0];
}

/**
 * Performs complete Scope 3 GHG emissions calculation & anomaly detection.
 */
export function calculateScope3Emissions(data: ExtractedDocumentData, baselineTCO2e: number = 8.5): CarbonCalculation {
  const matEF = matchMaterialEmissionFactor(data.materialName);
  const trnEF = matchTransportEmissionFactor(data.transportMode);

  // Material Emissions (kgCO2e) = Quantity (kg) * Material EF (kgCO2e/kg)
  const materialEmissionsKgCO2e = data.quantity * matEF.factorKgCO2ePerUnit;

  // Transport Emissions (kgCO2e) = Tonnage (tonnes) * Distance (km) * Transport EF (kgCO2e/tonne-km)
  const tonnage = data.quantity / 1000;
  const transportEmissionsKgCO2e = tonnage * data.distanceKm * trnEF.factorKgCO2ePerUnit;

  const totalEmissionsKgCO2e = materialEmissionsKgCO2e + transportEmissionsKgCO2e;
  const totalEmissionsTCO2e = Number((totalEmissionsKgCO2e / 1000).toFixed(2));

  const carbonIntensityPerUSD = Number((totalEmissionsKgCO2e / (data.totalCostUSD || 1)).toFixed(3));

  // Anomaly criteria: > 10 tCO2e OR > baseline + 25%
  const upperThreshold = Math.max(10.0, baselineTCO2e * 1.25);
  const isAnomaly = totalEmissionsTCO2e > upperThreshold;

  let anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let anomalyReason = 'Carbon emissions are within expected ESG baseline parameters.';

  if (totalEmissionsTCO2e > 15.0) {
    anomalySeverity = 'CRITICAL';
    anomalyReason = `Severe Carbon Spike: ${totalEmissionsTCO2e} tCO2e exceeds high-risk threshold of 10.0 tCO2e by ${Math.round(((totalEmissionsTCO2e - 10) / 10) * 100)}%. Primary driver is high-emission Virgin PP resin combined with long-distance road diesel transport.`;
  } else if (totalEmissionsTCO2e > 10.0) {
    anomalySeverity = 'HIGH';
    anomalyReason = `High Carbon Alert: Total footprint (${totalEmissionsTCO2e} tCO2e) exceeds 10.0 tCO2e limit due to un-recycled virgin raw materials and road freight.`;
  } else if (totalEmissionsTCO2e > baselineTCO2e) {
    anomalySeverity = 'MEDIUM';
    anomalyReason = `Moderate Footprint: ${totalEmissionsTCO2e} tCO2e is slightly above baseline (${baselineTCO2e} tCO2e). Optimization recommended.`;
  }

  return {
    materialEmissionsKgCO2e: Number(materialEmissionsKgCO2e.toFixed(1)),
    transportEmissionsKgCO2e: Number(transportEmissionsKgCO2e.toFixed(1)),
    totalEmissionsKgCO2e: Number(totalEmissionsKgCO2e.toFixed(1)),
    totalEmissionsTCO2e,
    carbonIntensityPerUSD,
    matchedMaterialEF: matEF,
    matchedTransportEF: trnEF,
    baselineComparison: {
      baselineTCO2e,
      diffTCO2e: Number((totalEmissionsTCO2e - baselineTCO2e).toFixed(2)),
      diffPercentage: Number((((totalEmissionsTCO2e - baselineTCO2e) / baselineTCO2e) * 100).toFixed(1)),
      isAnomaly,
      anomalySeverity,
      anomalyReason
    }
  };
}

/**
 * Multi-Objective Optimizer: Generates green procurement alternative scenarios.
 */
export function generateGreenAlternatives(
  currentData: ExtractedDocumentData,
  currentCalculation: CarbonCalculation
): OptimizationAlternative[] {
  const currentTotalEmissions = currentCalculation.totalEmissionsTCO2e;

  // Alternative 1: Recycled rPP via Electric Rail (Supplier D - EcoPolymer Ltd)
  const rppMatEF = MATERIAL_EMISSION_FACTORS[1].factorKgCO2ePerUnit; // 0.78
  const railTrnEF = TRANSPORT_EMISSION_FACTORS[1].factorKgCO2ePerUnit; // 0.028
  const alt1Distance = 420;
  const alt1Quantity = currentData.quantity;
  const alt1Tonnage = alt1Quantity / 1000;
  
  const alt1MatEmissions = (alt1Quantity * rppMatEF) / 1000;
  const alt1TrnEmissions = (alt1Tonnage * alt1Distance * railTrnEF) / 1000;
  const alt1TotalEmissions = Number((alt1MatEmissions + alt1TrnEmissions).toFixed(2));

  const alt1UnitCost = 2.29; // +4.09% over $2.20
  const alt1TotalCost = alt1Quantity * alt1UnitCost;

  const alt1CarbonRed = Number((((currentTotalEmissions - alt1TotalEmissions) / currentTotalEmissions) * 100).toFixed(1));
  const alt1CostDiff = Number((((alt1TotalCost - currentData.totalCostUSD) / currentData.totalCostUSD) * 100).toFixed(1));

  // Alternative 2: Bio-based Bio-PE via Ocean Shipping (Supplier E - BioPlast International)
  const bioMatEF = MATERIAL_EMISSION_FACTORS[3].factorKgCO2ePerUnit; // 0.45
  const oceanTrnEF = TRANSPORT_EMISSION_FACTORS[2].factorKgCO2ePerUnit; // 0.016
  const alt2Distance = 1200;
  const alt2MatEmissions = (alt1Quantity * bioMatEF) / 1000;
  const alt2TrnEmissions = (alt1Tonnage * alt2Distance * oceanTrnEF) / 1000;
  const alt2TotalEmissions = Number((alt2MatEmissions + alt2TrnEmissions).toFixed(2));

  const alt2UnitCost = 2.45; // +11.36% over $2.20
  const alt2TotalCost = alt1Quantity * alt2UnitCost;
  const alt2CarbonRed = Number((((currentTotalEmissions - alt2TotalEmissions) / currentTotalEmissions) * 100).toFixed(1));
  const alt2CostDiff = Number((((alt2TotalCost - currentData.totalCostUSD) / currentData.totalCostUSD) * 100).toFixed(1));

  return [
    {
      id: 'alt-opt-1',
      supplierId: 'SUP-004',
      supplierName: 'EcoPolymer Solutions Ltd.',
      materialName: 'Post-Consumer Recycled Polypropylene (rPP Grade Eco-100)',
      transportMode: 'Electric Rail Freight',
      distanceKm: alt1Distance,
      unitCostUSD: alt1UnitCost,
      totalCostUSD: alt1TotalCost,
      estimatedEmissionsTCO2e: alt1TotalEmissions,
      carbonReductionPercentage: alt1CarbonRed,
      costDiffPercentage: alt1CostDiff,
      leadTimeDays: 4,
      certifications: ['GRS 4.0 Verified', 'ISO 14064 Carbon Audited', 'REACH Compliant'],
      location: 'Cleveland, OH (Rail Terminal Hub)',
      recommendationScore: 96
    },
    {
      id: 'alt-opt-2',
      supplierId: 'SUP-005',
      supplierName: 'BioPlast NextGen International',
      materialName: 'ISCC+ Certified Sugarcane Bio-PE Polymer',
      transportMode: 'Ocean Freight',
      distanceKm: alt2Distance,
      unitCostUSD: alt2UnitCost,
      totalCostUSD: alt2TotalCost,
      estimatedEmissionsTCO2e: alt2TotalEmissions,
      carbonReductionPercentage: alt2CarbonRed,
      costDiffPercentage: alt2CostDiff,
      leadTimeDays: 7,
      certifications: ['ISCC PLUS', 'USDA BioBased 92%', 'BPI Compostable'],
      location: 'Savannah Port GA',
      recommendationScore: 88
    }
  ];
}

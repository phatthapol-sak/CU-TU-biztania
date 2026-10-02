import { NextResponse } from 'next/server';
import { extractDocumentWithAI } from '@/lib/gemini';
import { calculateScope3Emissions, generateGreenAlternatives } from '@/lib/calculator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { presetId, fileBase64, fileName } = body;

    // 1. Multimodal Extraction
    const { extracted, source } = await extractDocumentWithAI(fileBase64, fileName, presetId);

    // 2. Emission Calculation & Anomaly Reasoning
    const calculation = calculateScope3Emissions(extracted);

    // 3. Multi-objective Optimization Alternatives
    const alternatives = generateGreenAlternatives(extracted, calculation);

    return NextResponse.json({
      success: true,
      extracted,
      calculation,
      alternatives,
      source
    });
  } catch (error: unknown) {
    console.error('Error in /api/extract:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to extract document data' },
      { status: 500 }
    );
  }
}

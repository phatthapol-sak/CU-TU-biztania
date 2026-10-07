import { ExtractedDocumentData } from '@/types';
import { MOCK_DOCUMENT_PRESETS } from '@/data/mockDocuments';

export async function extractDocumentWithAI(
  fileBase64?: string,
  fileName?: string,
  presetId?: string
): Promise<{ extracted: ExtractedDocumentData; source: 'Gemini Vision AI' | 'Preset Mock Engine' }> {
  // If preset ID is requested
  if (presetId) {
    const matched = MOCK_DOCUMENT_PRESETS.find(p => p.id === presetId);
    if (matched) {
      return {
        extracted: matched.extracted,
        source: 'Preset Mock Engine'
      };
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey && fileBase64) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analyze this supply chain document (invoice, BOM, or waybill).
Extract the details into a strict JSON object with the following schema:
{
  "documentId": "string (invoice/waybill number)",
  "documentType": "Invoice | Waybill | BOM",
  "fileName": "string",
  "supplierId": "string",
  "supplierName": "string",
  "materialName": "string",
  "materialCategory": "string",
  "quantity": number (in kg or tonnes converted to kg),
  "unit": "kg",
  "transportMode": "Road Diesel Freight | Electric Rail Freight | Ocean Freight | Air Freight",
  "distanceKm": number,
  "totalCostUSD": number (total monetary amount in Thai Baht THB or invoice currency),
  "unitCostUSD": number (unit price per kg),
  "issueDate": "YYYY-MM-DD",
  "poNumber": "string"
}

If the document is a Thai procurement invoice, prices are in Thai Baht (฿ THB). Extract the raw numbers directly.
Return ONLY valid JSON.`;

      // Split mime type and base64 string if data URI
      const mimeType = fileBase64.startsWith('data:') 
        ? fileBase64.split(';')[0].replace('data:', '')
        : 'image/png';
      
      const cleanBase64 = fileBase64.includes(',') 
        ? fileBase64.split(',')[1] 
        : fileBase64;

      const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      let responseText = '';

      for (const modelName of candidateModels) {
        try {
          const res = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: cleanBase64,
                      mimeType
                    }
                  },
                  { text: prompt }
                ]
              }
            ]
          });

          if (res && res.text) {
            responseText = res.text;
            break;
          }
        } catch {
          // continue to next model candidate
        }
      }

      if (responseText) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            extracted: parsed as ExtractedDocumentData,
            source: 'Gemini Vision AI'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini Vision extraction fell back to local schema parser:', err);
    }
  }

  // Fallback heuristic extraction for uploaded files when API key is not active
  const lowerFileName = (fileName || '').toLowerCase();
  let fallbackExtracted: ExtractedDocumentData;

  if (lowerFileName.includes('waybill') || lowerFileName.includes('recycled') || lowerFileName.includes('rpp') || lowerFileName.includes('ecopolymer')) {
    fallbackExtracted = {
      documentId: 'WAYBILL-2026-THAIPOLY-02',
      documentType: 'Waybill',
      fileName: fileName || 'WAYBILL-2026-THAIPOLY-02.pdf',
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
    };
  } else if (lowerFileName.includes('bom') || lowerFileName.includes('pack') || lowerFileName.includes('cardboard')) {
    fallbackExtracted = {
      documentId: 'BOM-2026-THAIPACK-03',
      documentType: 'BOM',
      fileName: fileName || 'BOM-2026-THAIPACK-03.pdf',
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
    };
  } else {
    // Default Virgin PP Invoice matching Biztania pitch deck scenario (2,000 kg @ ฿50 = ฿100,000 THB)
    fallbackExtracted = {
      documentId: 'INV-2026-THAIPLUST-01',
      documentType: 'Invoice',
      fileName: fileName || 'INV-2026-THAIPLUST-01.pdf',
      supplierId: 'SUP-001',
      supplierName: 'Thai Plastics Industry Co., Ltd.',
      materialName: 'Virgin Polypropylene (PP) Polymer Resin Granules',
      materialCategory: 'Plastics & Polymers',
      quantity: 2000,
      unit: 'kg',
      transportMode: 'Road Diesel Freight',
      distanceKm: 120,
      totalCostUSD: 100000,
      unitCostUSD: 50.00,
      issueDate: '2026-09-28',
      poNumber: 'PO-99412'
    };
  }

  return {
    extracted: fallbackExtracted,
    source: 'Preset Mock Engine'
  };
}

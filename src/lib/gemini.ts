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
  "totalCostUSD": number,
  "unitCostUSD": number,
  "issueDate": "YYYY-MM-DD",
  "poNumber": "string"
}

Return ONLY valid JSON.`;

      // Split mime type and base64 string if data URI
      const mimeType = fileBase64.startsWith('data:') 
        ? fileBase64.split(';')[0].replace('data:', '')
        : 'image/png';
      
      const cleanBase64 = fileBase64.includes(',') 
        ? fileBase64.split(',')[1] 
        : fileBase64;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
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

  // Fallback heuristic mock extraction for uploaded files when API key is not active
  const fallbackExtracted: ExtractedDocumentData = {
    documentId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    documentType: 'Invoice',
    fileName: fileName || 'Uploaded_SupplyChain_Doc.pdf',
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
    issueDate: new Date().toISOString().split('T')[0],
    poNumber: 'PO-99412'
  };

  return {
    extracted: fallbackExtracted,
    source: 'Preset Mock Engine'
  };
}

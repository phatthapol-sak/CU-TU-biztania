import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = 
  process.env.GOOGLE_APPS_SCRIPT_URL || 
  process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 
  process.env.GOOGLE_SHEET_WEBHOOK_URL || 
  "";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || (!data.documentId && !data.materialName)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document payload' },
        { status: 400 }
      );
    }

    const payload = {
      material_id: data.supplierId || data.materialId || ('MAT-00' + Date.now().toString().slice(-2)),
      material_name: data.materialName,
      emission_factor: data.materialName?.toLowerCase().includes('recycled') || data.materialName?.toLowerCase().includes('rpp') ? 0.78 : 2.10,
      supplier_name: data.supplierName,
      price_per_kg: data.unitCostUSD || data.price_per_kg || 50,
      lead_time_days: 2,
      plan_type: 'Staged PO',
      recommendation: `PO: ${data.poNumber || 'PO-99412'} | Transport: ${data.transportMode || 'Road Freight'} (${data.distanceKm || 120} km)`
    };

    let result: Record<string, unknown> = { status: 'mock_appended', payload };

    if (APPS_SCRIPT_URL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });

        const responseText = await res.text();
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { status: 'posted', rawResponse: responseText };
        }
      } catch (scriptErr) {
        console.warn('Google Apps Script POST fallback to mock engine:', scriptErr);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      transactionId: `TX-SHEET-${Date.now()}`,
      newDoc: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    return NextResponse.json({ success: false, error: 'Write failed' }, { status: 500 });
  }
}

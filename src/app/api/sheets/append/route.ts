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
      emission_factor: data.emissionFactor ?? (data.materialName?.toLowerCase().includes('recycled') || data.materialName?.toLowerCase().includes('rpp') ? 0.50 : 1.63),
      supplier_name: data.supplierName,
      price_per_kg: data.unitCostUSD || data.price_per_kg || 50,
      lead_time_days: data.leadTimeDays || 2,
      plan_type: 'Staged PO',
      recommendation: `PO: ${data.poNumber || 'PO-99412'} | Transport: ${data.transportMode || 'Road Freight'} (${data.distanceKm || 120} km)`,
      // Additional fields for round-trip data integrity (BUG-007)
      document_id: data.documentId,
      quantity: data.quantity,
      unit: data.unit || 'kg',
      distance_km: data.distanceKm,
      total_cost: data.totalCostUSD,
      issue_date: data.issueDate,
      po_number: data.poNumber,
      transport_mode: data.transportMode,
      material_category: data.materialCategory,
    };

    let result: Record<string, unknown> = { status: 'mock_appended', payload };
    let writeSuccess = false;

    if (APPS_SCRIPT_URL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });

        if (!res.ok) {
          throw new Error(`Apps Script responded with HTTP ${res.status}`);
        }

        const responseText = await res.text();
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { status: 'posted', rawResponse: responseText };
        }
        writeSuccess = true;
      } catch (scriptErr) {
        console.error('Google Apps Script POST failed:', scriptErr);
        return NextResponse.json(
          { success: false, error: 'Failed to write to Google Sheet via Apps Script', details: String(scriptErr) },
          { status: 502 }
        );
      }
    } else {
      // No webhook URL configured — mock/dev mode
      writeSuccess = true;
    }

    return NextResponse.json({
      success: writeSuccess,
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

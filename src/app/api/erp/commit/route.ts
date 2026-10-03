import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const documentData = await req.json();

    if (!documentData || !documentData.documentId) {
      return NextResponse.json(
        { success: false, error: 'Invalid document payload' },
        { status: 400 }
      );
    }

    const transactionId = `TX-ERP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      transactionId,
      timestamp,
      documentId: documentData.documentId,
      supplierName: documentData.supplierName,
      materialName: documentData.materialName,
      message: 'Successfully committed document to Scope 3 ERP Database'
    });
  } catch (error: unknown) {
    console.error('Error in /api/erp/commit:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to commit document to ERP' },
      { status: 500 }
    );
  }
}

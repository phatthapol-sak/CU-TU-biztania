import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4";
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

export async function GET() {
  try {
    const freshUrl = `${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`;
    const res = await fetch(freshUrl, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sheet: ${res.statusText}`);
    }

    const csvText = await res.text();
    return new NextResponse(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
}

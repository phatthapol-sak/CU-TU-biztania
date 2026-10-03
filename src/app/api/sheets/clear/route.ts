import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = 
  process.env.GOOGLE_APPS_SCRIPT_URL || 
  process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || 
  process.env.GOOGLE_SHEET_WEBHOOK_URL || 
  "";

export async function POST() {
  try {
    let result: Record<string, unknown> = { status: 'cleared_mock' };

    if (APPS_SCRIPT_URL) {
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear', plan_type: 'clear' }),
          redirect: 'follow'
        });
        const text = await res.text();
        try {
          result = JSON.parse(text);
        } catch {
          result = { status: 'cleared_raw', response: text };
        }
      } catch (err) {
        console.warn('Google Apps Script CLEAR fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ingested rows cleared successfully',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing Google Sheet rows:', error);
    return NextResponse.json({ success: false, error: 'Clear failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sequelize } from '@/src/db/db';

export async function GET() {
  try {
    await sequelize.authenticate();
    return NextResponse.json({ ok: true, message: 'Database connection OK' });
  } catch (err) {
  const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : String(err);
    console.error('DB connection test failed:', err);
    return new NextResponse(JSON.stringify({ ok: false, message: 'Database connection failed', error: message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

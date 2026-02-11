import { NextResponse } from 'next/server';
//trying something new here
export const runtime = 'nodejs';

export async function GET() {
  const raw = process.env.DATABASE_URL ?? '';
  let hostname = '';
  try {
    hostname = new URL(raw).hostname;
  } catch {
    hostname = 'INVALID_DATABASE_URL';
  }
  return NextResponse.json({
    hostname,
    rawLength: raw.length,
    hostnameLength: hostname.length,
  });
}

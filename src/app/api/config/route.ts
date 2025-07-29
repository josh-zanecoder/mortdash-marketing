import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mortdash_ae_url: process.env.NEXT_PUBLIC_MORTDASH_AE_URL,
  });
} 
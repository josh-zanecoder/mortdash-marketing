import { NextRequest, NextResponse } from 'next/server';
import { getMortdashAEUrlFromRequest } from '@/utils/mortdash';

export async function GET(req: NextRequest) {
  const mortdash_ae_url = getMortdashAEUrlFromRequest(req);
  return NextResponse.json({
    mortdash_ae_url: mortdash_ae_url,
  });
} 
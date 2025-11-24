import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMarketingApiBaseUrl } from '@/utils/mortdash';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.post(
      `${marketingApiUrl}/api/v1/campaigns/${id}/cancel`,
      {},
      {
        headers: {
          'accept': 'application/json',
          'x-client-origin': clientOrigin,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}


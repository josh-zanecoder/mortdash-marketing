import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const campaignId = params.id;

  try {
    // Temporarily use localhost:3000 for marketing-api
    const marketingApiUrl = 'http://localhost:3000';
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.post(
      `${marketingApiUrl}/api/v1/marketing-campaigns/${campaignId}/duplicate`,
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

import { NextRequest, NextResponse } from 'next/server';
import { getMarketingApiBaseUrl } from '@/utils/mortdash';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const res = await axios.get(
      `${marketingApiUrl}/api/v1/email-templates/paginated`,
      {
        params: {
          page,
          limit,
        },
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
    console.error('Error fetching paginated email templates:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch email templates',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}


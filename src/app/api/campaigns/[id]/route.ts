import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMarketingApiBaseUrl } from '@/utils/mortdash';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const campaignId = params.id;

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.get(
      `${marketingApiUrl}/api/v1/marketing-campaigns/${campaignId}`,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;
  const body = await request.json();

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.put(
      `${marketingApiUrl}/api/v1/marketing-campaigns/${id}`,
      body,
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

// Also support PATCH for compatibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Forward PATCH requests to PUT handler
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.delete(
      `${marketingApiUrl}/api/v1/marketing-campaigns/${id}`,
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

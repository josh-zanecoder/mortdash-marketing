import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  try {
    // Temporarily use localhost:3000 for marketing-api
    const marketingApiUrl = 'http://localhost:3000';
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    
    // Get pagination query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const res = await axios.get(
      `${marketingApiUrl}/api/v1/marketing-campaigns/paginated?page=${page}&limit=${limit}`,
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

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    // Temporarily use localhost:3000 for marketing-api
    const marketingApiUrl = 'http://localhost:3000';
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    
    const body = await request.json();

    const res = await axios.post(
      `${marketingApiUrl}/api/v1/marketing-campaigns`,
      body,
      {
        headers: {
          'accept': 'application/json',
          'x-client-origin': clientOrigin,
          'Authorization': `Bearer ${token}`,
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


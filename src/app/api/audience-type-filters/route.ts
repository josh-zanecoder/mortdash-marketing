import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    // Temporarily use localhost:3000 for marketing-api
    const marketingApiUrl = 'http://localhost:3000';
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    
    // Get audienceTypeId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const audienceTypeId = searchParams.get('audienceTypeId');

    // Build the URL with query parameter
    let url = `${marketingApiUrl}/api/v1/audience-type-filters`;
    if (audienceTypeId) {
      url += `?audienceTypeId=${audienceTypeId}`;
    }

    const res = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-client-origin': clientOrigin,
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

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


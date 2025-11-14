import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const audienceTypeId = request.nextUrl.searchParams.get('audienceTypeId');
 
  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    const mortdash_url = getMortdashUrlFromRequest(request);
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    
    // Build URL with audienceTypeId query param if provided
    let url = `http://localhost:3000/api/v1/audience-type-filters`;
    if (audienceTypeId) {
      url += `?audienceTypeId=${audienceTypeId}`;
    }
    
    const res = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-client-origin': clientOrigin,
      },
      validateStatus: () => true,
    });

    const contentType = res.headers['content-type'];
    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', backend: res.data, status: 401 },
        { status: 401 }
      );
    }
    if (contentType && contentType.includes('application/json')) {
      return NextResponse.json(res.data, { status: res.status });
    } else {
      return NextResponse.json(
        { error: 'Expected JSON from backend', status: res.status, body: res.data },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}
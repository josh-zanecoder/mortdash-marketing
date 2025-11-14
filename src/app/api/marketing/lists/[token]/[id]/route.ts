import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(request: NextRequest, context: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await context.params;

  try {
    const mortdash_url = getMortdashUrlFromRequest(request);
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    const res = await axios.get(`http://localhost:3000/api/v1/marketing-lists/${id}`, {
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

export async function PUT(request: NextRequest, context: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await context.params;

  try {
    const body = await request.json();
    const mortdash_url = getMortdashUrlFromRequest(request);
    const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;
    const res = await axios.put(`${baseUrl}/account-executive/update-marketing-list/${id}`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await context.params;

  try {
    const mortdash_url = getMortdashUrlFromRequest(request);
    const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;
    const res = await axios.delete(`${baseUrl}/account-executive/delete-marketing-list/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
} 
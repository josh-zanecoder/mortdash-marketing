import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

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
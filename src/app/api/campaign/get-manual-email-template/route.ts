import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/get-manual-email-template-fields-by-template-id`;

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const backendRequestUrl = `${backendUrl}?id=${encodeURIComponent(id)}`;
    const response = await axios.get(backendRequestUrl, { headers, validateStatus: () => true });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.response?.data }, { status: error.response?.status || 500 });
  }
}

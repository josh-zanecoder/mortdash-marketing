import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/get-email-template-by-bank-v2`;

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const audience_type_id = url.searchParams.get('audience_type_id');
    const is_archived = url.searchParams.get('is_archived') ?? 'false';
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    if (audience_type_id) {
      params.set('audience_type_id', audience_type_id);
    }
    params.set('is_archived', is_archived);

    const backendRequestUrl = `${backendUrl}?${params.toString()}`;
    const response = await axios.get(backendRequestUrl, { headers, validateStatus: () => true });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.response?.data }, { status: error.response?.status || 500 });
  }
}

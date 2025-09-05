import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const id = url.searchParams.get('id');
    const marketing_list_id = url.searchParams.get('marketing_list_id');
    if (!id || !marketing_list_id) {
      return NextResponse.json({ error: 'Missing id or marketing_list_id parameter' }, { status: 400 });
    }
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const mortdash_url = getMortdashUrlFromRequest(req);
    const backendUrl = `${mortdash_url}/api/bank/v1/marketing/get-email-template-content`;
    const backendRequestUrl = `${backendUrl}?id=${id}&marketing_list_id=${marketing_list_id}`;
    const response = await axios.get(backendRequestUrl, { headers, validateStatus: () => true });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.response?.data }, { status: error.response?.status || 500 });
  }
}

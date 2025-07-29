import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/account-executive/get-archived-email-templates`;

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const audience_type_id = url.searchParams.get('audience_type_id');
    const audience_type = url.searchParams.get('audience_type');
    const category = url.searchParams.get('category');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    // Handle both audience_type_id and audience_type parameters
    if (audience_type_id) {
      params.set('audience_type_id', audience_type_id);
    } else if (audience_type) {
      params.set('audience_type_id', audience_type);
    }
    if (category) {
      params.set('category', category);
    }
    // Set is_archived to 1 (number) for archived templates
    params.set('is_archived', '1');

    const backendRequestUrl = `${backendUrl}?${params.toString()}`;
    const response = await axios.get(backendRequestUrl, { headers, validateStatus: () => true });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.response?.data }, { status: error.response?.status || 500 });
  }
}

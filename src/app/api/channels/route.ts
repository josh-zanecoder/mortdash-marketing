import { NextRequest, NextResponse } from 'next/server';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';


export async function GET(req: NextRequest) {
    try {
      const currentUrl = req.nextUrl;
      const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const mortdash_url = getMortdashUrlFromRequest(req);
      
      const res = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-list-channels`, {
        headers,
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json({ error: 'Failed to fetch channels', details: error.message }, { status: 500 });
    }
  }
  
import { NextRequest, NextResponse } from 'next/server';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function POST(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const body = await req.json();
    
    // Proxy the request to your backend
    const mortdash_url = getMortdashUrlFromRequest(req);
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/email-template-archive-unarchive`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json(
        { error: 'Failed to archive/unarchive template', details: errorData },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error archiving/unarchiving template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

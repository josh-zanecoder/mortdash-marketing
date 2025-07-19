import { NextRequest, NextResponse } from 'next/server';
import { mortdash_url } from '@/config/mortdash';

export async function GET(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Proxy the request to your backend
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/audience-types`, {
      method: 'GET',
      headers,
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json(
        { error: 'Failed to fetch audience types', details: errorData },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching audience types:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

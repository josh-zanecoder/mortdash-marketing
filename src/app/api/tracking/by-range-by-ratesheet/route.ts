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

    // Get query parameters from the request
    const searchParams = currentUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const ratesheetId = searchParams.get('ratesheet_id');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Build the query string for the backend
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (ratesheetId) queryParams.append('ratesheet_id', ratesheetId);
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    // Proxy the request to your backend
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/get-transactional-email-by-range-by-ratesheet?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json(
        { error: 'Failed to fetch tracking data by ratesheet', details: errorData },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching tracking data by ratesheet:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

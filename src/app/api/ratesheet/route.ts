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
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/get-latest-rate-sheet`, {
      method: 'GET',
      headers,
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json({ 
        error: 'Failed to fetch latest rate sheet', 
        details: errorData 
      }, { status: backendRes.status });
    }

    // Check if the response is a file (Excel) or JSON
    const contentType = backendRes.headers.get('content-type');
    
    if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      // It's an Excel file, return it as a file download
      const fileBuffer = await backendRes.arrayBuffer();
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rate-sheet.xlsx"'
        }
      });
    } else {
      // It's JSON data
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error fetching latest rate sheet:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getMarketingApiBaseUrl } from '@/utils/mortdash';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data (file upload)
      const formData = await request.formData();
      
      // Forward the FormData directly to the backend
      const backendRes = await fetch(
        `${marketingApiUrl}/api/v1/email-templates`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'accept': 'application/json',
            'x-client-origin': clientOrigin,
            'Authorization': token ? `Bearer ${token}` : '',
            // Don't set Content-Type for FormData, let fetch set it with boundary
          },
        }
      );

      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } else {
      // Handle JSON data (fallback)
      const body = await request.json();

      const backendRes = await fetch(
        `${marketingApiUrl}/api/v1/email-templates`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'x-client-origin': clientOrigin,
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }
  } catch (error: any) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create email template',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.get(
      `${marketingApiUrl}/api/v1/email-templates`,
      {
        headers: {
          'accept': 'application/json',
          'x-client-origin': clientOrigin,
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }
    );

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch email templates',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}

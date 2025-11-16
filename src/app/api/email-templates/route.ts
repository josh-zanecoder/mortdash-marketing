import { NextRequest, NextResponse } from 'next/server';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await req.formData();
      
      // Convert FormData to the format expected by the backend
      const backendFormData = new FormData();
      
      // Add all form fields except audience_type_id
      for (const [key, value] of formData.entries()) {
        if (key !== 'audience_type_id') {
          backendFormData.append(key, value);
        }
      }

      // Get the audience_type_id
      const audienceTypeId = formData.get('audience_type_id');
      
      if (!audienceTypeId) {
        return NextResponse.json(
          { error: 'Missing audience_type_id' },
          { status: 400 }
        );
      }

      backendFormData.append('audience_type_id', audienceTypeId.toString());
      
      // Proxy the request to your backend
      const mortdash_url = getMortdashUrlFromRequest(req);
      const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/create-email-template`, {
        method: 'POST',
        headers: {
          ...headers,
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: backendFormData,
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.text();
        return NextResponse.json(
          { error: 'Failed to save email template', details: errorData },
          { status: backendRes.status }
        );
      }

      const data = await backendRes.json();
      return NextResponse.json(data);
    } else {
      // Handle JSON data (fallback)
      const body = await req.json();
      
      headers['Content-Type'] = 'application/json';
      
      // Proxy the request to your backend
      const mortdash_url = getMortdashUrlFromRequest(req);
      const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/create-email-template`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.text();
        return NextResponse.json(
          { error: 'Failed to save email template', details: errorData },
          { status: backendRes.status }
        );
      }

      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error saving email template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    // Temporarily use localhost:3000 for marketing-api
    const marketingApiUrl = 'http://localhost:3000';
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
    return NextResponse.json(
      {
        error: error.message,
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
} 
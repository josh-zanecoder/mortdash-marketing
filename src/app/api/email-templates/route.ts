import { NextRequest, NextResponse } from 'next/server';
import { mortdash_url } from '@/config/mortdash';

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
      
      // Add all form fields
      for (const [key, value] of formData.entries()) {
        if (key === 'file') {
          // File should be passed as is
          backendFormData.append(key, value);
        } else {
          // All other fields (including audience_type_id) should be passed as is
          backendFormData.append(key, value as string);
        }
      }
      
      // Proxy the request to your backend
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

export async function GET(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Proxy the request to your backend
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/email-templates`, {
      method: 'GET',
      headers,
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.text();
      return NextResponse.json(
        { error: 'Failed to fetch email templates', details: errorData },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 
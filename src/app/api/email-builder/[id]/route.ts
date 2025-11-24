import { NextRequest, NextResponse } from 'next/server';
import { getMarketingApiBaseUrl } from '@/utils/mortdash';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.get(
      `${marketingApiUrl}/api/v1/email-templates/${id}`,
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
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch email template',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;
  const contentType = request.headers.get('content-type') || '';

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    if (contentType.includes('multipart/form-data')) {
      // Handle file replacement - forwards FormData with the new HTML file
      // Backend will replace the file in S3 and update the path, preserving all other fields
      const formData = await request.formData();
      
      // Forward the FormData to backend - it will handle file upload and preserve existing template data
      const backendRes = await fetch(
        `${marketingApiUrl}/api/v1/email-templates/${id}`,
        {
          method: 'PUT',
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
      // Handle JSON data
      const body = await request.json();

      const res = await axios.put(
        `${marketingApiUrl}/api/v1/email-templates/${id}`,
        body,
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
    }
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to update email template',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Also support PATCH for compatibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Forward PATCH requests to PUT handler
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = await params;

  try {
    const marketingApiUrl = getMarketingApiBaseUrl();
    const clientOrigin = request.headers.get('x-client-origin') || request.nextUrl.origin;

    const res = await axios.delete(
      `${marketingApiUrl}/api/v1/email-templates/${id}`,
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
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete email template',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}


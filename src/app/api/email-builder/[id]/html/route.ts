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

    // First, get the template details to get the path
    const templateRes = await axios.get(
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

    if (templateRes.status !== 200 || !templateRes.data?.success || !templateRes.data?.data?.path) {
      return NextResponse.json(
        {
          error: 'Template not found or path not available',
          details: templateRes.data || null,
          status: templateRes.status || 404,
        },
        { status: templateRes.status || 404 }
      );
    }

    const templatePath = templateRes.data.data.path;

    // Fetch the HTML content from the S3 URL (with cache-busting to ensure fresh content)
    try {
      // Add cache-busting query parameter to S3 URL to ensure we get the latest version
      const cacheBuster = `?t=${Date.now()}`;
      const s3UrlWithCacheBuster = templatePath.includes('?') 
        ? `${templatePath}&t=${Date.now()}`
        : `${templatePath}${cacheBuster}`;
      
      const htmlResponse = await fetch(s3UrlWithCacheBuster, {
        cache: 'no-store', // Don't cache the fetch request
      });
      
      if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch HTML: ${htmlResponse.statusText}`);
      }

      const htmlContent = await htmlResponse.text();

      // Return the HTML content with no-cache headers to prevent browser caching
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch (htmlError: any) {
      console.error('Error fetching HTML from template path:', htmlError);
      return NextResponse.json(
        {
          error: 'Failed to fetch template HTML content',
          details: htmlError.message || 'Unknown error',
          status: 500,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching email template HTML:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch email template HTML',
        details: error.response?.data || null,
        status: error.response?.status || 500,
      },
      { status: error.response?.status || 500 }
    );
  }
}


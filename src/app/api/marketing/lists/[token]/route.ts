import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const baseUrl = 'http://localhost:1005/api/bank/v1/marketing';

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  console.log('Proxying with token:', token);

  try {
    const res = await axios.get(`${baseUrl}/account-executive/marketing-list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    console.log('Backend status:', res.status);
    console.log('Backend data:', res.data);

    const contentType = res.headers['content-type'];
    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized', backend: res.data, status: 401 },
        { status: 401 }
      );
    }
    if (contentType && contentType.includes('application/json')) {
      return NextResponse.json(res.data, { status: res.status });
    } else {
      return NextResponse.json(
        { error: 'Expected JSON from backend', status: res.status, body: res.data },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const body = await request.json();

  console.log('=== API ROUTE DEBUG ===');
  console.log('Token:', token);
  console.log('Body being sent to backend:', JSON.stringify(body, null, 2));

  try {
    console.log('Making request to:', `${baseUrl}/account-executive/marketing-list`);
    console.log('Full URL:', `${baseUrl}/account-executive/marketing-list`);
    
    // Test connectivity first
    try {
      const testRes = await axios.get(`${baseUrl.replace('/api/bank/v1/marketing', '')}/health`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      console.log('Backend health check status:', testRes.status);
    } catch (testError: any) {
      console.log('Backend health check failed:', testError.message);
    }
    
    const res = await axios.post(`${baseUrl}/account-executive/marketing-list`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
      timeout: 30000, // 30 second timeout
    });

    console.log('Backend response status:', res.status);
    console.log('Backend response headers:', res.headers);
    console.log('Backend response data:', JSON.stringify(res.data, null, 2));

    if (res.status >= 400) {
      console.log('Backend returned error status:', res.status);
      return NextResponse.json(res.data, { status: res.status });
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error('API route error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const mortdash_url = process.env.NEXT_PUBLIC_MORTDASH_BASE_URL || 'http://localhost:1005';
const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;


  try {
    const res = await axios.get(`${baseUrl}/account-executive/marketing-list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });



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

 

  try {
  
    // Test connectivity first
    try {
      const testRes = await axios.get(`${baseUrl.replace('/api/bank/v1/marketing', '')}/health`, {
        timeout: 5000,
        validateStatus: () => true,
      });
   
    } catch (testError: any) {
    
    }
    
    const res = await axios.post(`${baseUrl}/account-executive/marketing-list`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
      timeout: 30000, // 30 second timeout
    });

    

    if (res.status >= 400) {
   
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
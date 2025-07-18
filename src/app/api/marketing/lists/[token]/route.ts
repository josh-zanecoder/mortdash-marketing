import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const baseUrl = process.env.MORTDASH_BASE_URL || 'http://localhost:1005/api/bank/v1/marketing';

export async function GET(request: NextRequest, context: { params: { token: string } }) {
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
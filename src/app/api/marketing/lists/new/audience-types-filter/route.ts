import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const mortdash_url = process.env.NEXT_PUBLIC_MORTDASH_BASE_URL || 'http://localhost:1005';
const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('Proxying with token:', token);

  try {
    const res = await axios.get(`${baseUrl}/account-executive/audience-type-filters`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}
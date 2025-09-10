import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');


  try {
    const mortdash_url = getMortdashUrlFromRequest(request);
    const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;
    const res = await axios.get(`${baseUrl}/account-executive/bank-channels`, {
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
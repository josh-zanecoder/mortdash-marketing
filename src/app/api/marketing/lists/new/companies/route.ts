import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const mortdash_url = getMortdashUrlFromRequest(request);
    const res = await axios.get(`${mortdash_url}/api/bank/v1/marketing/groupByCompany`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    const data = rows
      .map((r: any) => ({ value: r.company, name: r.company }))
      .filter((x: any) => x.value);

    return NextResponse.json(
      { success: true, data, message: res.data?.message ?? 'Success' },
      { status: res.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data || null, status: error.response?.status || 500 },
      { status: error.response?.status || 500 }
    );
  }
}



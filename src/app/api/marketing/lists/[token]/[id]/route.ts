import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const mortdash_url = process.env.NEXT_PUBLIC_MORTDASH_BASE_URL || 'http://localhost:1005';
const baseUrl = `${mortdash_url}/api/bank/v1/marketing`;

export async function DELETE(request: NextRequest, context: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await context.params;

  try {
    const res = await axios.post(`${baseUrl}/account-executive/delete-marketing-list/${id}`, {}, {
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
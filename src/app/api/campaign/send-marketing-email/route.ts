import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/process-send-marketing-email`;

export async function POST(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const body = await req.json();

    // Validate required fields
    if (!body.template) {
      return NextResponse.json({ 
        success: false,
        error: 'Template ID is required' 
      }, { status: 400 });
    }

    if (!body.marketing_list_id) {
      return NextResponse.json({ 
        success: false,
        error: 'Marketing list ID is required' 
      }, { status: 400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await axios.post(backendUrl, body, { headers, validateStatus: () => true });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message, 
      details: error.response?.data 
    }, { status: error.response?.status || 500 });
  }
}

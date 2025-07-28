import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/send-test-email`;

export async function POST(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const body = await req.json();
    const { recipient, template, subject, name, template_type } = body;

    // Validate required fields
    if (!recipient || !template || !subject || !name || !template_type) {
      console.error('Missing required fields:', { recipient, subject, name, template_type });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }


    // Set up headers with auth token
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Call the backend API using axios
    const response = await axios.post(
      backendUrl,
      {
        recipient,
        name,
        subject,
        template,
        template_type,
      },
      { 
        headers,
        validateStatus: () => true // Allow any status code
      }
    );

  

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Error in send-test-email route:', {
      error: error.message,
      details: error.response?.data,
      mortdash_url
    });

    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        mortdash_url,
        error: error.response?.data
      } : undefined
    }, { status: error.response?.status || 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mortdash_url } from '@/config/mortdash';

const backendUrl = `${mortdash_url}/api/bank/v1/marketing/update-email-template`;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = req.nextUrl;
    const token = url.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing template id parameter' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Get the form data from the request
    const formData = await req.formData();
    
    // Forward the request to the backend
    const backendRequestUrl = `${backendUrl}/${encodeURIComponent(id)}`;
    const response = await axios.post(backendRequestUrl, formData, { 
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      },
      validateStatus: () => true 
    });
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return NextResponse.json({ 
      error: error.message, 
      details: error.response?.data 
    }, { 
      status: error.response?.status || 500 
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { mortdash_url } from '@/config/mortdash';
import jwt from 'jsonwebtoken';
import FormData from 'form-data';

function getUserIdFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded: any = jwt.verify(jwtToken, process.env.JWT_SECRET!);
    return decoded.user_id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from query or cookie
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Parse the incoming form data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    // Read the raw body as a buffer
    const body = await req.arrayBuffer();
    const buffer = Buffer.from(body);

    // Forward the request to the backend
    const backendRes = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-contacts/upload`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': contentType,
      },
      body: buffer,
    });

    const backendText = await backendRes.text();
    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to upload contacts', backend: backendText }, { status: backendRes.status });
    }
    let data;
    try {
      data = JSON.parse(backendText);
    } catch {
      data = backendText;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upload contacts', details: error.message }, { status: 500 });
  }
}

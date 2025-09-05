import { NextRequest, NextResponse } from 'next/server';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';
import jwt from 'jsonwebtoken';

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

export async function GET(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const page = currentUrl.searchParams.get('page');
    const limit = currentUrl.searchParams.get('limit');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Build backend URL with pagination params
    const mortdash_url = getMortdashUrlFromRequest(req);
    const backendUrl = new URL(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-contacts`);
    if (page) backendUrl.searchParams.set('page', page);
    if (limit) backendUrl.searchParams.set('limit', limit);
    const res = await fetch(backendUrl.toString(), {
      headers,
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch contacts', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Parse the body and inject owner_id
    const bodyObj = await req.json();
    const userId = getUserIdFromToken(token);
    if (userId) {
      bodyObj.owner_id = userId;
    }
    const body = JSON.stringify(bodyObj);
    const mortdash_url = getMortdashUrlFromRequest(req);
    const res = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-contacts`, {
      method: 'POST',
      headers,
      body,
    });
    const backendText = await res.text();
    if (!res.ok) {
      console.error('Backend error:', backendText);
      return NextResponse.json({ error: 'Failed to create contact', backend: backendText }, { status: res.status });
    }
    let data;
    try {
      data = JSON.parse(backendText);
    } catch {
      data = backendText;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create contact', details: error.message }, { status: 500 });
  }
}

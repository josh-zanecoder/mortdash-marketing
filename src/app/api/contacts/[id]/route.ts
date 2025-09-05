import { NextRequest, NextResponse } from 'next/server';
import { getMortdashUrlFromRequest } from '@/utils/mortdash';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = await req.text();
    const mortdash_url = getMortdashUrlFromRequest(req);
    const res = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-contacts/${id}`, {
      method: 'PUT',
      headers,
      body,
    });
    const backendText = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to update contact', backend: backendText }, { status: res.status });
    }
    let data;
    try { data = JSON.parse(backendText); } catch { data = backendText; }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update contact', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUrl = req.nextUrl;
    const token = currentUrl.searchParams.get('token') || req.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const mortdash_url = getMortdashUrlFromRequest(req);
    const res = await fetch(`${mortdash_url}/api/bank/v1/marketing/account-executive/marketing-contacts/${id}`, {
      method: 'DELETE',
      headers,
    });
    const backendText = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to delete contact', backend: backendText }, { status: res.status });
    }
    let data;
    try { data = JSON.parse(backendText); } catch { data = backendText; }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete contact', details: error.message }, { status: 500 });
  }
} 
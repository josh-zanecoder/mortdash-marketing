import { NextRequest, NextResponse } from 'next/server';
import { mortdash_url } from '@/config/mortdash';
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
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Build backend URL for clients with client members
      const backendUrl = new URL(`${mortdash_url}/api/bank/v1/marketing/get-all-clients-with-client-members`);
      const res = await fetch(backendUrl.toString(), {
        headers,
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: res.status });
      }
      const data = await res.json();
      // Transform to only include company and members (external_members)
      let result: { company: string; members: any[] }[] = [];
      if (Array.isArray(data.data)) {
        result = data.data.map((item: any) => ({
          company: item.company_name || item.name || 'Unknown',
          members: Array.isArray(item.external_members) ? item.external_members : [],
        }));
      }
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json({ error: 'Failed to fetch clients', details: error.message }, { status: 500 });
    }
  }

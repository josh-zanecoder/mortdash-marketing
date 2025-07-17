import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBeefreeCredentials } from '@/lib/beefree';

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    const { clientId, clientSecret } = getBeefreeCredentials();

    const response = await axios.post(
      'https://auth.getbee.io/loginV2',
      {
        client_id: clientId,
        client_secret: clientSecret,
        uid: uid || 'demo-user',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to authenticate', details: error.message }, { status: 500 });
  }
}

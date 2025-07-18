import { NextResponse } from 'next/server';
import axios from 'axios';

// Get environment variables
const BEE_CLIENT_ID = process.env.BEEFREE_CLIENT_ID;
const BEE_CLIENT_SECRET = process.env.BEEFREE_CLIENT_SECRET;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { uid = 'demo-user' } = body;

    // Validate environment variables
    if (!BEE_CLIENT_ID || !BEE_CLIENT_SECRET) {
      console.error('Missing Beefree credentials in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Make request to Beefree auth service
    const response = await axios.post(
      'https://auth.getbee.io/loginV2',
      {
        client_id: BEE_CLIENT_ID,
        client_secret: BEE_CLIENT_SECRET,
        uid
      },
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Return the auth token
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Auth error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
} 
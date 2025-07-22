import { NextResponse } from 'next/server';
import { mortdash_url } from '@/config/mortdash';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, html, subject, name, templateType } = body;

    // Validate required fields
    if (!recipient || !html || !subject || !name || !templateType) {
      console.error('Missing required fields:', { recipient, subject, name, templateType });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Sending test email request to backend:', {
      url: `${mortdash_url}/api/bank/v1/marketing/send-test-email`,
      recipient,
      name,
      subject,
      templateType
    });

    // Call the backend API
    const response = await fetch(`${mortdash_url}/api/bank/v1/marketing/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the auth cookie
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify({
        recipient,
        name,
        subject,
        template: html, // Send html content as template
        template_type: templateType,
      }),
    });

    const data = await response.json();
    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

    if (!response.ok) {
      throw new Error(data.message || `Backend returned ${response.status}: ${response.statusText}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in send-test-email route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      mortdash_url
    });

    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to send test email',
        details: process.env.NODE_ENV === 'development' ? {
          mortdash_url,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    );
  }
}

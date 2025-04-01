import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { profile, message_id } = body;

    if (!profile || !message_id) {
      console.error('Missing required fields:', { profile, message_id });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not configured');
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    const apiUrl = `${API_BASE_URL}/message/get_response`;
    console.log('Making request to:', apiUrl);

    const payload = {
      profile_id: profile,
      message_id: message_id
    };
    console.log('Request payload:', payload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in generate-response route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
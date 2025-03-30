import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profile, message_id } = await request.json();
    console.log('Request body:', { profile, message_id });

    if (!profile || !message_id) {
      return NextResponse.json(
        { error: 'Profile and message_id are required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('API_BASE_URL is not configured');
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/message/get_response`;
    console.log('Making request to:', apiUrl);
    console.log('Request payload:', JSON.stringify({ profile, message_id }, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile, message_id }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to generate response: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data, null, 2));

    // Ensure we're returning the response in a consistent format
    const formattedResponse = {
      reply: data.reply || data.response || 'No reply generated yet'
    };
    console.log('Formatted response:', JSON.stringify(formattedResponse, null, 2));

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
} 
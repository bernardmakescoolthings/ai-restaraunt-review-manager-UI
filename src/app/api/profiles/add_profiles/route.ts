import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  try {
    if (!API_BASE_URL) {
      throw new Error('API configuration is missing');
    }

    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/profiles/add_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add profile');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add profile' },
      { status: 500 }
    );
  }
} 
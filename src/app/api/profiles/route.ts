import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    if (!API_BASE_URL) {
      throw new Error('API configuration is missing');
    }

    const response = await fetch(`${API_BASE_URL}/profiles/fetch_profiles`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profiles');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
} 
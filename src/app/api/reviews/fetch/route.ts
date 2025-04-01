import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_username } = body;

    if (!business_username) {
      console.error('Missing business_username in request body');
      return NextResponse.json(
        { error: 'Business username is required' },
        { status: 400 }
      );
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      console.error('API configuration is missing');
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/reviews/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ business_username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API request failed:', {
        status: response.status,
        error: errorData
      });
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch reviews' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map the API response to match our frontend format
    const reviewsData = Array.isArray(data) ? data : data.reviews;
    if (!Array.isArray(reviewsData)) {
      console.error('Invalid data format received:', data);
      return NextResponse.json(
        { error: 'Invalid data format received from API' },
        { status: 500 }
      );
    }

    const mappedReviews = reviewsData
      .filter(review => review.review_text || review.text) // Filter out reviews with no text
      .map(review => ({
        id_review: review.id_review,
        rating: review.rating,
        review_text: review.review_text || review.text,
        timestamp: review.timestamp,
        user_name: review.username,
        n_review_user: review.n_review_user,
        reply: review.replies || 'No reply generated yet'
      }));

    return NextResponse.json({ reviews: mappedReviews });
  } catch (error) {
    console.error('Error in reviews fetch route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
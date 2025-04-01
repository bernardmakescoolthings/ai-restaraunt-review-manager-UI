'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types/review';
import ReviewTable from '@/components/ReviewTable';
import Link from 'next/link';

interface Metadata {
  total_reviews: number;
  average_rating: number;
  business_url: string;
}

interface BusinessData {
  business: {
    name: string | null;
    url: string;
    total_reviews: number;
  };
  reviews: Review[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get data from localStorage
        const businessData = localStorage.getItem('businessData');
        if (businessData) {
          const parsedData = JSON.parse(businessData);
          setReviews(parsedData.reviews);
          setMetadata(parsedData.metadata);
          setLoading(false);
          return;
        }

        // If no data in localStorage, redirect to home page
        window.location.href = '/';
      } catch (err) {
        setError('Failed to load reviews data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCopyBusinessUrl = () => {
    const businessUsername = localStorage.getItem('currentBusinessUsername');
    if (businessUsername) {
      navigator.clipboard.writeText(businessUsername);
      alert('Business username copied to clipboard!');
    } else {
      alert('No business username found. Please load a business first.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Reviews</h1>
          {metadata && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Total Reviews: {metadata.total_reviews}</p>
              <p>Average Rating: {metadata.average_rating.toFixed(1)} ★</p>
            </div>
          )}
        </div>
        <div className="space-x-4">
          <button
            onClick={handleCopyBusinessUrl}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Get Business Username
          </button>
          <Link 
            href="/profiles"
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Manage Profiles
          </Link>
          <Link 
            href="/"
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Load New Business
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReviewTable reviews={reviews} />
      </div>
    </div>
  );
} 
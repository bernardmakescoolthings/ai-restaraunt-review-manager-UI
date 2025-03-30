'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [businessUrl, setBusinessUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting business URL:', businessUrl);
      const response = await fetch('/api/reviews/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_url: businessUrl }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch business data');
      }

      if (!data.reviews) {
        throw new Error('No reviews data received');
      }

      // Store the business URL in localStorage
      localStorage.setItem('currentBusinessUrl', businessUrl);
      
      // Store the data in localStorage for the table page to use
      localStorage.setItem('businessData', JSON.stringify(data));
      router.push('/reviews');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch business data. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurant Review Manager</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Business URL</h2>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="businessUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Business URL
              </label>
              <input
                type="url"
                id="businessUrl"
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter the business URL"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Load Reviews'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
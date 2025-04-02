import { Review, SortField, SortOrder, Profile } from '@/types/review';
import { useState, useEffect } from 'react';

interface ReviewTableProps {
  reviews: Review[];
}

const ITEMS_PER_PAGE = 10;

// Format date consistently for both server and client
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReviewTable({ reviews: initialReviews }: ReviewTableProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingReplies, setGeneratingReplies] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);

  useEffect(() => {
    // Load profiles from localStorage
    const loadProfiles = () => {
      const savedProfiles = localStorage.getItem('profiles');
      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles(parsedProfiles);
        // Select the first profile by default if available and no profile is selected
        if (parsedProfiles.length > 0 && !selectedProfile) {
          setSelectedProfile(parsedProfiles[0].id);
        }
      }
    };

    // Load profiles initially
    loadProfiles();

    // Add focus event listener to refresh profiles when the window regains focus
    const handleFocus = () => {
      loadProfiles();
      // Also fetch latest reviews when window regains focus
      fetchLatestReviews();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedProfile]); // Add selectedProfile as a dependency

  // Add new function to fetch latest reviews
  const fetchLatestReviews = async () => {
    try {
      const currentBusinessUsername = localStorage.getItem('currentBusinessUsername');
      if (!currentBusinessUsername) {
        throw new Error('No business username found');
      }

      const response = await fetch('/api/reviews/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_username: currentBusinessUsername
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reviews');
      }

      const data = await response.json();
      if (!data.reviews || !Array.isArray(data.reviews)) {
        throw new Error('Invalid response format');
      }

      setReviews(data.reviews);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch latest reviews');
      // Keep the existing reviews if there's an error
      // setReviews([]); // Commented out to prevent clearing existing reviews on error
    }
  };

  // Add new useEffect to fetch reviews on mount
  useEffect(() => {
    fetchLatestReviews();
  }, []); // Empty dependency array means this runs once on mount

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleGenerateReply = async (reviewId: string) => {
    if (!selectedProfile) {
      alert('Please select a profile first');
      return;
    }

    setGeneratingReplies(prev => new Set(prev).add(reviewId));
    try {
      // Get the selected profile object from the profiles array
      const selectedProfileObj = profiles.find(p => p.id === selectedProfile);
      if (!selectedProfileObj) {
        throw new Error('Selected profile not found');
      }

      const response = await fetch('/api/reviews/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: selectedProfileObj.id,  // Use the actual profile ID
          message_id: reviewId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reply');
      }

      const data = await response.json();
      
      // Update the review with the generated reply text from the response field
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id_review === reviewId 
            ? { ...review, reply: data.response }  // Use data.response from the API response
            : review
        )
      );
    } catch (error) {
      console.error('Error generating reply:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate reply');
    } finally {
      setGeneratingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'rating':
        return (a.rating - b.rating) * multiplier;
      case 'timestamp':
        return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
      case 'relative_date':
        // Handle optional relative_date field
        if (!a.relative_date || !b.relative_date) return 0;
        return a.relative_date.localeCompare(b.relative_date) * multiplier;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && sortedReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews found
        </div>
      )}

      {!isLoading && sortedReviews.length > 0 && (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="profile" className="text-sm font-medium text-gray-700">
              Select Response Profile:
            </label>
            <select
              id="profile"
              value={selectedProfile || ''}
              onChange={(e) => setSelectedProfile(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">Select a profile</option>
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.profile_name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rating')}>
                    Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('timestamp')}>
                    Date {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReviews.map((review) => (
                  <tr key={review.id_review} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{review.review_text || 'No review text'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 min-h-[24px]">
                        {review.reply || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleGenerateReply(review.id_review)}
                          disabled={generatingReplies.has(review.id_review)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingReplies.has(review.id_review) ? 'Generating...' : 'Generate Reply'}
                        </button>
                        <button
                          disabled={true}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Post Reply
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.relative_date}</div>
                      <div className="text-xs text-gray-500">{formatDate(review.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.user_name}</div>
                      <div className="text-xs text-gray-500">{review.n_review_user} reviews</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, sortedReviews.length)}</span> of{' '}
                  <span className="font-medium">{sortedReviews.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
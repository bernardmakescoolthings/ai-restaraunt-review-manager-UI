export interface Review {
  id_review: string;
  relative_date?: string;  // Optional since it's not in the API response
  timestamp: string;
  rating: number;
  review_text: string;  // Changed from text to review_text to match API
  user_name: string;    // We'll map username to user_name
  url_user?: string;    // Optional since it's not in the API response
  n_review_user: number;  // Added back as required field
  reply?: string | null;
}

export type SortField = 'rating' | 'timestamp' | 'relative_date';
export type SortOrder = 'asc' | 'desc'; 
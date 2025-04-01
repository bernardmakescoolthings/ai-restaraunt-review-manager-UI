export type SortField = 'rating' | 'timestamp' | 'relative_date';
export type SortOrder = 'asc' | 'desc';

export interface Profile {
  id: number;
  profile_name: string;
  profile_text_base: string;
  profile_text_addon: string;
}

export interface Review {
  id_review: string;
  rating: number;
  review_text: string;
  reply?: string;
  timestamp: string;
  relative_date?: string;
  user_name: string;
  n_review_user: number;
} 
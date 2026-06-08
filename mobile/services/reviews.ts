import { apiRequest } from '@/services/apiClient';

export interface ReviewSummary {
  place_slug: string;
  average_rating: number | null;
  review_count: number;
}

export interface Review {
  id: string;
  place_slug: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewPage {
  items: Review[];
  next_cursor: string | null;
  has_more: boolean;
}

export async function fetchReviewSummary(placeSlug: string): Promise<ReviewSummary | null> {
  try {
    return await apiRequest<ReviewSummary>(`/reviews/${placeSlug}/summary`, { token: null });
  } catch {
    return null;
  }
}

export async function fetchReviews(
  placeSlug: string,
  cursor?: string | null,
): Promise<ReviewPage | null> {
  try {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return await apiRequest<ReviewPage>(`/reviews/${placeSlug}${query}`, { token: null });
  } catch {
    return null;
  }
}

export async function submitReview(
  placeSlug: string,
  rating: number,
  comment?: string,
): Promise<Review> {
  return apiRequest<Review>(`/reviews/${placeSlug}`, {
    method: 'POST',
    body: { rating, comment: comment || null },
  });
}

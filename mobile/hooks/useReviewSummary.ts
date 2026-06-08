import { useEffect, useState } from 'react';
import { fetchReviewSummary, type ReviewSummary } from '@/services/reviews';

export function useReviewSummary(placeSlug: string) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    fetchReviewSummary(placeSlug).then((data) => {
      if (!cancelled) {
        setSummary(data);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [placeSlug]);

  return { summary, loaded };
}

import React from 'react';

import PlaceDetail from '@/components/place-detail/PlaceDetail';
import type { PlaceMeta } from '@/types/place';

interface PlaceDetailOverlayProps {
  selectedPlaceId: string | null;
  selectedMeta?: PlaceMeta;
  onClose: () => void;
}

export default function PlaceDetailOverlay({
  selectedPlaceId,
  selectedMeta,
  onClose,
}: PlaceDetailOverlayProps) {
  if (!selectedPlaceId || !selectedMeta) {
    return null;
  }

  // Use the new generic PlaceDetail for all places
  return <PlaceDetail meta={selectedMeta} visible onClose={onClose} />;
}
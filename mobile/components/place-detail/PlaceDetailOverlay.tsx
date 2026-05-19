import React from 'react';
import { Platform } from 'react-native';

import type { PlaceMeta } from '@/types/place';

interface PlaceDetailOverlayProps {
  selectedPlaceId: string | null;
  selectedMeta?: PlaceMeta;
  onClose: () => void;
}

export default function PlaceDetailOverlay(props: PlaceDetailOverlayProps) {
  if (Platform.OS === 'web') {
    return null;
  }

  const NativePlaceDetailOverlay = require('@/components/place-detail/PlaceDetailOverlay.native').default as (
    input: PlaceDetailOverlayProps,
  ) => React.JSX.Element | null;

  return <NativePlaceDetailOverlay {...props} />;
}
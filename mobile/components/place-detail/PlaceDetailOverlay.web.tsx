import type { PlaceMeta } from '@/types/place';

interface PlaceDetailOverlayProps {
  selectedPlaceId: string | null;
  selectedMeta?: PlaceMeta;
  onClose: () => void;
}

export default function PlaceDetailOverlay(_: PlaceDetailOverlayProps) {
  return null;
}
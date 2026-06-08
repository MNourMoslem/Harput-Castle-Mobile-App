import { apiRequest } from '@/services/apiClient';
import type { GalleryImageItem, LoadImagesResult } from '@/types/gallery';

interface GalleryImageDto {
  id: string;
  url: string;
  thumbnail_url: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string | null;
  created_at: string;
}

interface GalleryPageDto {
  items: GalleryImageDto[];
  next_cursor: string | null;
  has_more: boolean;
}

function toItem(dto: GalleryImageDto, currentUserId?: string | null): GalleryImageItem {
  const uri = dto.url;
  return {
    id: dto.id,
    source: { uri },
    thumbnailSource: { uri: dto.thumbnail_url },
    cacheKey: dto.id,
    uploadedBy: dto.uploaded_by,
    isOwn: Boolean(currentUserId && dto.uploaded_by === currentUserId),
  };
}

export async function fetchGalleryPage(
  cursor: string | null,
  limit: number,
  mineOnly: boolean,
  currentUserId?: string | null,
): Promise<LoadImagesResult> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (cursor) params.set('cursor', cursor);
  if (mineOnly) params.set('mine', 'true');

  const page = await apiRequest<GalleryPageDto>(`/gallery?${params.toString()}`, {
    token: mineOnly ? undefined : null,
  });

  return {
    items: page.items.map((item) => toItem(item, currentUserId)),
    nextCursor: page.next_cursor,
    hasMore: page.has_more,
  };
}

export async function uploadGalleryImage(
  uri: string,
  fileName: string,
  mimeType: string,
): Promise<GalleryImageItem> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const dto = await apiRequest<GalleryImageDto>('/gallery/upload', {
    method: 'POST',
    formData,
  });

  return toItem(dto);
}

export async function deleteGalleryImage(imageId: string): Promise<void> {
  await apiRequest(`/gallery/${imageId}`, { method: 'DELETE' });
}

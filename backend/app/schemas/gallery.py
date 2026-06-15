from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class GalleryImageOut(BaseModel):
    id: str
    url: str
    thumbnail_url: str
    original_name: str
    mime_type: str
    size_bytes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class GalleryPageResponse(BaseModel):
    items: list[GalleryImageOut]
    next_cursor: str | None
    has_more: bool

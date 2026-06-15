from __future__ import annotations

import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.gallery import GalleryImage
from app.models.user import User
from app.schemas.gallery import GalleryImageOut, GalleryPageResponse
from app.services.gallery import save_upload

router = APIRouter(prefix="/gallery", tags=["Gallery"])

DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def _encode_cursor(dt: datetime) -> str:
    return base64.urlsafe_b64encode(dt.isoformat().encode()).decode()


def _decode_cursor(cursor: str) -> datetime:
    try:
        iso = base64.urlsafe_b64decode(cursor.encode()).decode()
        return datetime.fromisoformat(iso)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cursor value.",
        ) from exc


def _build_image_url(request: Request, filename: str) -> str:
    return str(request.base_url) + f"media/{filename}"


@router.get(
    "",
    response_model=GalleryPageResponse,
    summary="Fetch a paginated list of gallery images",
)
async def list_images(
    request: Request,
    cursor: str | None = None,
    limit: int = DEFAULT_LIMIT,
    db: AsyncSession = Depends(get_db),
) -> GalleryPageResponse:
    limit = min(max(limit, 1), MAX_LIMIT)

    query = select(GalleryImage).order_by(GalleryImage.created_at.desc())

    if cursor:
        cursor_dt = _decode_cursor(cursor)
        query = query.where(GalleryImage.created_at < cursor_dt)

    # Fetch one extra to determine has_more
    query = query.limit(limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_more = len(rows) > limit
    items = rows[:limit]

    next_cursor = _encode_cursor(items[-1].created_at) if has_more else None

    out_items = [
        GalleryImageOut(
            id=img.id,
            url=_build_image_url(request, img.filename),
            thumbnail_url=_build_image_url(request, img.filename),
            original_name=img.original_name,
            mime_type=img.mime_type,
            size_bytes=img.size_bytes,
            created_at=img.created_at,
        )
        for img in items
    ]

    return GalleryPageResponse(items=out_items, next_cursor=next_cursor, has_more=has_more)


@router.post(
    "/upload",
    response_model=GalleryImageOut,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new gallery image (authenticated users only)",
)
async def upload_image(
    request: Request,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GalleryImageOut:
    try:
        filename, original_name, mime_type, size_bytes = await save_upload(file)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    image = GalleryImage(
        filename=filename,
        original_name=original_name,
        mime_type=mime_type,
        size_bytes=size_bytes,
        uploaded_by=current_user.id,
    )
    db.add(image)
    await db.commit()
    await db.refresh(image)

    return GalleryImageOut(
        id=image.id,
        url=_build_image_url(request, image.filename),
        thumbnail_url=_build_image_url(request, image.filename),
        original_name=image.original_name,
        mime_type=image.mime_type,
        size_bytes=image.size_bytes,
        created_at=image.created_at,
    )

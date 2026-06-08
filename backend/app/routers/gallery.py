from __future__ import annotations

import base64
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.gallery import GalleryImage
from app.models.user import User
from app.schemas.gallery import GalleryImageOut, GalleryPageResponse
from app.services.gallery import delete_file, save_upload

router = APIRouter(prefix="/gallery", tags=["Gallery"])

DEFAULT_LIMIT = 20
MAX_LIMIT = 100
settings = get_settings()


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


def _to_out(request: Request, img: GalleryImage) -> GalleryImageOut:
    url = _build_image_url(request, img.filename)
    return GalleryImageOut(
        id=img.id,
        url=url,
        thumbnail_url=url,
        original_name=img.original_name,
        mime_type=img.mime_type,
        size_bytes=img.size_bytes,
        uploaded_by=img.uploaded_by,
        created_at=img.created_at,
    )


@router.get(
    "",
    response_model=GalleryPageResponse,
    summary="Fetch a paginated list of gallery images",
)
async def list_images(
    request: Request,
    cursor: str | None = None,
    limit: int = DEFAULT_LIMIT,
    mine: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> GalleryPageResponse:
    if mine and current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view your images.",
        )

    limit = min(max(limit, 1), MAX_LIMIT)

    query = select(GalleryImage).order_by(GalleryImage.created_at.desc())

    if mine and current_user is not None:
        query = query.where(GalleryImage.uploaded_by == current_user.id)

    if cursor:
        cursor_dt = _decode_cursor(cursor)
        query = query.where(GalleryImage.created_at < cursor_dt)

    query = query.limit(limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_more = len(rows) > limit
    items = rows[:limit]
    next_cursor = _encode_cursor(items[-1].created_at) if has_more else None

    return GalleryPageResponse(
        items=[_to_out(request, img) for img in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )


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
    count_result = await db.execute(
        select(func.count(GalleryImage.id)).where(
            GalleryImage.uploaded_by == current_user.id
        )
    )
    image_count = count_result.scalar_one()

    if image_count >= settings.max_images_per_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload limit reached ({settings.max_images_per_user} images per user).",
        )

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

    return _to_out(request, image)


@router.delete(
    "/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a gallery image (owner only)",
)
async def delete_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(select(GalleryImage).where(GalleryImage.id == image_id))
    image = result.scalar_one_or_none()

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found.",
        )

    if image.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own images.",
        )

    delete_file(image.filename)
    await db.execute(delete(GalleryImage).where(GalleryImage.id == image_id))
    await db.commit()

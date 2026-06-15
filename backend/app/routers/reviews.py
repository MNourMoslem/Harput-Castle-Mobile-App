from __future__ import annotations

import base64
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.review import Review
from app.models.user import User
from app.schemas.review import (
    VALID_PLACE_SLUGS,
    ReviewCreate,
    ReviewOut,
    ReviewPageResponse,
    ReviewSummary,
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])

DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def _validate_slug(place_slug: str) -> None:
    if place_slug not in VALID_PLACE_SLUGS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Place '{place_slug}' not found.",
        )


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


@router.get(
    "/{place_slug}/summary",
    response_model=ReviewSummary,
    summary="Get average rating and review count for a place",
)
async def review_summary(
    place_slug: str,
    db: AsyncSession = Depends(get_db),
) -> ReviewSummary:
    _validate_slug(place_slug)

    result = await db.execute(
        select(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("count"),
        ).where(Review.place_slug == place_slug)
    )
    row = result.one()
    avg = round(float(row.avg_rating), 2) if row.avg_rating is not None else None

    return ReviewSummary(
        place_slug=place_slug,
        average_rating=avg,
        review_count=row.count,
    )


@router.get(
    "/{place_slug}",
    response_model=ReviewPageResponse,
    summary="Fetch paginated reviews for a place",
)
async def list_reviews(
    place_slug: str,
    cursor: str | None = None,
    limit: int = DEFAULT_LIMIT,
    db: AsyncSession = Depends(get_db),
) -> ReviewPageResponse:
    _validate_slug(place_slug)
    limit = min(max(limit, 1), MAX_LIMIT)

    query = (
        select(Review)
        .where(Review.place_slug == place_slug)
        .order_by(Review.created_at.desc())
    )

    if cursor:
        cursor_dt = _decode_cursor(cursor)
        query = query.where(Review.created_at < cursor_dt)

    query = query.limit(limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_more = len(rows) > limit
    items = rows[:limit]
    next_cursor = _encode_cursor(items[-1].created_at) if has_more else None

    out_items = [
        ReviewOut(
            id=r.id,
            place_slug=r.place_slug,
            user_id=r.user_id,
            username=r.user.username,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in items
    ]

    return ReviewPageResponse(items=out_items, next_cursor=next_cursor, has_more=has_more)


@router.post(
    "/{place_slug}",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a review for a place (one per user)",
)
async def create_review(
    place_slug: str,
    body: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewOut:
    _validate_slug(place_slug)

    # Check one-review-per-user constraint before hitting the DB unique index
    existing = await db.execute(
        select(Review).where(
            Review.place_slug == place_slug,
            Review.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this place.",
        )

    review = Review(
        place_slug=place_slug,
        user_id=current_user.id,
        rating=body.rating,
        comment=body.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewOut(
        id=review.id,
        place_slug=review.place_slug,
        user_id=review.user_id,
        username=current_user.username,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )

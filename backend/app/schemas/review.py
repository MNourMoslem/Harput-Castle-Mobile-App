from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


# ── Hardcoded allowed place slugs ─────────────────────────────────────────────

VALID_PLACE_SLUGS: set[str] = {
    "harput-kalesi",
    "harput-kalesi-girisi",
    "harput-kalesi-dogu-terasi",
    "harput-kalesi-tarihi-hamami",
    "harput-kalesi-ici-ve-artuklu-cami-harabeleri",
    "harput-kalesi-orijinal-kesme-taslari",
    "harput-kalesi-ucuncu-bolge-kazilari-ve-manzarasi",
    "harput-kalesi-ve-suryani-kadim-meryem-ana-kilisesi",
    "ulu-cami",
    "harput-zindani",
    "harput-zindani-sonu",
    "artuklu-sarayi-kalintilari",
    "artuklu-sarayi-kazi",
    "artuklu-sarnici-ve-zindani",
    "aslanli-burc-ve-kale-kitabesi",
    "mancanik",
    "harput-genel",
    "harput-ici",
    "harput-yakindan",
}


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(None, max_length=2000)


class ReviewOut(BaseModel):
    id: str
    place_slug: str
    user_id: str
    username: str
    rating: int
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewPageResponse(BaseModel):
    items: list[ReviewOut]
    next_cursor: str | None
    has_more: bool


class ReviewSummary(BaseModel):
    place_slug: str
    average_rating: float | None
    review_count: int

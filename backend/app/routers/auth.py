from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserMeResponse,
)
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> User:
    existing = await db.execute(
        select(User).where(
            or_(
                func.lower(User.username) == func.lower(body.username),
                func.lower(User.email) == func.lower(body.email),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered.",
        )

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with username (or email) and password",
)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.username) == func.lower(body.username),
                func.lower(User.email) == func.lower(body.username),
            )
        )
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)) -> dict:
    try:
        user_id = decode_token(body.refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),  # rotate refresh token
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserMeResponse,
    summary="Return the currently authenticated user's profile",
)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post(
    "/logout",
    summary="Log out the current user",
)
async def logout(current_user: User = Depends(get_current_user)) -> dict:
    return {"detail": "Logged out successfully. Please clear the tokens on the client side."}

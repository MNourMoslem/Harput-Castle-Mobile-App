from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.assistant import ChatRequest
from app.services.assistant import stream_chat_response
from app.config import get_settings

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.post(
    "/chat",
    summary="Send a message to the Harput Castle AI assistant (SSE stream)",
    response_class=StreamingResponse,
)
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Assistant is not configured. Please set GEMINI_API_KEY.",
        )

    async def event_generator():
        try:
            async for delta in stream_chat_response(body.message):
                payload = json.dumps({"delta": delta}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
        except Exception as exc:
            error_payload = json.dumps({"error": str(exc)}, ensure_ascii=False)
            yield f"data: {error_payload}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering if behind a proxy
        },
    )

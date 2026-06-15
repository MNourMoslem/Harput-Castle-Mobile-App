from __future__ import annotations

from collections.abc import AsyncGenerator

import google.generativeai as genai

from app.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = (
    "You are Harput Rehberi, an expert AI guide for Harput Castle and its historical "
    "surroundings in Elazığ, Turkey. Your knowledge covers the Urartian, Byzantine, "
    "Seljuk, Artukid, and Ottoman periods of this fortress and its surrounding sites "
    "including Ulu Cami, the Artukid Palace ruins, the cisterns, the dungeon, and other "
    "landmarks. Answer the user's questions in the same language they write in — Turkish "
    "or English. Be concise, accurate, and historically informed. If a question is "
    "completely unrelated to Harput or Turkish history, politely redirect the user."
)


def _get_model() -> genai.GenerativeModel:
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=SYSTEM_PROMPT,
    )


async def stream_chat_response(message: str) -> AsyncGenerator[str, None]:
    """
    Send a message to Gemini 2.0 Flash and yield text chunks as they arrive.
    Each yielded value is a plain string delta.
    """
    model = _get_model()

    response = await model.generate_content_async(
        message,
        stream=True,
    )

    async for chunk in response:
        text = chunk.text
        if text:
            yield text

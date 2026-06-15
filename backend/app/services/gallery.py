from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import get_settings

settings = get_settings()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def get_media_dir() -> Path:
    media = Path(settings.media_dir)
    media.mkdir(parents=True, exist_ok=True)
    return media


async def save_upload(upload: UploadFile) -> tuple[str, str, str, int]:
    """
    Save an uploaded file to the media directory.

    Returns:
        (filename, original_name, mime_type, size_bytes)
    """
    content = await upload.read()

    # Validate size
    if len(content) > settings.max_upload_size_bytes:
        raise ValueError(
            f"File too large. Maximum size is {settings.max_upload_size_mb} MB."
        )

    # Validate MIME type
    mime_type = upload.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValueError(
            f"Unsupported file type '{mime_type}'. "
            f"Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
        )

    # Derive safe extension
    ext = mimetypes.guess_extension(mime_type) or ".jpg"
    ext = ext.replace(".jpe", ".jpg")  # normalise jpeg extension

    filename = f"{uuid.uuid4()}{ext}"
    dest = get_media_dir() / filename
    dest.write_bytes(content)

    return filename, upload.filename or filename, mime_type, len(content)


def delete_file(filename: str) -> None:
    path = get_media_dir() / filename
    if path.exists():
        path.unlink()

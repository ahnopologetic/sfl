from enum import Enum
from pydantic import BaseModel
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TokenData(BaseModel):
    id: uuid.UUID
    email: str
    app_metadata: Optional[Dict[str, Any]] = None
    user_metadata: Optional[Dict[str, Any]] = None
    aud: Optional[str] = None
    role: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class ProfileCreate(BaseModel):
    username: str
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    timezone: str


class ProfileResponse(BaseModel):
    id: uuid.UUID
    username: str
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    timezone: str
    created_at: datetime
    updated_at: datetime


class SnippetJobRequest(BaseModel):
    request_text: str


class SnippetJobResponse(BaseModel):
    job_ids: List[uuid.UUID]
    status: JobStatus
    estimated_completion_time: Optional[datetime] = None


class JobStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    progress: int
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None
    snippet_ids: Optional[List[uuid.UUID]] = None


class SnippetMetadataResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    audio_url: str
    duration_seconds: int
    status: JobStatus
    spotify_track_id: Optional[str] = None
    spotify_artist: Optional[str] = None
    spotify_album: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SnippetUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


class SnippetUpdateResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    tags: List[str]
    is_public: bool
    updated_at: datetime

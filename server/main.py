import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, Response, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordRequestForm,
)
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware

from core import generate_podcast_audio, generate_podcast_script
from schema import (
    JobStatus,
    JobStatusResponse,
    ProfileCreate,
    ProfileResponse,
    SnippetJobRequest,
    SnippetJobResponse,
    SnippetMetadataResponse,
    SnippetUpdateRequest,
    SnippetUpdateResponse,
    Token,
    TokenData,
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "secret-key-for-development-only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create FastAPI app
app = FastAPI(
    title="Snipfluent API",
    description="API for creating and managing learning audio snippets",
    version="0.1.0",
)

# Authentication setup
security = HTTPBearer()

# In-memory repositories
profiles = {}
usernames = set()
jobs = {}
snippets = {}

# Mock user for testing
MOCK_USERS = {
    "test@example.com": {
        "user_id": uuid.UUID("12345678-1234-5678-1234-567812345678"),
        "password": "password",
    }
}


# Rate Limiting Middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limit_store: Dict[str, Dict] = {}
        self.rate_limit = 100  # requests per minute

    async def dispatch(self, request: Request, call_next):
        client_id = request.client.host

        now = datetime.now()
        if client_id not in self.rate_limit_store:
            self.rate_limit_store[client_id] = {
                "count": 0,
                "reset_at": now.timestamp() + 60,
            }

        client = self.rate_limit_store[client_id]
        if now.timestamp() > client["reset_at"]:
            client["count"] = 0
            client["reset_at"] = now.timestamp() + 60

        client["count"] += 1

        response = await call_next(request)

        response.headers["X-RateLimit-Limit"] = str(self.rate_limit)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.rate_limit - client["count"])
        )
        response.headers["X-RateLimit-Reset"] = str(int(client["reset_at"]))

        if client["count"] > self.rate_limit:
            return Response(
                content='{"error": {"code": "too_many_requests", "message": "Rate limit exceeded"}}',
                status_code=429,
                media_type="application/json",
                headers=dict(response.headers),
            )

        return response


# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)


# Authentication functions
def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def authenticate_user(email: str, password: str) -> Optional[uuid.UUID]:
    user = MOCK_USERS.get(email)
    if not user or user["password"] != password:
        return None

    return user["user_id"]


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> uuid.UUID:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        token_data = TokenData(user_id=uuid.UUID(user_id))

    except (JWTError, ValueError):
        raise credentials_exception

    return token_data.user_id


# Helper functions for job and snippet processing
async def process_snippet_job(job_id: uuid.UUID, request_text: str, user_id: uuid.UUID):
    """Background task to process a snippet job."""
    try:
        # Update job status to processing
        jobs[job_id]["status"] = JobStatus.PROCESSING
        jobs[job_id]["progress"] = 10
        jobs[job_id]["updated_at"] = datetime.now()

        # Generate script
        script = generate_podcast_script(request_text)
        jobs[job_id]["progress"] = 40
        jobs[job_id]["updated_at"] = datetime.now()

        # Generate audio
        audio_path = generate_podcast_audio(script)
        jobs[job_id]["progress"] = 90
        jobs[job_id]["updated_at"] = datetime.now()

        # Create snippet
        snippet_id = uuid.uuid4()
        now = datetime.now()

        # Extract title from script (first line after # )
        title = "Untitled Snippet"
        for line in script.split("\n"):
            if line.startswith("# "):
                title = line[2:].strip()
                break

        snippets[snippet_id] = {
            "id": snippet_id,
            "user_id": user_id,
            "job_id": job_id,
            "title": title,
            "description": request_text,
            "audio_url": f"/snippets/{snippet_id}",
            "duration_seconds": 60,  # Approximate for now
            "tags": [],
            "is_public": False,
            "spotify_track_id": None,
            "spotify_artist": None,
            "spotify_album": None,
            "created_at": now,
            "updated_at": now,
            "audio_file_path": audio_path,
        }

        # Update job as completed
        jobs[job_id]["status"] = JobStatus.COMPLETED
        jobs[job_id]["progress"] = 100
        jobs[job_id]["updated_at"] = datetime.now()

    except Exception as e:
        # Update job as failed
        jobs[job_id]["status"] = JobStatus.FAILED
        jobs[job_id]["error_message"] = str(e)
        jobs[job_id]["updated_at"] = datetime.now()


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the Snipfluent API. See /docs for documentation."}


@app.post("/login", response_model=Token, tags=["auth"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_id = authenticate_user(form_data.username, form_data.password)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.post(
    "/users",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["users"],
)
async def create_user_profile(
    profile: ProfileCreate, user_id: uuid.UUID = Depends(get_current_user)
):
    if profile.username in usernames:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
        )

    profile_id = user_id  # Use the authenticated user's ID as profile ID
    now = datetime.now()

    profile_data = {
        "id": profile_id,
        "username": profile.username,
        "last_name": profile.last_name,
        "first_name": profile.first_name,
        "middle_name": profile.middle_name,
        "timezone": profile.timezone,
        "created_at": now,
        "updated_at": now,
    }

    profiles[profile_id] = profile_data
    usernames.add(profile.username)

    return profile_data


@app.get("/users/me", response_model=ProfileResponse, tags=["users"])
async def get_user_profile(user_id: uuid.UUID = Depends(get_current_user)):
    profile = profiles.get(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return profile


@app.post(
    "/snippets",
    response_model=SnippetJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["snippets"],
)
async def create_snippet_job(
    request: SnippetJobRequest, user_id: uuid.UUID = Depends(get_current_user)
):
    # Create a new job for snippet generation
    job_id = uuid.uuid4()
    now = datetime.now()
    estimated_time = now + timedelta(minutes=5)

    job_data = {
        "id": job_id,
        "user_id": user_id,
        "request_text": request.request_text,
        "status": JobStatus.PENDING,
        "progress": 0,
        "error_message": None,
        "estimated_completion_time": estimated_time,
        "created_at": now,
        "updated_at": now,
    }

    jobs[job_id] = job_data

    # Start processing job (in background in a real app)
    # Here we'll run it without waiting for completion
    import asyncio

    asyncio.create_task(process_snippet_job(job_id, request.request_text, user_id))

    return SnippetJobResponse(
        job_ids=[job_id],
        status=JobStatus.PENDING,
        estimated_completion_time=estimated_time,
    )


@app.get("/snippets/jobs/{job_id}", response_model=JobStatusResponse, tags=["snippets"])
async def get_job_status(
    job_id: uuid.UUID, user_id: uuid.UUID = Depends(get_current_user)
):
    job = jobs.get(job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    # Check if the job belongs to the authenticated user
    if job["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this job",
        )

    # Get associated snippets if job is completed
    snippet_ids = None
    if job["status"] == JobStatus.COMPLETED:
        job_snippets = [s for s in snippets.values() if s["job_id"] == job_id]
        snippet_ids = [s["id"] for s in job_snippets]

    return JobStatusResponse(
        job_id=job["id"],
        status=job["status"],
        progress=job["progress"],
        created_at=job["created_at"],
        updated_at=job["updated_at"],
        error_message=job["error_message"],
        snippet_ids=snippet_ids,
    )


@app.get("/snippets/{snippet_id}", response_class=FileResponse, tags=["snippets"])
async def get_audio_snippet(
    snippet_id: uuid.UUID, user_id: uuid.UUID = Depends(get_current_user)
):
    snippet = snippets.get(snippet_id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Check if the snippet belongs to the authenticated user or is public
    if snippet["user_id"] != user_id and not snippet["is_public"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this snippet",
        )

    # Return the audio file
    audio_path = snippet["audio_file_path"]
    return FileResponse(
        path=audio_path, media_type="audio/mpeg", filename=f"{snippet['title']}.mp3"
    )


@app.get(
    "/snippets/{snippet_id}/metadata",
    response_model=SnippetMetadataResponse,
    tags=["snippets"],
)
async def get_snippet_metadata(
    snippet_id: uuid.UUID, user_id: uuid.UUID = Depends(get_current_user)
):
    snippet = snippets.get(snippet_id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Check if the snippet belongs to the authenticated user or is public
    if snippet["user_id"] != user_id and not snippet["is_public"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this snippet",
        )

    # Get job status for the snippet
    job = jobs.get(snippet["job_id"])
    job_status = job["status"] if job else JobStatus.FAILED

    return SnippetMetadataResponse(
        id=snippet["id"],
        user_id=snippet["user_id"],
        title=snippet["title"],
        description=snippet["description"],
        audio_url=snippet["audio_url"],
        duration_seconds=snippet["duration_seconds"],
        status=job_status,
        spotify_track_id=snippet["spotify_track_id"],
        spotify_artist=snippet["spotify_artist"],
        spotify_album=snippet["spotify_album"],
        created_at=snippet["created_at"],
        updated_at=snippet["updated_at"],
    )


@app.put(
    "/snippets/{snippet_id}", response_model=SnippetUpdateResponse, tags=["snippets"]
)
async def update_snippet(
    snippet_id: uuid.UUID,
    update_data: SnippetUpdateRequest,
    user_id: uuid.UUID = Depends(get_current_user),
):
    snippet = snippets.get(snippet_id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Check if the snippet belongs to the authenticated user
    if snippet["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this snippet",
        )

    # Update the provided fields
    if update_data.title is not None:
        snippet["title"] = update_data.title
    if update_data.description is not None:
        snippet["description"] = update_data.description
    if update_data.tags is not None:
        snippet["tags"] = update_data.tags
    if update_data.is_public is not None:
        snippet["is_public"] = update_data.is_public

    snippet["updated_at"] = datetime.now()

    return SnippetUpdateResponse(
        id=snippet["id"],
        title=snippet["title"],
        description=snippet["description"],
        tags=snippet["tags"],
        is_public=snippet["is_public"],
        updated_at=snippet["updated_at"],
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Snipfluent API on port {port}...")
    print(f"API documentation available at http://localhost:{port}/docs")

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

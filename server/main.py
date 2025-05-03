"""
Snipfluent API - Main Application Module

This module implements the FastAPI application for the Snipfluent API,
which provides endpoints for creating, managing, and retrieving learning audio snippets.

Recent enhancements:
- Added GET /snippets endpoint with comprehensive filtering, sorting, and pagination
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

from dotenv import load_dotenv
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    Request,
    Response,
    Security,
    status,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware

from core import generate_podcast_audio, generate_podcast_script
from database import JobRepository, ProfileRepository, SnippetRepository
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
    SnippetListResponse,
)
from settings import settings
from storage import StorageService
from supabase_client import supabase_client, verify_jwt_token

# Load environment variables
load_dotenv()

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

# In-memory repositories (to be replaced with Supabase)
profiles = {}
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


# Authentication with Supabase
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        user_data = verify_jwt_token(token)

        if not user_data:
            raise credentials_exception

        user_id = user_data.get("id")
        if not user_id:
            raise credentials_exception

        token_data = TokenData(**user_data)
        return token_data

    except (JWTError, ValueError) as e:
        print(f"Authentication error: {str(e)}")
        raise credentials_exception


# Initialize Supabase storage on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup."""
    await StorageService.initialize()


# Helper functions for job and snippet processing
async def process_snippet_job(
    job_id: uuid.UUID,
    request_text: str,
    user_id: uuid.UUID,
    username: str,
    background_tasks: BackgroundTasks,
):
    """Background task to process a snippet job."""
    try:
        # Update job status to processing
        job_data = {
            "status": JobStatus.PROCESSING,
            "progress": 10,
            "updated_at": datetime.now().isoformat(),
        }

        await JobRepository.update_job(job_id, job_data)

        # Generate script
        script = generate_podcast_script(request_text)

        job_data = {
            "progress": 40,
            "updated_at": datetime.now().isoformat(),
        }
        await JobRepository.update_job(job_id, job_data)

        # Generate audio
        audio_path = generate_podcast_audio(script, username, job_id)

        job_data = {
            "progress": 90,
            "updated_at": datetime.now().isoformat(),
        }
        await JobRepository.update_job(job_id, job_data)

        # Upload audio to Supabase Storage
        success, audio_url = await StorageService.upload_file(audio_path, user_id)

        if not success:
            raise Exception("Failed to upload audio file")

        # Extract title from script (first line after # )
        title = "Untitled Snippet"
        for line in script.split("\n"):
            if line.startswith("# "):
                title = line[2:].strip()
                break

        # Create snippet in database
        snippet_data = {
            "id": str(uuid.uuid4()),
            "user_id": str(user_id),
            "job_id": str(job_id),
            "title": title,
            "description": request_text,
            "audio_url": audio_url,
            "duration_seconds": 60,  # Approximate for now
            "tags": [],
            "is_public": False,
            "spotify_track_id": None,
            "spotify_artist": None,
            "spotify_album": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        snippet = await SnippetRepository.create_snippet(snippet_data)

        # Update job as completed
        job_data = {
            "status": JobStatus.COMPLETED,
            "progress": 100,
            "updated_at": datetime.now().isoformat(),
        }
        await JobRepository.update_job(job_id, job_data)

        # Clean up local file
        if os.path.exists(audio_path):
            os.remove(audio_path)

    except Exception as e:
        # Update job as failed
        job_data = {
            "status": JobStatus.FAILED,
            "error_message": str(e),
            "updated_at": datetime.now().isoformat(),
        }
        await JobRepository.update_job(job_id, job_data)


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the Snipfluent API. See /docs for documentation."}


@app.post(
    "/users",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["users"],
)
async def create_user_profile(
    profile: ProfileCreate, user: TokenData = Depends(get_current_user)
):
    """
    Create a new user profile.

    This endpoint allows users to create their profile after authentication.
    """
    # Check if username exists
    if await ProfileRepository.username_exists(profile.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
        )

    now = datetime.now()
    profile_data = {
        "id": str(user.id),
        "username": profile.username,
        "last_name": profile.last_name,
        "first_name": profile.first_name,
        "middle_name": profile.middle_name,
        "timezone": profile.timezone,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    # Create profile in Supabase
    db_profile = await ProfileRepository.create_profile(profile_data)

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile",
        )

    # Also update in-memory for backward compatibility
    profiles[user.id] = profile_data

    return ProfileResponse(**db_profile)


@app.get("/users/me", response_model=ProfileResponse, tags=["users"])
async def get_user_profile(user: TokenData = Depends(get_current_user)):
    """
    Get the current user's profile.

    This endpoint allows users to retrieve their profile information.
    """
    # Get profile from Supabase
    db_profile = await ProfileRepository.get_profile(user.id)

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )

    return ProfileResponse(**db_profile)


@app.post(
    "/snippets",
    response_model=SnippetJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["snippets"],
)
async def create_snippet_job(
    request: SnippetJobRequest,
    background_tasks: BackgroundTasks,
    user: TokenData = Depends(get_current_user),
):
    """
    Create a new snippet job.

    This endpoint creates a new job to process the user's snippet request.
    """
    # Create a new job in the database
    job_id = uuid.uuid4()
    now = datetime.now()
    estimated_completion = now + timedelta(
        minutes=2
    )  # Estimate 2 minutes for processing

    job_data = {
        "id": str(job_id),
        "user_id": str(user.id),
        "request_text": request.request_text,
        "status": JobStatus.PENDING,
        "progress": 0,
        "estimated_completion_time": estimated_completion.isoformat(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    # Create job in Supabase
    created_job = await JobRepository.create_job(job_data)

    if not created_job:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job",
        )

    # Also update in-memory for backward compatibility
    jobs[job_id] = job_data

    # Start processing in the background
    background_tasks.add_task(
        process_snippet_job,
        job_id,
        request.request_text,
        user.id,
        user.email,
        background_tasks,
    )

    # Return response
    return SnippetJobResponse(
        job_ids=[job_id],
        status=JobStatus.PENDING,
        estimated_completion_time=estimated_completion,
    )


@app.get("/snippets/jobs/{job_id}", response_model=JobStatusResponse, tags=["snippets"])
async def get_job_status(
    job_id: uuid.UUID, user: TokenData = Depends(get_current_user)
):
    """
    Get the status of a snippet job.

    This endpoint retrieves the status of a specific job by its ID.
    """
    # Get job from Supabase
    job = await JobRepository.get_job(job_id, user.id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )

    # Get snippets associated with this job if completed
    snippet_ids = []
    if job["status"] == JobStatus.COMPLETED:
        snippets_data = await JobRepository.get_snippets_for_job(job_id)
        snippet_ids = [uuid.UUID(snippet["id"]) for snippet in snippets_data]

    # Return response
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        created_at=job["created_at"],
        updated_at=job["updated_at"],
        error_message=job.get("error_message"),
        snippet_ids=snippet_ids if snippet_ids else None,
    )


@app.get("/snippets/{snippet_id}", tags=["snippets"])
async def get_audio_snippet(
    snippet_id: uuid.UUID, user: TokenData = Depends(get_current_user)
):
    """
    Get audio content for a snippet.

    This endpoint streams the audio content of a specific snippet.
    """
    # Get snippet from Supabase
    snippet = await SnippetRepository.get_snippet(snippet_id, user.id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Extract the storage path from the audio_url
    # Format: https://[supabase-project].[supabase-domain]/storage/v1/object/public/snippets/USER_ID/FILENAME
    audio_url = snippet["audio_url"]

    # Handle streaming from Supabase URL
    # Redirect to the Supabase storage URL
    return Response(
        status_code=status.HTTP_307_TEMPORARY_REDIRECT, headers={"Location": audio_url}
    )


@app.get(
    "/snippets/{snippet_id}/metadata",
    response_model=SnippetMetadataResponse,
    tags=["snippets"],
)
async def get_snippet_metadata(
    snippet_id: uuid.UUID, user: TokenData = Depends(get_current_user)
):
    """
    Get metadata for a snippet.

    This endpoint retrieves the metadata of a specific snippet by its ID.
    """
    # Get snippet from Supabase
    snippet = await SnippetRepository.get_snippet(snippet_id, user.id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Get the job status
    job = await JobRepository.get_job(uuid.UUID(snippet["job_id"]), user.id)

    if not job:
        # If job not found but snippet exists, assume it's completed
        job_status = JobStatus.COMPLETED
    else:
        job_status = job["status"]

    # Return response
    return SnippetMetadataResponse(
        id=snippet_id,
        user_id=uuid.UUID(snippet["user_id"]),
        title=snippet["title"],
        description=snippet["description"],
        audio_url=snippet["audio_url"],
        duration_seconds=snippet["duration_seconds"],
        status=job_status,
        spotify_track_id=snippet.get("spotify_track_id"),
        spotify_artist=snippet.get("spotify_artist"),
        spotify_album=snippet.get("spotify_album"),
        created_at=snippet["created_at"],
        updated_at=snippet["updated_at"],
    )


@app.put(
    "/snippets/{snippet_id}", response_model=SnippetUpdateResponse, tags=["snippets"]
)
async def update_snippet(
    snippet_id: uuid.UUID,
    update_data: SnippetUpdateRequest,
    user: TokenData = Depends(get_current_user),
):
    """
    Update snippet metadata.

    This endpoint updates the metadata of a specific snippet by its ID.
    """
    # Get snippet from Supabase to check ownership
    snippet = await SnippetRepository.get_snippet(snippet_id, user.id)

    if not snippet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Snippet not found"
        )

    # Verify ownership
    if snippet["user_id"] != str(user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this snippet",
        )

    # Prepare update data
    now = datetime.now()
    update_fields = {}

    if update_data.title is not None:
        update_fields["title"] = update_data.title

    if update_data.description is not None:
        update_fields["description"] = update_data.description

    if update_data.tags is not None:
        update_fields["tags"] = update_data.tags

    if update_data.is_public is not None:
        update_fields["is_public"] = update_data.is_public

    update_fields["updated_at"] = now.isoformat()

    # Update in Supabase
    updated_snippet = await SnippetRepository.update_snippet(
        snippet_id, user.id, update_fields
    )

    if not updated_snippet:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update snippet",
        )

    # Return response
    return SnippetUpdateResponse(
        id=snippet_id,
        title=updated_snippet["title"],
        description=updated_snippet.get("description"),
        tags=updated_snippet.get("tags", []),
        is_public=updated_snippet.get("is_public", False),
        updated_at=updated_snippet["updated_at"],
    )


@app.get("/snippets", response_model=SnippetListResponse, tags=["snippets"])
async def get_snippets(
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    status: Optional[JobStatus] = Query(None, description="Filter by snippet status"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags to filter by"),
    sort: Optional[str] = Query("created_at", description="Field to sort by"),
    order: Optional[str] = Query("desc", description="Sort order (asc or desc)"),
    is_public: Optional[bool] = Query(None, description="Filter by public/private status"),
    job_id: Optional[uuid.UUID] = Query(None, description="Filter snippets by job ID"),
    user: TokenData = Depends(get_current_user),
):
    """
    List snippets with filtering and pagination.

    This endpoint retrieves a paginated list of snippets belonging to the authenticated user,
    with various filtering, searching, and sorting options.
    """
    # Parse tags if provided
    tags_list = tags.split(",") if tags else None
    
    # Get snippets from database
    result = await SnippetRepository.get_snippets(
        user_id=user.id,
        page=page,
        limit=limit,
        status=status.value if status else None,
        search=search,
        tags=tags_list,
        sort=sort,
        order=order,
        is_public=is_public,
        job_id=job_id,
    )
    
    # Return response
    return SnippetListResponse(
        items=result["items"],
        pagination=result["pagination"]
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Snipfluent API on port {port}...")
    print(f"API documentation available at http://localhost:{port}/docs")

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

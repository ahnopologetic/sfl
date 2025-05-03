import uuid
from typing import Any, Dict, List

from supabase_client import supabase_client


class ProfileRepository:
    """Repository for profile operations."""

    @staticmethod
    async def create_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new profile in the database."""
        result = supabase_client.table("profiles").insert(profile_data).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def get_profile(user_id: uuid.UUID) -> Dict[str, Any]:
        """Get a profile by user ID."""
        result = (
            supabase_client.table("profiles")
            .select("*")
            .eq("id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None

    @staticmethod
    async def update_profile(
        user_id: uuid.UUID, profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a profile by user ID."""
        result = (
            supabase_client.table("profiles")
            .update(profile_data)
            .eq("id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None

    @staticmethod
    async def username_exists(username: str) -> bool:
        """Check if a username already exists."""
        result = (
            supabase_client.table("profiles")
            .select("id")
            .eq("username", username)
            .execute()
        )
        return bool(result.data)


class JobRepository:
    """Repository for job operations."""

    @staticmethod
    async def create_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job in the database."""
        result = supabase_client.table("jobs").insert(job_data).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def get_job(job_id: uuid.UUID, user_id: uuid.UUID) -> Dict[str, Any]:
        """Get a job by ID and check ownership."""
        result = (
            supabase_client.table("jobs")
            .select("*")
            .eq("id", str(job_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        return result.data[0] if result.data else None

    @staticmethod
    async def update_job(job_id: uuid.UUID, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a job by ID."""
        result = (
            supabase_client.table("jobs")
            .update(job_data)
            .eq("id", str(job_id))
            .execute()
        )
        return result.data[0] if result.data else None

    @staticmethod
    async def get_snippets_for_job(job_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Get all snippets associated with a job."""
        result = (
            supabase_client.table("snippets")
            .select("id")
            .eq("job_id", str(job_id))
            .execute()
        )
        return result.data


class SnippetRepository:
    """Repository for snippet operations."""

    @staticmethod
    async def create_snippet(snippet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new snippet in the database."""
        result = supabase_client.table("snippets").insert(snippet_data).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def get_snippet(snippet_id: uuid.UUID, user_id: uuid.UUID) -> Dict[str, Any]:
        """Get a snippet by ID and check ownership."""
        result = (
            supabase_client.table("snippets")
            .select("*")
            .eq("id", str(snippet_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        # If not found, check if it's public
        if not result.data:
            result = (
                supabase_client.table("snippets")
                .select("*")
                .eq("id", str(snippet_id))
                .eq("is_public", True)
                .execute()
            )

        return result.data[0] if result.data else None

    @staticmethod
    async def get_snippets(
        user_id: uuid.UUID,
        page: int = 1,
        limit: int = 20,
        status: str = None,
        search: str = None,
        tags: List[str] = None,
        sort: str = "created_at",
        order: str = "desc",
        is_public: bool = None,
        job_id: uuid.UUID = None,
    ) -> Dict[str, Any]:
        """
        Get paginated snippets with filtering options.
        
        Args:
            user_id: The user ID to filter by
            page: Page number (1-indexed)
            limit: Number of items per page (max 100)
            status: Filter by job status
            search: Search in title and description
            tags: Filter by tags
            sort: Field to sort by
            order: Sort direction (asc or desc)
            is_public: Filter by public status
            job_id: Filter by job ID
            
        Returns:
            Dictionary with items and pagination info
        """
        # Validate and sanitize inputs
        page = max(1, page)
        limit = min(max(1, limit), 100)
        offset = (page - 1) * limit
        
        valid_sort_fields = ["created_at", "updated_at", "title", "duration_seconds"]
        if sort not in valid_sort_fields:
            sort = "created_at"
            
        valid_orders = ["asc", "desc"]
        if order not in valid_orders:
            order = "desc"
            
        # Start building the query
        query = supabase_client.table("snippets").select("*", count="exact")
        
        # Always filter by user_id (only show the user's snippets)
        query = query.eq("user_id", str(user_id))
        
        # Apply filters
        if job_id:
            query = query.eq("job_id", str(job_id))
            
        if is_public is not None:
            query = query.eq("is_public", is_public)
            
        if tags and len(tags) > 0:
            # Filter snippets that have at least one of the specified tags
            # This uses PostgreSQL's containment operator @>
            for tag in tags:
                query = query.contains("tags", [tag])
                
        if search:
            search_term = f"%{search}%"
            query = query.or_(f"title.ilike.{search_term},description.ilike.{search_term}")
            
        if status:
            # Need to join with the jobs table to filter by status
            # This is more complex in the Supabase client, might require a raw query
            # For now, we'll fetch the job IDs with the desired status first
            jobs_result = (
                supabase_client.table("jobs")
                .select("id")
                .eq("user_id", str(user_id))
                .eq("status", status)
                .execute()
            )
            
            if jobs_result.data:
                job_ids = [job["id"] for job in jobs_result.data]
                query = query.in_("job_id", job_ids)
            else:
                # No jobs with this status, return empty result
                return {"items": [], "pagination": {"total": 0, "page": page, "limit": limit, "total_pages": 0}}
        
        # Apply ordering
        query = query.order(sort, desc=order == "desc")
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1)
        
        # Execute the query
        result = query.execute()
        
        # Calculate pagination info
        count = result.count if result.count is not None else 0
        total_pages = (count + limit - 1) // limit
        
        return {
            "items": result.data,
            "pagination": {
                "total": count,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
            },
        }

    @staticmethod
    async def update_snippet(
        snippet_id: uuid.UUID, user_id: uuid.UUID, snippet_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a snippet by ID if owned by the user."""
        # First check if the snippet exists and is owned by the user
        existing = await SnippetRepository.get_snippet(snippet_id, user_id)
        if not existing or existing["user_id"] != str(user_id):
            return None

        result = (
            supabase_client.table("snippets")
            .update(snippet_data)
            .eq("id", str(snippet_id))
            .execute()
        )
        return result.data[0] if result.data else None

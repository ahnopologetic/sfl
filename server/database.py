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

from supabase import create_client, Client
from settings import settings

# Create a Supabase client
def get_supabase_client() -> Client:
    """Get a Supabase client instance."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Initialize the client
supabase_client = get_supabase_client()


def verify_jwt_token(token: str) -> dict:
    """
    Verify a JWT token and return the decoded payload.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        The decoded token payload or None if invalid
    """
    try:
        # Use auth.getUser to verify the token
        response = supabase_client.auth.get_user(token)
        return response.user.model_dump() if response.user else None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None 
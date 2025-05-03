import os
import uuid
from typing import BinaryIO, Optional, Tuple

from supabase_client import supabase_client


class StorageService:
    """Service for handling storage operations."""
    
    BUCKET_NAME = "sfl"
    
    @classmethod
    async def initialize(cls) -> None:
        """Initialize the storage service by creating the bucket if it doesn't exist."""
        try:
            # Check if bucket exists
            buckets = supabase_client.storage.list_buckets()
            bucket_exists = any(bucket.name == cls.BUCKET_NAME for bucket in buckets)
            
            if not bucket_exists:
                # Create the bucket with public access
                supabase_client.storage.create_bucket(
                    cls.BUCKET_NAME, 
                    {"public": True}
                )
                print(f"Created storage bucket: {cls.BUCKET_NAME}")
        except Exception as e:
            print(f"Error initializing storage: {e}")
    
    @classmethod
    def upload_file(cls, file_path: str, user_id: uuid.UUID) -> Tuple[bool, Optional[str]]:
        """
        Upload a file to Supabase Storage.
        
        Args:
            file_path: Path to the local file
            user_id: ID of the user who owns the file
            
        Returns:
            Tuple of (success, public_url)
        """
        try:
            if not os.path.exists(file_path):
                return False, None
                
            filename = os.path.basename(file_path)
            storage_path = f"{filename}"
            
            with open(file_path, "rb") as f:
                # Upload the file
                result = supabase_client.storage.from_(cls.BUCKET_NAME).upload(
                    storage_path, 
                    f.read()
                )
                
                # Get the public URL
                public_url = supabase_client.storage.from_(cls.BUCKET_NAME).get_public_url(storage_path)
                return True, public_url
                
        except Exception as e:
            print(f"Error uploading file: {e}")
            return False, None
    
    @classmethod
    async def download_file(cls, storage_path: str) -> Tuple[bool, Optional[bytes]]:
        """
        Download a file from Supabase Storage.
        
        Args:
            storage_path: Path to the file in storage
            
        Returns:
            Tuple of (success, file_content)
        """
        try:
            # Download the file
            file_content = supabase_client.storage.from_(cls.BUCKET_NAME).download(storage_path)
            return True, file_content
            
        except Exception as e:
            print(f"Error downloading file: {e}")
            return False, None
    
    @classmethod
    async def delete_file(cls, storage_path: str) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            storage_path: Path to the file in storage
            
        Returns:
            Success flag
        """
        try:
            supabase_client.storage.from_(cls.BUCKET_NAME).remove([storage_path])
            return True
            
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False 
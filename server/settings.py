from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ELEVENLABS_API_KEY: str
    ELEVENLABS_VOICE_ID_HOST: str
    ELEVENLABS_VOICE_ID_COHOST: str
    OPENAI_API_KEY: str
    
    # Supabase configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

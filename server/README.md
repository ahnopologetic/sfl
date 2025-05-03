# Snipfluent Server

Backend server for Snipfluent, a platform for generating and managing audio learning snippets.

## Features

- User authentication via Supabase
- Audio snippet generation with OpenAI and ElevenLabs
- REST API for creating and managing audio snippets
- Streaming audio content
- File storage with Supabase Storage

## Setup

### Prerequisites

- Python 3.10+
- Supabase account with a project set up
- OpenAI API key
- ElevenLabs API key and voice IDs

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# API Keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID_HOST=your_elevenlabs_voice_id_for_host
ELEVENLABS_VOICE_ID_COHOST=your_elevenlabs_voice_id_for_cohost
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### Supabase Setup

1. Create tables in your Supabase project:
   - profiles
   - jobs
   - snippets

2. Enable storage in your Supabase project and create a bucket named `snippets`

3. Set up Row Level Security (RLS) policies for the tables and the storage bucket

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/snipfluent.git
cd snipfluent/server
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Run the server:
```
uvicorn main:app --reload
```

The server will be available at http://localhost:8000.

## API Documentation

Once the server is running, the API documentation can be accessed at http://localhost:8000/docs.

## Authentication

The server uses Supabase for authentication. When making requests from the client:

1. Authenticate the user through Supabase Auth in the client app
2. Get the Supabase session token
3. Pass the token in the Authorization header:
   ```
   Authorization: Bearer <supabase_token>
   ```

## Development

To run the server in development mode with auto-reload:

```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

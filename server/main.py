import json
import os
import re
from pathlib import Path
from typing import Dict, List

import openai
import requests
from dotenv import load_dotenv
from pydub import AudioSegment

load_dotenv()

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID_HOST = os.getenv("ELEVENLABS_VOICE_ID_HOST")
ELEVENLABS_VOICE_ID_COHOST = os.getenv("ELEVENLABS_VOICE_ID_COHOST")


def generate_podcast_script(text: str) -> str:
    openai_client = openai.OpenAI()
    response = openai_client.responses.create(
        model="gpt-4o-mini",
        input=[
            {
                "role": "system",
                "content": """
You are a podcast script generator that creates engaging, educational 1-minute episodes. 
Follow these guidelines:

1. Format:
- Title: Clear and engaging
- Introduction (10 seconds): Hook the listener and introduce the topic
- Main Content (40 seconds): Present key information in an engaging narrative
- Conclusion (10 seconds): Summarize key points and provide a thought-provoking ending

2. Content Rules:
- This is testing the system, so keep it short and simple i.e., no more than 5 turns of dialogue and less than 1 minute STRICTLY.
- Keep language conversational and accessible
- Use storytelling techniques to maintain engagement
- Include 1-2 key facts or statistics
- End with a thought-provoking question or interesting fact
- Maintain a friendly, educational tone
- Ensure factual accuracy
- Break down complex concepts into digestible pieces

3. Technical Requirements:
- Script should be less than 1 minute when read at a moderate pace
- Use clear section markers for easy reading
- Include natural pause points for breathing
- Format in markdown for easy reading

4. Topic Guidelines:
- Focus on one specific aspect of the requested topic
- Provide brief context and background information
- Include a relevant example or analogy
- Connect the topic to broader implications or current relevance

5. Output Format:
```markdown
# [Episode Title]

## Introduction
HOST: [10-second engaging hook and topic introduction]

## Main Content
HOST: [Main content delivery]
CO-HOST: [Supporting commentary or questions]
HOST: [Response and continuation]
[Continue dialogue format for 30 seconds]

## Conclusion
HOST: [10-second summary and thought-provoking ending]
CO-HOST: [Final comment or question]
```

6. Speaker Guidelines:
- Use two speakers: HOST and CO-HOST
- HOST is the primary content deliverer
- CO-HOST provides supporting commentary, asks questions, and helps maintain engagement
- Keep dialogue natural and conversational
- Use speaker tags before each line of dialogue
- Include occasional sound effects or music cues in brackets [SFX: ...]

Generate a script following these guidelines for the requested topic. Ensure the content is accurate, engaging, and suitable for a 5-minute episode.
                """,
            },
            {"role": "user", "content": text},
        ],
    )
    return response.output_text


def parse_script(script: str) -> List[Dict[str, str]]:
    """Parse the podcast script into a list of speaker segments."""
    segments = []
    current_speaker = None
    current_text = []

    for line in script.split("\n"):
        line = line.strip()
        if not line:
            continue

        # Check for speaker tags
        speaker_match = re.match(r"^(HOST|CO-HOST):\s*(.*)", line)
        if speaker_match:
            # Save previous segment if exists
            if current_speaker and current_text:
                segments.append(
                    {"speaker": current_speaker, "text": " ".join(current_text)}
                )

            current_speaker = speaker_match.group(1)
            current_text = [speaker_match.group(2)]
        else:
            current_text.append(line)

    # Add the last segment
    if current_speaker and current_text:
        segments.append({"speaker": current_speaker, "text": " ".join(current_text)})

    return segments


def generate_audio_segment(text: str, speaker: str) -> str:
    """Generate audio for a single segment using ElevenLabs API."""
    voice_id = (
        ELEVENLABS_VOICE_ID_HOST if speaker == "HOST" else ELEVENLABS_VOICE_ID_COHOST
    )

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
    }

    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    response = requests.post(url, json=data, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Error generating audio: {response.text}")

    # Save the audio segment
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    segment_path = output_dir / f"{speaker}_{len(os.listdir(output_dir))}.mp3"

    with open(segment_path, "wb") as f:
        f.write(response.content)

    return str(segment_path)


def combine_audio_segments(segment_paths: List[str], output_path: str):
    """Combine multiple audio segments into a single podcast episode."""
    combined = AudioSegment.empty()

    for path in segment_paths:
        segment = AudioSegment.from_mp3(path)
        combined += segment
        # Add a small pause between segments
        combined += AudioSegment.silent(duration=500)

    combined.export(output_path, format="mp3")


def generate_podcast_audio(script: str) -> str:
    """Generate audio for the entire podcast script."""
    # Parse the script into segments
    segments = parse_script(script)

    # Generate audio for each segment
    segment_paths = []
    for segment in segments:
        audio_path = generate_audio_segment(segment["text"], segment["speaker"])
        segment_paths.append(audio_path)

    # Combine all segments into final podcast
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    final_path = output_dir / "final_podcast.mp3"
    combine_audio_segments(segment_paths, str(final_path))

    return str(final_path)


def main():
    # Generate the script
    script = generate_podcast_script(
        "Generate 1 min episode about the founding story of United Nation"
    )
    print("Generated script:")
    print(script)

    # Generate the audio
    audio_path = generate_podcast_audio(script)
    print(f"\nGenerated audio saved to: {audio_path}")


if __name__ == "__main__":
    main()

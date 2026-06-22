# backend/app/services/transcription.py
#
# WHY THIS FILE EXISTS:
# This is the core of your AI pipeline.
# It takes each video chunk's audio and runs it through
# OpenAI Whisper to get a text transcript with timestamps.
#
# WHY WE USE "base" MODEL:
# Whisper has multiple models:
# - tiny   → fastest, least accurate
# - base   → good balance of speed and accuracy ✅
# - small  → more accurate, slower
# - medium → very accurate, much slower
# - large  → most accurate, very slow
#
# For a capstone project, "base" is the best choice.
# It can process a 10-minute chunk in about 2-3 minutes.
#
# WHAT THE OUTPUT LOOKS LIKE:
# [
#   {"text": "great kill by number seven", "start": 342.5, "end": 345.2},
#   {"text": "ace serve", "start": 610.1, "end": 612.0},
# ]

import whisper
import os

# Load the Whisper model once when the module is imported
# Loading it every time would be very slow (model is 150MB)
# "base" model — good balance of speed and accuracy
print("Loading Whisper model...")
MODEL = whisper.load_model("base")
print("Whisper model loaded!")


def transcribe_audio_chunk(audio_path: str, chunk_start_time: float) -> list[dict]:
    """
    Transcribe a single audio chunk using Whisper.
    
    Args:
        audio_path: Path to the WAV audio file
        chunk_start_time: When this chunk starts in the original video (seconds)
        
    Returns:
        List of transcript segments with CORRECTED timestamps:
        [
            {
                "text": "number seven with a kill",
                "start": 1542.5,  ← corrected to original video time
                "end": 1545.2
            },
            ...
        ]
    
    Why correct timestamps?
    If chunk starts at 600 seconds and Whisper says "at 45 seconds",
    the real time in the original video is 600 + 45 = 645 seconds.
    """
    if not os.path.exists(audio_path):
        return []

    # Run Whisper transcription
    # word_timestamps=True gives us precise word-level timing
    result = MODEL.transcribe(
        audio_path,
        word_timestamps=True,
        language="en",  # English — change if needed
        verbose=False
    )

    segments = []

    for segment in result["segments"]:
        # Correct the timestamp by adding chunk start time
        corrected_start = chunk_start_time + segment["start"]
        corrected_end = chunk_start_time + segment["end"]

        segments.append({
            "text": segment["text"].strip().lower(),
            "start": corrected_start,
            "end": corrected_end
        })

    return segments


def transcribe_all_chunks(chunks: list[dict]) -> list[dict]:
    """
    Transcribe all video chunks and merge into one transcript.
    
    Args:
        chunks: List of chunk dicts from video_processor.py
        
    Returns:
        Complete merged transcript with corrected timestamps
        sorted by time order.
    """
    all_segments = []

    for chunk in chunks:
        print(f"Transcribing chunk {chunk['chunk_index']}...")

        segments = transcribe_audio_chunk(
            audio_path=chunk["audio_path"],
            chunk_start_time=chunk["start_time"]
        )

        all_segments.extend(segments)

    # Sort by start time to ensure correct order
    all_segments.sort(key=lambda x: x["start"])

    return all_segments


def segments_to_full_text(segments: list[dict]) -> str:
    """
    Convert transcript segments into one full text string.
    
    Why: The Match model stores the full transcript as a single
    text field. This converts the list of segments into that format.
    """
    return " ".join([seg["text"] for seg in segments])
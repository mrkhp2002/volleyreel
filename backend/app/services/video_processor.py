# backend/app/services/video_processor.py
#
# WHY THIS FILE EXISTS:
# Whisper has a limit on how much audio it can process at once.
# A full volleyball match video can be 1-2 hours long.
# We split the video into 10-minute chunks so Whisper
# can process each chunk without running out of memory.
#
# WHAT IT DOES:
# 1. Takes a video file path as input
# 2. Uses FFmpeg to split it into 10-minute chunks
# 3. Returns a list of chunk file paths
# 4. Also extracts audio from each chunk for Whisper

import os
import subprocess
import math

# Add FFmpeg to PATH for Windows
ffmpeg_path = r"C:\ffmpeg-9.0.1-essentials_build\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_path

# How long each chunk should be in seconds
# 600 seconds = 10 minutes
CHUNK_DURATION = 600


def get_video_duration(video_path: str) -> float:
    """
    Get the total duration of a video in seconds using FFmpeg.
    
    Why: We need to know the total length so we can calculate
    how many chunks to split it into.
    """
    video_path = video_path.strip('\'"')
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    return float(result.stdout.strip())


def split_video_into_chunks(video_path: str, output_dir: str) -> list[dict]:
    """
    Split a long video into smaller chunks for Whisper processing.
    
    Args:
        video_path: Path to the original match video
        output_dir: Folder where chunks will be saved
        
    Returns:
        List of dicts with chunk info:
        [
            {
                "chunk_path": "path/to/chunk_0.mp4",
                "audio_path": "path/to/chunk_0.wav",
                "start_time": 0.0,
                "end_time": 600.0,
                "chunk_index": 0
            },
            ...
        ]
    
    Why return start_time?
    When Whisper transcribes chunk_2 and says "event at 45 seconds",
    we need to add chunk_2's start_time (1200 seconds) to get the
    REAL timestamp in the original video: 1200 + 45 = 1245 seconds.
    """
    video_path = video_path.strip('\'"')
    os.makedirs(output_dir, exist_ok=True)

    # Get total video duration
    total_duration = get_video_duration(video_path)

    # Calculate how many chunks we need
    num_chunks = math.ceil(total_duration / CHUNK_DURATION)

    chunks = []

    for i in range(num_chunks):
        # Calculate start and end time for this chunk
        start_time = i * CHUNK_DURATION
        end_time = min((i + 1) * CHUNK_DURATION, total_duration)

        # File paths for this chunk
        chunk_path = os.path.join(output_dir, f"chunk_{i}.mp4")
        audio_path = os.path.join(output_dir, f"chunk_{i}.wav")

        # Step 1: Extract video chunk using FFmpeg
        # -ss: start time
        # -t: duration of chunk
        # -c: copy codec (fast, no re-encoding)
        chunk_command = [
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-i", video_path,
            "-t", str(end_time - start_time),
            "-c", "copy",
            chunk_path
        ]
        subprocess.run(chunk_command, capture_output=True)

        # Step 2: Extract audio from chunk as WAV
        # Whisper works better with WAV audio
        # -vn: no video (audio only)
        # -ar 16000: 16kHz sample rate (Whisper requirement)
        # -ac 1: mono audio (Whisper requirement)
        audio_command = [
            "ffmpeg", "-y",
            "-i", chunk_path,
            "-vn",
            "-ar", "16000",
            "-ac", "1",
            audio_path
        ]
        subprocess.run(audio_command, capture_output=True)

        chunks.append({
            "chunk_path": chunk_path,
            "audio_path": audio_path,
            "start_time": start_time,
            "end_time": end_time,
            "chunk_index": i
        })

    return chunks


def cleanup_chunks(output_dir: str):
    """
    Delete all chunk files after processing is complete.
    
    Why: Chunk files are temporary — they take up disk space
    and are not needed after transcription is done.
    """
    import shutil
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
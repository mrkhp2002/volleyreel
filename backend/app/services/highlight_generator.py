# backend/app/services/highlight_generator.py
#
# WHY THIS FILE EXISTS:
# After detecting events, we need to create video clips.
# For each kill/ace/block detected, we cut a short clip
# from the original video: 10 seconds before and 5 seconds after.
# Then we join all clips into one highlight reel MP4.
#
# WHY 10 SEC BEFORE AND 5 SEC AFTER?
# - 10 seconds before: shows the build-up/rally context
# - 5 seconds after: shows the reaction/celebration
# This gives a complete highlight clip for each event.

import os
import subprocess

# Add FFmpeg to PATH for Windows
ffmpeg_path = r"C:\ffmpeg-9.0.1-essentials_build\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_path


def generate_event_clip(
    video_path: str,
    timestamp_sec: float,
    output_path: str,
    before_sec: float = 10.0,
    after_sec: float = 5.0
) -> bool:
    """
    Cut a short clip around a detected event timestamp.
    
    Args:
        video_path: Path to the original match video
        timestamp_sec: When the event occurred (seconds)
        output_path: Where to save the clip
        before_sec: How many seconds before event to include
        after_sec: How many seconds after event to include
        
    Returns:
        True if clip was created successfully, False otherwise
    """
    video_path = video_path.strip('\'"')
    # Calculate clip start and end times
    # Make sure we don't go before the start of the video
    start_time = max(0, timestamp_sec - before_sec)
    duration = before_sec + after_sec

    command = [
        "ffmpeg", "-y",
        "-ss", str(start_time),
        "-i", video_path,
        "-t", str(duration),
        "-c:v", "libx264",   # H.264 video codec
        "-c:a", "aac",        # AAC audio codec
        "-preset", "fast",    # Fast encoding
        output_path
    ]

    result = subprocess.run(command, capture_output=True)
    return result.returncode == 0


def generate_highlight_reel(
    clip_paths: list[str],
    output_path: str
) -> bool:
    """
    Concatenate all event clips into one highlight reel MP4.
    
    Why:
    Instead of sharing 20 separate clips, the coach gets
    ONE highlight video with all key moments.
    
    How it works:
    1. Create a text file listing all clips (FFmpeg concat format)
    2. Use FFmpeg concat demuxer to join them
    3. Output as single MP4 file
    
    Args:
        clip_paths: List of paths to individual event clips
        output_path: Where to save the final highlight reel
        
    Returns:
        True if highlight reel was created successfully
    """
    if not clip_paths:
        return False

    # Create a temporary file listing all clips
    # FFmpeg concat format requires:
    # file 'path/to/clip1.mp4'
    # file 'path/to/clip2.mp4'
    concat_file = output_path.replace(".mp4", "_concat.txt")

    with open(concat_file, "w") as f:
        for clip_path in clip_paths:
            # Use forward slashes for FFmpeg on Windows
            safe_path = clip_path.replace("\\", "/")
            f.write(f"file '{safe_path}'\n")

    # Run FFmpeg concat command
    command = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        output_path
    ]

    result = subprocess.run(command, capture_output=True)

    # Clean up the temporary concat file
    if os.path.exists(concat_file):
        os.remove(concat_file)

    return result.returncode == 0


def process_match_highlights(
    video_path: str,
    events: list[dict],
    output_dir: str,
    match_id: int
) -> dict:
    """
    Main function — generate all clips and the highlight reel.
    
    Args:
        video_path: Path to original match video
        events: List of detected events from event_detector.py
        output_dir: Directory to save clips
        match_id: Match ID for naming files
        
    Returns:
        Dict with clip URLs and highlight reel URL:
        {
            "clips": {event_index: clip_path},
            "highlight_url": "path/to/highlight_reel.mp4"
        }
    """
    video_path = video_path.strip('\'"')
    os.makedirs(output_dir, exist_ok=True)

    clip_paths = []
    event_clips = {}

    for i, event in enumerate(events):
        clip_path = os.path.join(
            output_dir,
            f"match_{match_id}_event_{i}_{event['event_type']}.mp4"
        )

        print(f"Generating clip for {event['event_type']} at {event['timestamp_sec']:.1f}s...")

        success = generate_event_clip(
            video_path=video_path,
            timestamp_sec=event["timestamp_sec"],
            output_path=clip_path
        )

        if success:
            clip_paths.append(clip_path)
            event_clips[i] = clip_path

    # Generate the final highlight reel
    highlight_path = os.path.join(
        output_dir,
        f"match_{match_id}_highlight_reel.mp4"
    )

    highlight_success = generate_highlight_reel(clip_paths, highlight_path)

    return {
        "clips": event_clips,
        "highlight_url": highlight_path if highlight_success else None
    }
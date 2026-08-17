# backend/app/services/highlight_generator.py
#
# WHY THIS FILE EXISTS:
# After detecting events, we need to create video clips.
# For each kill/ace/block detected, we cut a short clip
# from the original video: 10 seconds before and 5 seconds after.
# Then we join all clips into one highlight reel MP4.

import os
import shutil
import subprocess

# Add FFmpeg to PATH for Windows if present
ffmpeg_candidates = [
    r"C:\ffmpeg-9.0.1-essentials_build\bin",
    r"C:\ffmpeg-8.1.1-essentials_build\ffmpeg-8.1.1-essentials_build\bin",
]
for fc in ffmpeg_candidates:
    if os.path.isdir(fc):
        os.environ["PATH"] += os.pathsep + fc


def get_ffmpeg_binary() -> str:
    """Find the best available ffmpeg binary."""
    possible_paths = [
        r"C:\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe",
        r"C:\ffmpeg-8.1.1-essentials_build\ffmpeg-8.1.1-essentials_build\bin\ffmpeg.exe",
    ]
    for path in possible_paths:
        if os.path.isfile(path):
            return path
    which_path = shutil.which("ffmpeg")
    if which_path:
        return which_path
    return "ffmpeg"


def generate_event_clip(
    video_path: str,
    timestamp_sec: float,
    output_path: str,
    before_sec: float = 10.0,
    after_sec: float = 5.0
) -> bool:
    """
    Cut a short clip around a detected event timestamp.
    """
    video_path = (video_path or "").strip('\'"')
    if not os.path.isfile(video_path):
        return False

    start_time = max(0.0, float(timestamp_sec) - before_sec)
    duration = before_sec + after_sec

    ffmpeg_bin = get_ffmpeg_binary()
    command = [
        ffmpeg_bin, "-y",
        "-ss", str(start_time),
        "-i", video_path,
        "-t", str(duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "fast",
        output_path
    ]

    result = subprocess.run(command, capture_output=True)
    return result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0


def generate_highlight_reel(
    clip_paths: list[str],
    output_path: str
) -> bool:
    """
    Concatenate all event clips into one highlight reel MP4 using FFmpeg.
    """
    valid_clips = [c for c in clip_paths if c and os.path.isfile(c) and os.path.getsize(c) > 0]
    if not valid_clips:
        return False

    # Create a temporary file listing all clips with absolute paths
    concat_file = output_path.replace(".mp4", "_concat.txt")

    with open(concat_file, "w", encoding="utf-8") as f:
        for clip_path in valid_clips:
            abs_path = os.path.abspath(clip_path).replace("\\", "/")
            f.write(f"file '{abs_path}'\n")

    ffmpeg_bin = get_ffmpeg_binary()

    # Fast stream-copy concat
    command = [
        ffmpeg_bin, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file,
        "-c", "copy",
        output_path
    ]
    result = subprocess.run(command, capture_output=True)

    # If stream copy failed, fallback to re-encoding
    if result.returncode != 0 or not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        command_reencode = [
            ffmpeg_bin, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-preset", "fast",
            output_path
        ]
        result = subprocess.run(command_reencode, capture_output=True)

    # Clean up the temporary concat file
    if os.path.exists(concat_file):
        try:
            os.remove(concat_file)
        except Exception:
            pass

    return result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0


def process_match_highlights(
    video_path: str,
    events: list[dict],
    output_dir: str,
    match_id: int
) -> dict:
    """
    Generate all clips and combine them into a highlight reel MP4.
    Reuses existing clips on disk when available to speed up compilation.
    """
    video_path = (video_path or "").strip('\'"')
    os.makedirs(output_dir, exist_ok=True)

    clip_paths = []
    event_clips = {}

    for i, event in enumerate(events):
        existing_clip = event.get("clip_url")
        if existing_clip and os.path.isfile(existing_clip) and os.path.getsize(existing_clip) > 0:
            clip_paths.append(existing_clip)
            event_clips[i] = existing_clip.replace("\\", "/")
            continue

        clip_path = os.path.join(
            output_dir,
            f"match_{match_id}_event_{i}_{event.get('event_type', 'highlight')}.mp4"
        )

        if os.path.isfile(clip_path) and os.path.getsize(clip_path) > 0:
            clip_paths.append(clip_path)
            event_clips[i] = clip_path.replace("\\", "/")
            continue

        if video_path and os.path.isfile(video_path):
            success = generate_event_clip(
                video_path=video_path,
                timestamp_sec=float(event.get("timestamp_sec", 0)),
                output_path=clip_path
            )
            if success:
                clip_paths.append(clip_path)
                event_clips[i] = clip_path.replace("\\", "/")

    # Generate the final highlight reel
    highlight_path = os.path.join(
        output_dir,
        f"match_{match_id}_highlight_reel.mp4"
    )

    highlight_success = generate_highlight_reel(clip_paths, highlight_path)
    clean_highlight_url = highlight_path.replace("\\", "/") if (highlight_success and os.path.isfile(highlight_path)) else None

    return {
        "clips": event_clips,
        "highlight_url": clean_highlight_url
    }
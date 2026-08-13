# backend/app/services/event_detector.py
#
# WHY THIS FILE EXISTS:
# After Whisper transcribes the video, we need to find
# the KEY MOMENTS — the kills, aces, blocks.
#
# HOW IT WORKS:
# 1. Scan transcript segments for volleyball keywords
# 2. Detect whistle sounds using Librosa
# 3. Correlate: keyword near a whistle = confirmed event
# 4. Try to match player names/numbers from the roster
#
# KEYWORD DETECTION:
# We look for words like "kill", "ace", "block", "spike" etc.
# These words in the transcript indicate a key play happened.
#
# WHISTLE DETECTION:
# A referee whistle is a high-frequency sound (2000-4000 Hz).
# Librosa can detect these peaks in the audio.
# A whistle usually signals the END of a rally = a point scored.

import librosa
import numpy as np
from typing import Optional


# Keywords that indicate key volleyball events in commentary
KILL_KEYWORDS = ["kill", "spike", "attack", "smash", "hammer"]
ACE_KEYWORDS = ["ace", "service ace", "serving ace"]
BLOCK_KEYWORDS = ["block", "blocked", "stuff block"]
POINT_KEYWORDS = ["point", "score", "scores", "scored"]


def detect_whistle_timestamps(audio_path: str) -> list[float]:
    """
    Use Librosa to detect referee whistle sounds in audio.

    Why whistles?
    The referee blows the whistle to signal the END of each rally.
    A whistle = a point was just scored = potential key event.

    How it works:
    1. Load audio with Librosa
    2. Compute Short-Time Fourier Transform (STFT)
    3. Look for strong energy in 2000-4000 Hz range (whistle frequency)
    4. Find timestamps where whistle energy peaks

    Returns:
        List of timestamps (in seconds) where whistles were detected
    """
    try:
        # Load audio file
        # sr=None keeps original sample rate
        y, sr = librosa.load(audio_path, sr=None)

        # Compute STFT — converts audio to frequency domain
        stft = np.abs(librosa.stft(y))

        # Get frequencies for each STFT bin
        frequencies = librosa.fft_frequencies(sr=sr)

        # Find bins in the whistle frequency range (2000-4000 Hz)
        whistle_mask = (frequencies >= 2000) & (frequencies <= 4000)

        # Sum energy in whistle frequency range over time
        whistle_energy = stft[whistle_mask, :].mean(axis=0)

        # Find peaks in whistle energy
        # A peak means a sudden burst of whistle-frequency sound
        mean_energy = np.mean(whistle_energy)
        std_energy = np.std(whistle_energy)

        # Threshold: energy must be 2 standard deviations above mean
        threshold = mean_energy + (2 * std_energy)

        # Find frames where energy exceeds threshold
        whistle_frames = np.where(whistle_energy > threshold)[0]

        # Convert frames to timestamps
        whistle_times = librosa.frames_to_time(whistle_frames, sr=sr)

        # Remove duplicate detections within 2 seconds of each other
        # (one whistle can trigger multiple consecutive frames)
        filtered_times = []
        last_time = -10

        for t in whistle_times:
            if t - last_time > 2.0:
                filtered_times.append(float(t))
                last_time = t

        return filtered_times

    except Exception as e:
        print(f"Whistle detection error: {e}")
        return []


def detect_events_from_transcript(
    segments: list[dict],
    whistle_times: list[float],
    players: list[dict]
) -> list[dict]:
    """
    Analyze transcript segments to find key volleyball events.

    Args:
        segments: Transcript segments from transcription.py
        whistle_times: Whistle timestamps from detect_whistle_timestamps()
        players: List of player dicts with name and number

    Returns:
        List of detected events:
        [
            {
                "event_type": "kill",
                "timestamp_sec": 342.5,
                "player_id": 5,        ← None if not identified
                "transcript_snippet": "number seven kasun with a kill",
                "confidence": 0.85
            },
            ...
        ]
    """
    detected_events = []

    for segment in segments:
        text = segment["text"].lower()
        timestamp = segment["start"]
        event_type = None

        # Check for kill keywords
        if any(keyword in text for keyword in KILL_KEYWORDS):
            event_type = "kill"

        # Check for ace keywords
        elif any(keyword in text for keyword in ACE_KEYWORDS):
            event_type = "ace"

        # Check for block keywords
        elif any(keyword in text for keyword in BLOCK_KEYWORDS):
            event_type = "block"

        if event_type is None:
            continue

        # Check if there's a whistle within 5 seconds of this event
        # This confirms the event is real (referee ended the rally)
        whistle_nearby = any(
            abs(w - timestamp) <= 5.0
            for w in whistle_times
        )

        # Calculate confidence score
        # Higher confidence if whistle was detected nearby
        confidence = 0.9 if whistle_nearby else 0.6

        # Try to identify the player from transcript
        player_id = identify_player(text, players)

        detected_events.append({
            "event_type": event_type,
            # "timestamp_sec": timestamp,
            "timestamp_sec": float(timestamp),
            "player_id": player_id,
            "transcript_snippet": segment["text"],
            # "confidence": confidence
            "confidence": float(confidence)
        })

    return detected_events


def identify_player(
    text: str,
    players: list[dict]
) -> Optional[int]:
    """
    Try to identify which player is mentioned in the transcript.

    Why:
    Whisper may transcribe "number seven kasun with a kill"
    We search the player roster for:
    - Player with number 7
    - Player named "kasun"

    Returns player_id if found, None if not identified.
    """
    text_lower = text.lower()

    for player in players:
        # Check if player name is mentioned
        if player["name"] and player["name"].lower() in text_lower:
            return player["player_id"]

        # Check if player number is mentioned
        if player["number"]:
            number_words = [
                f"number {player['number']}",
                f"#{player['number']}",
                f"no {player['number']}",
                f"no. {player['number']}"
            ]
            if any(nw in text_lower for nw in number_words):
                return player["player_id"]

    return None

# Drop a Video File, Get a YouTube-Ready Recap - My Fully Automated Python Pipeline

I built a fully automated Python pipeline that takes a raw movie or anime episode file and produces two ready-to-publish videos: a **short-form vertical reel** (9:16) and a **long-form landscape video** (16:9) — complete with AI-generated narration, character-focused cropping, dynamic animations, and word-timed subtitles. No manual editing involved.

Here's exactly how it works, step by step.

---

## Step 1: Compress the Video for LLM Analysis

The first thing the pipeline does is create a lightweight copy of the video that's small enough for Google Gemini to process. The original file could be several gigabytes — the compressed version is typically under 50MB.

The FFmpeg command is tuned specifically for LLM consumption:
- Resolution scaled down to **480×270**
- Frame rate dropped to **2 FPS** (enough for visual analysis, tiny file size)
- H.264 with **CRF 32** and `veryslow` preset for maximum compression efficiency
- Mono audio at 24kbps — minimal but present for context

```
ffmpeg -i input.mkv \
  -c:v libx264 -crf 32 -preset veryslow \
  -vf "scale=480:270:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=2" \
  -c:a aac -b:a 24k -ac 1 -ar 22050 \
  -movflags +faststart \
  -x264-params "keyint=120:scenecut=40:b-adapt=2:me=hex:subme=6:ref=3" \
  -f mp4 output_compressed.mp4
```

This works remarkably well — the result is perfectly readable for an LLM while being a fraction of the original size.

---

## Step 2: Extract Audio from the Original Video

Audio is extracted from the **full-quality original** (not the compressed copy) using FFmpeg:

```
ffmpeg -y -i original_video.mkv extracted_audio.mp3
```

This preserves the full audio fidelity needed for accurate speech-to-text in the next step.

---

## Step 3: Speech-to-Text Transcription

The extracted audio is sent to a self-hosted [STT service](https://jebin2-stt.hf.space/) running on Hugging Face Spaces. The service returns a structured JSON containing:
- **Word-level timestamps** — exact start/end time for every spoken word
- **Segment-level timestamps** — grouped chunks of dialogue

These timestamps are critical throughout the pipeline: they're used for credit scene detection, dialogue-to-scene mapping, and eventually for word-timed subtitles in the final video.

---

## Step 4: Detect & Skip Intro/Outro Credit Scenes

Most anime episodes and movies have intro songs, opening credits, and ending sequences that shouldn't appear in a recap. The pipeline detects these automatically.

It works by sending the first 300 seconds and last 300 seconds of the STT word-level transcription to **Gemini LLM** with specialized prompts for intro and outro detection. The LLM analyzes the transcription patterns — song lyrics, musical content, repeated phrases — and returns the precise start/end timestamps of each.

The pipeline doesn't actually trim the video. Instead, it stores these timestamps and uses them as boundaries: all subsequent frame extraction and scene detection only operate within the content region between intro end and outro start.

---

## Step 5: Scene Detection with TransNetV2

This is where things get interesting. Instead of extracting frames at fixed intervals, the pipeline uses **TransNetV2** — a neural network specifically trained to detect shot boundaries in video.

TransNetV2 runs as a separate process in its own Python virtual environment (it has different dependency requirements). It produces a list of scene boundary frame numbers, which are then converted to second-based timestamps using the video's FPS.

The scenes are filtered to exclude anything that falls within the detected intro/outro regions from Step 4.

---

## Step 6: Extract the Sharpest Frame from Each Scene

For every detected scene, the pipeline extracts the **single best representative frame**. "Best" is determined by a composite sharpness scoring system that combines multiple image quality metrics:

- **Laplacian variance** — classic blur detection
- **Sobel edge variance** — edge strength measurement
- **Tenengrad sharpness** — gradient-based focus metric
- **Edge density** — Canny edge distribution
- **Local contrast** — sliding-window standard deviation

Each scene is sampled at up to 5 evenly-spaced points. Every candidate frame goes through several filters before being scored:
- **Black frame detection** — rejects mostly-dark frames
- **FaceDINO duplicate filter** — uses DINO embeddings to skip visually similar frames already extracted from other scenes
- **Person detection** (optional) — ensures frames contain people

The sharpest passing frame is saved as a JPEG. If a scene produces no valid frame (all black, all duplicates), it's dropped entirely.

The total frame count is capped at **700** to keep processing manageable.

---

## Step 7: Map Dialogues to Scenes

During frame extraction, each scene is enriched with its corresponding dialogue. The STT word-level segments from Step 3 are matched to scenes based on time overlap — any word whose timestamp falls within a scene's start/end boundary gets associated with that scene.

The result is a **scene-dialogue map**: a JSON array where each entry contains the scene boundaries, the extracted frame path, the best timestamp, and the concatenated dialogue text for that scene.

Consecutive scenes that share identical dialogue are merged to reduce redundancy.

---

## Step 8: Generate Visual Captions for Every Frame

Every extracted frame needs a text description so the pipeline can later match narration sentences to the right visuals. The captions are generated using multiple AI search engines in parallel:

- **Google AI Search**
- **Brave AI Search**
- **DuckDuckGo AI Search**

Each engine receives the frame image along with context about the content type (e.g., *"This is an Anime frame from the anime called Naruto"*). The `MultiTypeCaptionGenerator` aggregates responses and produces a `scene_caption` for each frame.

These captions are added to the scene-dialogue map, creating a rich metadata structure for each frame: visual description + spoken dialogue + timestamps.

---

## Step 9: Generate the Recap Script with Gemini

Now the pipeline generates the actual narration text. The compressed video (or a transcript file for movies) is sent to **Gemini** along with a carefully crafted system prompt.

The prompts are tuned per content type:
- **Anime short recap** — 130-150 words, fan-energy narration style, hooks first with the peak moment, ends on a cliffhanger
- **Movie short recap** — similar length, cinematic tone
- **Long-form recaps** — more detailed versions for the landscape video

The LLM also generates a **YouTube title** and **Twitter post** for the recap, following strict rules: no show names (keep it mysterious), curiosity-driven hooks, engagement-optimized phrasing.

---

## Step 10: Split the Recap into Sentences

The generated recap is split into individual sentences using a text splitter. Each sentence will become one clip in the final video, with its own frame, audio, and animation.

---

## Step 11: Match Recap Sentences to Scene Captions (LLM)

This is a two-phase matching process to find the right visual for each narration sentence.

**Phase 1 — LLM coarse matching:** The full list of scene captions/dialogues and the list of recap sentences are sent to **AI Studio** (Google's Gemini UI) with a scene-matching system prompt. The LLM pairs each recap sentence with its most relevant scene caption, ensuring no caption is reused more than once. The result is validated through JSON parsing and, if needed, a second LLM pass for JSON correction.

**Phase 2 — Embedding-based fine matching:** A **SentenceTransformer** model (`all-mpnet-base-v2`) refines the matches. It encodes all scene captions and all LLM-matched captions into embedding space, then uses cosine similarity to find the best frame for each sentence. This handles cases where the LLM's text-based matching picked a semantically close but not optimal caption.

The output is a list of `{recap_sentence, frame_path, frame_second, scene_caption}` objects — each sentence now knows exactly which frame and timestamp it corresponds to.

---

## Step 12: Generate Per-Sentence Audio (TTS)

Each recap sentence is converted to speech using a self-hosted [TTS service](https://jebin2-tts.hf.space/) running on Hugging Face Spaces. The generated audio goes through post-processing:
1. **Silence trimming** — removes dead air at the start/end
2. **Speed adjustment** — ensures natural pacing

Each audio file is then **re-transcribed** back through the STT service to get precise word-level timestamps. These word timings are what power the animated subtitles in the final Remotion render — each word appears on screen exactly when it's spoken.

---

## Step 13: Cut Video Clips from the Original Source

For each sentence, a video clip is extracted from the **original full-quality video**. The clip is centered on the frame's timestamp, extending forward and backward by half the sentence's audio duration:

```
clip_start = frame_timestamp - (audio_duration / 2)
clip_end   = frame_timestamp + (audio_duration / 2)
```

The clip is re-encoded at **24 FPS, CRF 18** for consistent quality across all clips. Audio is stripped — the TTS narration will be used instead.

---

## Step 14: Character-Focused Auto-Crop to 9:16 (Short-Form Only)

Raw clips are in the original aspect ratio (usually 16:9). For short-form reels, they need to be converted to **9:16 portrait**.

The pipeline uses **FaceTagger** — a separate tool running in its own virtual environment — to intelligently crop each clip. FaceTagger detects faces and characters in the video, then crops the frame to keep them centered in the 9:16 viewport. This produces clips that always focus on the action and the characters, not empty backgrounds.

---

## Step 15: Choose Animations and Transitions (LLM)

Each clip needs a camera animation (how it moves) and a transition (how it enters). These are chosen by **Gemini** using the narration text and word timings.

The system supports 15 animation types — from `burst` (explosion impact with camera shake) to `ken_burns` (gentle zoom for emotional moments) to `heartbeat` (rhythmic pulsing for suspense). There are 6 transition types: hard cuts, fades, slides, wipes, flips, and tosses.

The LLM analyzes each clip's narration content and assigns the most appropriate animation and transition, following rules like:
- Never use the same animation 3+ times in a row
- First clip should be `zoom_out` or `ken_burns`
- Action narration → `burst`, `punch_in`, `snap`
- Dialogue/calm narration → `ken_burns`, `breathe`

---

## Step 16: Render with Remotion

The final video isn't stitched together with FFmpeg — it's rendered using **Remotion**, a React-based programmatic video framework.

The pipeline generates a **manifest JSON** containing all clip paths, audio paths, durations, word timings, animations, and transitions. Remotion reads this manifest and renders the complete video with:
- Per-clip camera animations
- Smooth transitions between clips
- Word-timed subtitle overlays
- Properly synced narration audio

For short-form: **1080×1920 (9:16)** at 24 FPS.

---

## Step 17: Audio Normalization and HEVC Optimization

The rendered video goes through final post-processing:
1. **Loudness normalization** — ensures consistent volume levels across the entire video
2. **HEVC re-encoding** — the video is converted to H.265/HEVC and compared against the H.264 original. If HEVC produces a smaller file without quality loss, it replaces the original

---

## Step 18: Generate the Long-Form Video

The entire pipeline runs a **second time** for the long-form version, but with key differences:
- Uses a **longer, more detailed recap** generated with a different system prompt
- Produces more sentences and more clips
- Output is **1920×1080 (16:9 landscape)** — standard YouTube format
- Uses **still frames** instead of video clips (with Ken Burns-style animation)
- Skips the FaceTagger 9:16 crop step

The long-form pipeline reuses the scene-dialogue map and captions from the short-form run, so frame extraction and captioning don't need to repeat.

---

## The Full Pipeline at a Glance

```
Input: Raw video file (movie/anime episode)
  │
  ├─ Compress for LLM (480p, 2fps)
  ├─ Extract audio → STT (word-level timestamps)
  ├─ Detect intro/outro credit boundaries
  ├─ TransNetV2 scene detection
  ├─ Extract sharpest frame per scene (composite scoring + dedup)
  ├─ Map dialogues to scenes
  ├─ Generate frame captions (Google/Brave/DDG AI Search)
  │
  ├─── SHORT-FORM (9:16) ──────────────────────────────
  │  ├─ Generate short recap (Gemini) + title/description
  │  ├─ Split recap → sentences
  │  ├─ LLM scene matching → embedding refinement
  │  ├─ TTS per sentence → re-transcribe for word timings
  │  ├─ Cut video clips centered on matched frames
  │  ├─ FaceTagger auto-crop to 9:16
  │  ├─ LLM-chosen animations + transitions
  │  └─ Remotion render → normalize → HEVC optimize
  │
  ├─── LONG-FORM (16:9) ───────────────────────────────
  │  ├─ Generate long recap (Gemini, different prompt)
  │  ├─ Split → match → align (reuses captions)
  │  ├─ TTS per sentence → word timings
  │  ├─ LLM-chosen animations + transitions
  │  └─ Remotion render → normalize → HEVC optimize
  │
  Output: output.mp4 (short) + longform_output.mp4 (long)
```

---

## Tech Stack

| Component | Technology |
|---|---|
| Pipeline orchestration | Python 3.10+ |
| Video processing | FFmpeg, OpenCV, MoviePy |
| Scene detection | TransNetV2 (neural network) |
| Frame quality scoring | Laplacian, Sobel, Tenengrad, Canny, local contrast |
| Duplicate frame filtering | DINO embeddings (FaceDINO) |
| Speech-to-text | Self-hosted HF Spaces STT service |
| Text-to-speech | Self-hosted HF Spaces TTS service |
| LLM (recap, matching, animations) | Google Gemini (via API + AI Studio UI) |
| Frame captioning | Google AI Search, Brave AI Search, DuckDuckGo AI Search |
| Sentence similarity | SentenceTransformer (`all-mpnet-base-v2`) |
| Character-focused cropping | FaceTagger (face detection + auto-crop) |
| Video rendering | Remotion (React-based programmatic video) |
| Video optimization | HEVC/H.265 re-encoding |

---

Thank you for reading! Check out the repo for a deep dive: [github.com/jebin2/reelforge](https://github.com/jebin2/reelforge)

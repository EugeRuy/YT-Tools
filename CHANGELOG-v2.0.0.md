## v2.0.0

### ✨ New Feature — Extract Video
- Download videos from **1000+ platforms** (YouTube, Instagram, Twitter/X, TikTok, Vimeo, Twitch, Facebook, and more)
- URL input field — paste any supported link and download
- Smart filename generation with channel + title slug

### 🎥 Video Quality
- **1080p** download when ffmpeg is installed on your system — `bestvideo[ext=mp4]` (h264) + `bestaudio[ext=m4a]` (aac), merged via stream copy (no re-encoding)
- **720p** fallback when ffmpeg is not available — single stream with audio included
- New **Video Quality** indicator in Settings (⚙) showing ffmpeg status with install link

### 🧠 Engine
- `shared.download_video()` — new reusable function using `yt-dlp` with `-f b` (best single format) or `bestvideo+bestaudio` with ffmpeg
- `_find_yt_dlp()` now uses `shutil.which()` to resolve full executable path, eliminating Access Denied errors
- `shell=False` for reliable argument passing — no cmd.exe interference with paths or special characters
- Output template uses `%(ext)s` for correct file extension on all platforms

### 🔧 Internal
- New `python/download_video.py` wrapper (same pattern as `download_mp3.py`)
- New `src/pages/ExtractVideoPage.tsx` with URL input
- `TaskType` now includes `'download_video'`
- `useTaskForm` updated to handle URL-based tasks alongside `extract_links`
- `ffmpeg:check` IPC handler in main process + `checkFfmpeg()` exposed via preload
- Route `/extract-video` added to App router + NavTabs + HomePage cards

### 📦 Download
`YT-Tools-2.0.0-portable.exe` — 75 MB portable executable, no installation needed. Requires Python 3.8+ with `pip install yt-dlp faster-whisper`.

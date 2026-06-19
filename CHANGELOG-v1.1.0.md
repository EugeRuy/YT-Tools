## v1.1.0

### ✨ New
- Animated grid background with traveling light dots (comet effect with trail) along grid lines
- Redesigned Home page with mini hero logo + tagline

### 🎨 UI
- Red bottom border on nav bar matching card hover style
- Brighter, more visible grid and radial glows
- Window minimum size increased to 1024×860 (no more scroll bar jumping)

### 🐛 Fixed
- Extract Links now uses bundled `yt-dlp.exe` path instead of relying on system PATH
- UTF-8 encoding error when yt-dlp output contains non-ASCII characters
- yt-dlp not found in Python Scripts directory for portable exe
- Removed "or playlist" from description (only channels supported)

### 🔧 Internal
- `shared._find_yt_dlp()` searches additional paths including Python Scripts dir
- `extract_links.py` uses `shared._YT_DLP` with `encoding="utf-8", errors="replace"`

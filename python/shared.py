import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from faster_whisper import WhisperModel

from collections.abc import Sequence


def emit_json(**kwargs: str | int | bool) -> None:
    line = json.dumps(kwargs, ensure_ascii=False)
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


def log(level: str, message: str) -> None:
    emit_json(type="log", level=level, message=message)


def progress(current: int, total: int, message: str = "") -> None:
    emit_json(type="progress", current=current, total=total, message=message)


def error(message: str) -> None:
    emit_json(type="error", message=message)


def complete(success: bool, output_path: str = "", message: str = "") -> None:
    emit_json(type="complete", success=success, output_path=output_path, message=message)


def _slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    text = re.sub(r"-+", "-", text)
    return text


def build_filename(channel: str, title: str, ext: str = "") -> str:
    channel_slug = _slug(channel)
    title_slug = _slug(title)
    if channel_slug or title_slug:
        if channel_slug and title_slug:
            base = f"{channel_slug}-{title_slug}"
        else:
            base = channel_slug or title_slug
    else:
        base = "output"
    return f"{base}{ext}"


def _find_yt_dlp() -> str:
    script_dir = Path(__file__).parent.resolve()
    candidates = [
        script_dir / "yt-dlp.exe",
        script_dir / "yt-dlp",
        script_dir.parent / "yt-dlp.exe",
        script_dir.parent.parent / "resources" / "yt-dlp.exe",
    ]
    for path in candidates:
        if path.exists():
            return str(path)
    return "yt-dlp"


_YT_DLP = _find_yt_dlp()


def get_video_metadata(url: str) -> tuple[str, str]:
    try:
        log("info", f"Fetching metadata for: {url}")
        result = subprocess.run(
            [_YT_DLP, "--no-warnings", "--print", "channel", "--print", "title", url],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            shell=True,
        )
        stdout = result.stdout or ""
        lines = stdout.strip().splitlines()
        channel = lines[0].strip() if len(lines) > 0 else "unknown-channel"
        title = lines[1].strip() if len(lines) > 1 else "unknown-title"
        return channel, title
    except Exception as e:
        log("error", f"Failed to fetch metadata: {e}")
        return "unknown-channel", "unknown-title"


def download_audio(url: str, output_dir: str) -> None:
    cmd = [
        _YT_DLP,
        "--no-warnings",
        "-x",
        "--audio-format", "mp3",
        "-o", f"{output_dir}/%(channel)s-%(title)s.%(ext)s",
        url,
    ]
    try:
        result = subprocess.run(cmd, timeout=600, shell=True)
        if result.returncode != 0:
            raise RuntimeError(f"yt-dlp exited with code {result.returncode}")
        log("info", "Audio downloaded successfully")
    except subprocess.TimeoutExpired:
        log("error", "Audio download timed out")
        raise RuntimeError("Download timed out after 600s")
    except Exception as e:
        log("error", f"download_audio: {type(e).__name__}: {e}")
        raise RuntimeError(f"Download failed: {e}")


def find_audio_file(directory: str) -> str:
    candidates = list(Path(directory).glob("*.mp3")) + list(Path(directory).glob("*.m4a"))
    if candidates:
        candidates.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return str(candidates[0])
    raise RuntimeError(f"No audio file found in {directory}")


def write_text_and_markdown(content: str, base_path: str) -> tuple[Path, Path]:
    base_path = Path(base_path)
    txt_path = base_path.with_suffix(".txt")
    md_path = base_path.with_suffix(".md")
    txt_path.write_text(content, encoding="utf-8")
    md_path.write_text(content, encoding="utf-8")
    log("success", f"Saved {txt_path.name} + {md_path.name}")
    return txt_path, md_path


def load_whisper_model() -> "WhisperModel":
    try:
        from faster_whisper import WhisperModel
    except ModuleNotFoundError:
        log("error", "faster-whisper is not installed. Run: pip install faster-whisper")
        raise RuntimeError("faster-whisper is not installed. Run: pip install faster-whisper")

    model_name = os.environ.get("WHISPER_MODEL", "small")
    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
    log("info", f"Loading Faster-Whisper model ({model_name}, {device}, {compute_type})...")
    model = WhisperModel(model_name, device=device, compute_type=compute_type)
    log("success", "Model loaded")
    return model


def transcribe_audio(audio_path: str, model: "WhisperModel") -> str:
    try:
        beam_size = int(os.environ.get("WHISPER_BEAM_SIZE", "5"))
        log("info", "Transcribing...")
        segments, info = model.transcribe(
            str(audio_path),
            beam_size=beam_size,
            log_progress=False,
        )
        full_text = " ".join(segment.text for segment in segments)
        return full_text.strip()
    except Exception as e:
        log("error", f"Transcription failed: {e}")
        raise


def delete_file(file_path: str) -> None:
    try:
        Path(file_path).unlink()
        log("info", f"Deleted: {Path(file_path).name}")
    except Exception as e:
        log("warn", f"Could not delete: {e}")


def read_url_list(file_path: str) -> list[str]:
    path = Path(file_path)
    if not path.exists():
        log("error", f"File not found: {file_path}")
        return []
    urls = [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    log("info", f"Read {len(urls)} URLs from {path.name}")
    return urls


def write_links_file(urls: Sequence[str], output_path: str, channel_name: str) -> Path:
    content = "\n".join(urls)
    base_path = Path(output_path) / build_filename(channel_name, "video-links")
    write_text_and_markdown(content, base_path)
    return base_path

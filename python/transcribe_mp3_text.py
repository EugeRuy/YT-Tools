import argparse
import os
import shutil
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import shared


def process_url(url: str, model: "WhisperModel", mp3_dir: str, transcripts_dir: str) -> None:
    channel, title = shared.get_video_metadata(url)
    shared.log("info", f"Processing: {channel} - {title}")

    try:
        shared.log("info", f"Downloading audio for: {url}")
        shared.download_audio(url, str(mp3_dir))
        audio_file = shared.find_audio_file(str(mp3_dir))
        shared.log("info", f"Found audio: {audio_file}")

        transcript = shared.transcribe_audio(audio_file, model)
        base_name = shared.build_filename(channel, title)
        shared.log("info", f"base_name: {base_name}")

        expected_name = shared.build_filename(channel, title, ".mp3")
        src = Path(audio_file)
        dst = Path(mp3_dir) / expected_name
        shared.log("info", f"Renaming {src} -> {dst}")
        if src != dst:
            shutil.move(str(src), str(dst))

        txt_path = Path(transcripts_dir) / f"{base_name}.txt"
        md_path = Path(transcripts_dir) / f"{base_name}.md"
        shared.log("info", f"Writing transcript: {txt_path}, {md_path}")
        shared.write_text_and_markdown(
            f"Source: {url}\n\n{transcript}",
            Path(transcripts_dir) / base_name,
        )

        shared.log("success", f"Finished: {base_name}")
    except Exception as e:
        shared.error(f"Failed processing {url}: {e}")
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Download MP3 + transcribe from YouTube URLs")
    parser.add_argument("--input-file", required=True, help="TXT file with YouTube URLs")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    mp3_dir = output_dir / "mp3"
    transcripts_dir = output_dir / "transcripts"
    mp3_dir.mkdir(parents=True, exist_ok=True)
    transcripts_dir.mkdir(parents=True, exist_ok=True)

    urls = shared.read_url_list(args.input_file)
    if not urls:
        shared.complete(True, str(output_dir), "No URLs to process")
        return

    shared.progress(0, len(urls), f"Starting: {len(urls)} URLs")

    try:
        model = shared.load_whisper_model()
        for idx, url in enumerate(urls, 1):
            shared.progress(idx, len(urls), f"Processing {idx}/{len(urls)}")
            process_url(url, model, str(mp3_dir), str(transcripts_dir))
        shared.complete(True, str(output_dir), f"Processed {len(urls)} videos")
    except Exception as e:
        shared.error(str(e))
        shared.complete(False, message=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

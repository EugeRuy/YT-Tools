import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import shared


def process_url(url: str, model: "WhisperModel", output_dir: str) -> None:
    channel, title = shared.get_video_metadata(url)
    shared.log("info", f"Processing: {channel} - {title}")

    temp_dir = Path(output_dir) / "_temp_audio"
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        shared.log("info", f"Downloading audio for: {url}")
        shared.download_audio(url, str(temp_dir))
        shared.log("info", "Finding audio file...")
        audio_file = shared.find_audio_file(str(temp_dir))
        shared.log("info", f"Found audio: {audio_file}")

        transcript = shared.transcribe_audio(audio_file, model)
        base_name = shared.build_filename(channel, title)
        output_path = Path(output_dir) / base_name
        shared.log("info", f"Writing to: {output_path}.txt / .md")
        shared.write_text_and_markdown(
            f"Source: {url}\n\n{transcript}",
            output_path,
        )
        shared.delete_file(audio_file)
        shared.log("success", f"Finished: {base_name}")
    except Exception as e:
        shared.error(f"Failed processing {url}: {e}")
        raise
    finally:
        for f in temp_dir.glob("*"):
            if f.is_file():
                f.unlink()
        try:
            temp_dir.rmdir()
        except OSError:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract text from YouTube videos")
    parser.add_argument("--input-file", required=True, help="TXT file with YouTube URLs")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    urls = shared.read_url_list(args.input_file)
    if not urls:
        shared.complete(True, str(output_dir), "No URLs to process")
        return

    shared.progress(0, len(urls), f"Starting: {len(urls)} URLs")

    try:
        model = shared.load_whisper_model()
        for idx, url in enumerate(urls, 1):
            shared.progress(idx, len(urls), f"Processing {idx}/{len(urls)}")
            process_url(url, model, str(output_dir))
        shared.complete(True, str(output_dir), f"Processed {len(urls)} videos")
    except Exception as e:
        shared.error(str(e))
        shared.complete(False, message=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

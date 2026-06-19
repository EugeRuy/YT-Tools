import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import shared


def main() -> None:
    parser = argparse.ArgumentParser(description="Download MP3 from YouTube URLs")
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
        for idx, url in enumerate(urls, 1):
            shared.progress(idx, len(urls), f"Downloading {idx}/{len(urls)}")
            channel, title = shared.get_video_metadata(url)
            shared.log("info", f"Processing: {channel} - {title}")
            shared.download_audio(url, str(output_dir))
            shared.log("success", f"Downloaded: {shared.build_filename(channel, title, '.mp3')}")
        shared.complete(True, str(output_dir), f"Downloaded {len(urls)} MP3 files")
    except Exception as e:
        shared.error(str(e))
        shared.complete(False, message=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

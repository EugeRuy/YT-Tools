import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import shared


def main() -> None:
    parser = argparse.ArgumentParser(description="Download video from URL")
    parser.add_argument("--url", required=True, help="Video URL (any platform supported by yt-dlp)")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        shared.log("info", f"Downloading video from: {args.url}")
        channel, title = shared.get_video_metadata(args.url)
        shared.log("info", f"Video: {channel} - {title}")
        shared.download_video(args.url, str(output_dir), channel, title)
        output_name = shared.build_filename(channel, title, ".mp4")
        shared.complete(True, str(output_dir), f"Downloaded: {output_name}")
    except Exception as e:
        shared.error(str(e))
        shared.complete(False, message=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

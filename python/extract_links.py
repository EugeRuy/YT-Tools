import argparse
import os
import sys
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import shared
import subprocess


def extract_links_from_channel(url: str) -> list[str]:
    shared.log("info", f"Extracting links from: {url}")

    if not url.startswith(("http://", "https://")):
        shared.log("error", f"Invalid URL: {url}")
        return []

    url_base = url.replace("/videos", "").replace("/live", "").rstrip("/")
    all_links = []

    for tab_suffix, tab_name in [("/videos", "videos"), ("/streams", "streams")]:
        shared.log("info", f"Scanning {tab_name}...")
        try:
            cmd = [
                "yt-dlp",
                "--flat-playlist",
                "--print", "url",
                "--no-warnings",
                "--ignore-errors",
                f"{url_base}{tab_suffix}",
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, shell=True)
            found = [
                l.strip()
                for l in result.stdout.splitlines()
                if l.strip().startswith("http") and "youtube.com/watch" in l
            ]
            shared.log("info", f"Found {len(found)} {tab_name}")
            all_links.extend(found)
        except subprocess.TimeoutExpired:
            shared.log("error", f"Timeout scanning {tab_name}")

    seen = set()
    unique = []
    for l in all_links:
        if l not in seen:
            seen.add(l)
            unique.append(l)

    shared.log("success", f"Total unique links: {len(unique)}")
    return unique


def main():
    parser = argparse.ArgumentParser(description="Extract YouTube channel links")
    parser.add_argument("--url", required=True, help="YouTube channel or playlist URL")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    args = parser.parse_args()

    output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)

    try:
        parsed = urlparse(args.url)
        channel = parsed.path.strip("/").split("/")[-1] or "channel"

        links = extract_links_from_channel(args.url)

        if not links:
            shared.log("warn", "No links found")
            shared.complete(True, output_dir, "No links found")
            return

        base_path = shared.write_links_file(links, output_dir, channel)
        shared.complete(True, str(base_path.parent), f"Saved {len(links)} links to {base_path.name}")
    except Exception as e:
        shared.error(str(e))
        shared.complete(False, message=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()

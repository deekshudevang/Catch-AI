import argparse
import requests
import json
import sys

API_BASE_URL = "http://localhost:8000/api"

def main():
    parser = argparse.ArgumentParser(description="CATCH-AI Command Line Interface")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # scan command
    scan_parser = subparsers.add_parser("scan", help="Scan a disk image")
    scan_parser.add_argument("image_path", help="Path to the disk image file")

    # recover command
    recover_parser = subparsers.add_parser("recover", help="Recover files from a disk image")
    recover_parser.add_argument("image_path", help="Path to the disk image file")
    recover_parser.add_argument("--output-dir", help="Directory to save recovered files", required=True)

    # status command
    subparsers.add_parser("status", help="Check system status and tools integration")

    args = parser.parse_args()

    if args.command == "scan":
        scan(args.image_path)
    elif args.command == "recover":
        recover(args.image_path, args.output_dir)
    elif args.command == "status":
        status()
    else:
        parser.print_help()

def scan(image_path):
    print(f"Scanning image: {image_path}...")
    try:
        response = requests.post(f"{API_BASE_URL}/orchestrate/scan", json={"image_path": image_path})
        response.raise_for_status()
        print_json(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with recovery service: {e}", file=sys.stderr)

def recover(image_path, output_dir):
    print(f"Recovering files from {image_path} to {output_dir}...")
    try:
        response = requests.post(f"{API_BASE_URL}/orchestrate/recover", json={"image_path": image_path, "output_dir": output_dir})
        response.raise_for_status()
        print_json(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with recovery service: {e}", file=sys.stderr)

def status():
    print("Checking system status...")
    try:
        response = requests.get(f"{API_BASE_URL}/system/integration-report")
        response.raise_for_status()
        print_json(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with recovery service: {e}", file=sys.stderr)

def print_json(data):
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()

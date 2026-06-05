#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from pathlib import Path

PROJECT_REF = "hhcjagfhomddigmlbefj"
MCP_URL = f"https://mcp.supabase.com/mcp?project_ref={PROJECT_REF}"


def load_env_token(env_path: Path) -> str:
    if not env_path.exists():
        raise SystemExit(f"Missing {env_path}")

    token = ""
    for line in env_path.read_text().splitlines():
        if line.startswith("SUPABASE_ACCESS_TOKEN="):
            token = line.split("=", 1)[1].strip().strip('"').strip("'")

    if not token:
        raise SystemExit("SUPABASE_ACCESS_TOKEN was not found in .env.local")

    return token


def post_mcp(token: str, payload: dict, session_id: str | None = None) -> tuple[dict, str | None]:
    header_path = Path("/tmp/new-path-supabase-mcp-headers.txt")
    body_path = Path("/tmp/new-path-supabase-mcp-body.json")

    cmd = [
        "curl",
        "-sS",
        "-D",
        str(header_path),
        "-o",
        str(body_path),
        "-H",
        f"Authorization: Bearer {token}",
        "-H",
        "Content-Type: application/json",
        "-H",
        "Accept: application/json, text/event-stream",
        MCP_URL,
        "-d",
        json.dumps(payload),
    ]
    if session_id:
        cmd[cmd.index(MCP_URL) : cmd.index(MCP_URL)] = ["-H", f"Mcp-Session-Id: {session_id}"]

    result = subprocess.run(cmd, check=False, text=True, capture_output=True)
    if result.returncode != 0:
        raise SystemExit(result.stderr.strip() or f"curl exited with {result.returncode}")

    raw = body_path.read_text()
    session_header = None
    if header_path.exists():
        for line in header_path.read_text().splitlines():
            if line.lower().startswith("mcp-session-id:"):
                session_header = line.split(":", 1)[1].strip()

    return json.loads(raw), session_header


def initialize(token: str) -> str:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2025-03-26",
            "capabilities": {},
            "clientInfo": {"name": "new-path-supabase-mcp-workaround", "version": "1.0.0"},
        },
    }
    _, session_id = post_mcp(token, payload)
    if not session_id:
        raise SystemExit("MCP initialize did not return Mcp-Session-Id")
    return session_id


def call_tool(token: str, session_id: str, name: str, arguments: dict) -> dict:
    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {"name": name, "arguments": arguments},
    }
    response, _ = post_mcp(token, payload, session_id)
    return response


def parse_text_content(response: dict) -> object:
    content = response.get("result", {}).get("content", [])
    if len(content) == 1 and content[0].get("type") == "text":
        text = content[0].get("text", "")
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text
    return response


def main() -> int:
    parser = argparse.ArgumentParser(description="Call Supabase MCP using SUPABASE_ACCESS_TOKEN from .env.local")
    subparsers = parser.add_subparsers(dest="command", required=True)

    tables = subparsers.add_parser("list_tables")
    tables.add_argument("--schema", action="append", dest="schemas", default=[])
    tables.add_argument("--verbose", action="store_true")

    sql = subparsers.add_parser("execute_sql")
    sql.add_argument("--query", required=True)

    args = parser.parse_args()
    env_path = Path.cwd() / ".env.local"
    token = load_env_token(env_path)
    session_id = initialize(token)

    if args.command == "list_tables":
        response = call_tool(token, session_id, "list_tables", {"schemas": args.schemas, "verbose": args.verbose})
    elif args.command == "execute_sql":
        response = call_tool(token, session_id, "execute_sql", {"query": args.query})
    else:
        raise SystemExit(f"Unsupported command: {args.command}")

    print(json.dumps(parse_text_content(response), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

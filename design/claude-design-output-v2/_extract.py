#!/usr/bin/env python3
"""Extract files from arca-cd-handoff-bundle.md into a runnable mock folder."""

import re
import sys
from pathlib import Path

BUNDLE = Path(__file__).parent / "arca-cd-handoff-bundle.md"
OUT_ROOT = Path(__file__).parent.parent / "claude-design-output-v3" / "v3-mock"

WANTED = {
    "Arca v3.html",
    "design-canvas.jsx",
    "arca/tweaks-panel.jsx",
    "arca/icons.jsx",
    "arca/practices.jsx",
    "arca/v3-practices-rail.jsx",
    "arca/v3-focus-mode.jsx",
    "arca/v3-execute.jsx",
    "arca/v3-rationale.jsx",
    "arca/v3-rejected.jsx",
    "arca/v3-open-questions.jsx",
    "arca/v3-app.jsx",
    "arca/identity.jsx",
}

text = BUNDLE.read_text()

# Match: ## FILE: `path`\n*size · mime*\n\n```ext\n...content...\n```
pattern = re.compile(
    r"^## FILE: `(?P<path>[^`]+)`\s*\n"
    r"\*[^*]+\*\s*\n\s*\n"
    r"```[a-zA-Z]*\n"
    r"(?P<body>.*?)\n"
    r"```",
    re.DOTALL | re.MULTILINE,
)

written = []
for match in pattern.finditer(text):
    path = match.group("path")
    if path not in WANTED:
        continue
    dest = OUT_ROOT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(match.group("body"))
    written.append((path, len(match.group("body"))))

for path, size in written:
    print(f"  {size:>8}  {path}")
print(f"\n{len(written)} files written to {OUT_ROOT}")
missing = WANTED - {p for p, _ in written}
if missing:
    print(f"\nMISSING: {sorted(missing)}", file=sys.stderr)
    sys.exit(1)

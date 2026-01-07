#!/usr/bin/env python3
"""Verify this skill follows required structure."""

import os
import re
import sys


def main() -> None:
    skill_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skill_md = os.path.join(skill_path, "SKILL.md")

    if not os.path.isfile(skill_md):
        print(f"✗ SKILL.md not found at {skill_path}")
        sys.exit(1)

    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        print("✗ Missing YAML frontmatter. Add --- delimiters.")
        sys.exit(1)

    frontmatter = match.group(1)

    name_match = re.search(r"^name:\s*(.+)$", frontmatter, re.MULTILINE)
    if not name_match:
        print("✗ Missing 'name' in frontmatter")
        sys.exit(1)
    name = name_match.group(1).strip()

    desc_match = re.search(
        r"^description:\s*[\|>]?\s*\n?(.*)", frontmatter, re.MULTILINE | re.DOTALL
    )
    if not desc_match:
        print("✗ Missing 'description' in frontmatter")
        sys.exit(1)
    desc = desc_match.group(1).strip()

    if not re.match(r"^[a-z][a-z0-9-]*$", name):
        print(f"✗ Invalid name format: {name}")
        sys.exit(1)

    if "use when" not in desc.lower():
        print("✗ Description missing 'Use when' trigger")
        sys.exit(1)

    print(f"✓ {name} valid")


if __name__ == "__main__":
    main()

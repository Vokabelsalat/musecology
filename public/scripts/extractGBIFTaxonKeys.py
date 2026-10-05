#!/usr/bin/env python3
"""Extract taxon names and citations from GBIF download descriptions."""

import argparse
import csv
import re
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = SCRIPT_DIR.parent / "data" / "GBIF-Daten.txt"
DEFAULT_OUTPUT = SCRIPT_DIR.parent / "data" / "GBIF-TaxonKeys.csv"
TAXON_KEY_PATTERN = re.compile(r'TaxonKey is ([^"]*)"')
CITATION_PATTERN = re.compile(
    r"When using this dataset please use the following citation:\s*"
    r"(.*?)\s*Download Information",
    re.DOTALL,
)


def extract_rows(source_text: str) -> list[tuple[str, str]]:
    """Pair every taxon key with the citation that precedes it."""
    citations = list(CITATION_PATTERN.finditer(source_text))
    rows: list[tuple[str, str]] = []
    citation_index = 0
    current_citation: str | None = None

    for taxon_match in TAXON_KEY_PATTERN.finditer(source_text):
        while (
            citation_index < len(citations)
            and citations[citation_index].end() < taxon_match.start()
        ):
            current_citation = citations[citation_index].group(1).strip()
            citation_index += 1

        if current_citation is None:
            raise ValueError(
                f"No preceding citation found for taxon key "
                f"{taxon_match.group(1).strip()!r}"
            )

        rows.append((taxon_match.group(1).strip(), current_citation))

    return rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract TaxonKey values and citations from a GBIF text file."
    )
    parser.add_argument(
        "input",
        nargs="?",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"input text file (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"output CSV file (default: {DEFAULT_OUTPUT})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source_text = args.input.read_text(encoding="utf-8")
    rows = extract_rows(source_text)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["taxon_key", "citation"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} taxon keys and citations to {args.output}")


if __name__ == "__main__":
    main()

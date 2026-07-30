#!/usr/bin/env python3
import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any
from typing import Optional


ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = ROOT / "public" / "isoToSpecies_with_latest_assessments.json"
OUTPUT_PATH = ROOT / "public" / "iso_assessment_group_counts.csv"

COUNT_FIELDS = [
    "timeIUCN_code",
    "timeThreat_threatened",
    "timeListing_appendix",
]

ORDINAL_WORDS = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
]


def ordinal_label(index: int) -> str:
    if index < len(ORDINAL_WORDS):
        return ORDINAL_WORDS[index]
    return f"rank{index + 1}"


def normalized_value(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def sorted_counts(species_map: dict[str, Any], field: str) -> list[tuple[str, int]]:
    counter = Counter()

    for _, latest in species_map.items():
        if not isinstance(latest, dict):
            continue
        value = normalized_value(latest.get(field))
        if value is not None:
            counter[value] += 1

    # Deterministic order: most common first, tie-break alphabetically.
    return sorted(counter.items(), key=lambda x: (-x[1], x[0]))


def main() -> None:
    with INPUT_PATH.open("r", encoding="utf-8") as f:
        iso_data = json.load(f)

    per_iso_counts: dict[str, dict[str, list[tuple[str, int]]]] = {}
    max_ranks_by_field = {field: 0 for field in COUNT_FIELDS}

    for iso, species_map in iso_data.items():
        if not isinstance(species_map, dict):
            continue
        per_iso_counts[iso] = {}
        for field in COUNT_FIELDS:
            counts = sorted_counts(species_map, field)
            per_iso_counts[iso][field] = counts
            if len(counts) > max_ranks_by_field[field]:
                max_ranks_by_field[field] = len(counts)

    fieldnames = ["iso"]
    for field in COUNT_FIELDS:
        for i in range(max_ranks_by_field[field]):
            rank_label = ordinal_label(i)
            fieldnames.append(f"{rank_label}_{field}")
            fieldnames.append(f"{rank_label}_{field}_amount")

    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for iso in sorted(per_iso_counts.keys()):
            row = {"iso": iso}
            for field in COUNT_FIELDS:
                counts = per_iso_counts[iso][field]
                for i, (value, amount) in enumerate(counts):
                    rank_label = ordinal_label(i)
                    row[f"{rank_label}_{field}"] = value
                    row[f"{rank_label}_{field}_amount"] = amount
            writer.writerow(row)

    print(f"Wrote CSV: {OUTPUT_PATH}")
    print(f"ISO rows: {len(per_iso_counts)}")


if __name__ == "__main__":
    main()

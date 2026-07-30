#!/usr/bin/env python3
import csv
import json
from pathlib import Path
from typing import Any
from typing import Optional


ROOT = Path(__file__).resolve().parent.parent
ISO_TO_SPECIES_PATH = ROOT / "public" / "isoToSpecies.json"
TIMELINES_CSV_PATH = ROOT / "public" / "data_merged_latest_timelines.csv"
OUTPUT_PATH = ROOT / "public" / "isoToSpecies_with_latest_assessments.json"


def to_int_or_none(value: Any) -> Optional[int]:
    text = str(value).strip()
    if not text:
        return None
    if text.isdigit():
        return int(text)
    return None


def to_str_or_none(value: Any) -> Optional[str]:
    text = str(value).strip()
    return text or None


def load_latest_timelines(csv_path: Path) -> dict[str, dict[str, Any]]:
    by_species: dict[str, dict[str, Any]] = {}

    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            species_name = (row.get("species name") or "").strip()
            if not species_name:
                continue
            by_species[species_name] = {
                "timeIUCN_Year": to_int_or_none(row.get("timeIUCN_Year", "")),
                "timeIUCN_code": to_str_or_none(row.get("timeIUCN_code", "")),
                "timeThreat_assesmentYear": to_int_or_none(row.get("timeThreat_assesmentYear", "")),
                "timeThreat_threatened": to_str_or_none(row.get("timeThreat_threatened", "")),
                "timeListing_year": to_int_or_none(row.get("timeListing_year", "")),
                "timeListing_appendix": to_str_or_none(row.get("timeListing_appendix", "")),
            }

    return by_species


def main() -> None:
    with ISO_TO_SPECIES_PATH.open("r", encoding="utf-8") as f:
        iso_to_species = json.load(f)

    latest_timelines = load_latest_timelines(TIMELINES_CSV_PATH)

    merged: dict[str, dict[str, dict[str, Any]]] = {}
    missing_species = 0

    for iso, species_names in iso_to_species.items():
        merged[iso] = {}
        if not isinstance(species_names, list):
            continue

        for species_name in species_names:
            if species_name in latest_timelines:
                merged[iso][species_name] = latest_timelines[species_name]
            else:
                missing_species += 1
                merged[iso][species_name] = {
                    "timeIUCN_Year": None,
                    "timeIUCN_code": None,
                    "timeThreat_assesmentYear": None,
                    "timeThreat_threatened": None,
                    "timeListing_year": None,
                    "timeListing_appendix": None,
                }

    OUTPUT_PATH.write_text(
        json.dumps(merged, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Wrote JSON: {OUTPUT_PATH}")
    print(f"ISO codes: {len(merged)}")
    print(f"Species without CSV match: {missing_species}")


if __name__ == "__main__":
    main()

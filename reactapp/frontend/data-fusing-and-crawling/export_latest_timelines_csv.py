#!/usr/bin/env python3
import csv
import json
from pathlib import Path
from typing import Any
from typing import Optional


ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = ROOT / "public" / "data_merged_diss_filtered.json"
OUTPUT_PATH = ROOT / "public" / "data_merged_latest_timelines.csv"


def parse_year(value: Any) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)

    text = str(value).strip()
    if not text:
        return None

    if text.isdigit():
        return int(text)

    for sep in ("-", "/"):
        if sep in text:
            first = text.split(sep, 1)[0].strip()
            if first.isdigit():
                return int(first)

    return None


def latest_by_year(entries: Any, year_key: str) -> Optional[dict[str, Any]]:
    if not isinstance(entries, list) or not entries:
        return None

    latest_entry: Optional[dict[str, Any]] = None
    latest_year = -1
    latest_index = -1

    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            continue
        year = parse_year(entry.get(year_key))
        if year is None:
            continue
        if year > latest_year or (year == latest_year and index > latest_index):
            latest_year = year
            latest_index = index
            latest_entry = entry

    return latest_entry


def main() -> None:
    with INPUT_PATH.open("r", encoding="utf-8") as f:
        data_merged = json.load(f)

    fieldnames = [
        "species name",
        "timeIUCN_Year",
        "timeIUCN_code",
        "timeThreat_assesmentYear",
        "timeThreat_threatened",
        "timeListing_year",
        "timeListing_appendix",
    ]

    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for species_name, species_data in data_merged.items():
            time_iucn = latest_by_year(species_data.get("timeIUCN"), "year")
            time_threat = latest_by_year(species_data.get("timeThreat"), "assessmentYear")
            time_listing = latest_by_year(species_data.get("timeListing"), "year")

            writer.writerow(
                {
                    "species name": species_name,
                    "timeIUCN_Year": parse_year(time_iucn.get("year")) if time_iucn else "",
                    "timeIUCN_code": time_iucn.get("code", "") if time_iucn else "",
                    "timeThreat_assesmentYear": parse_year(time_threat.get("assessmentYear")) if time_threat else "",
                    "timeThreat_threatened": time_threat.get("threatened", "") if time_threat else "",
                    "timeListing_year": parse_year(time_listing.get("year")) if time_listing else "",
                    "timeListing_appendix": time_listing.get("appendix", "") if time_listing else "",
                }
            )

    print(f"Wrote CSV: {OUTPUT_PATH}")
    print(f"Rows: {len(data_merged)}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DISS_CSV_PATH = ROOT / "public" / "Diss-list of species for musical instruments.csv"
DATA_MERGED_PATH = ROOT / "public" / "data_merged_manual.json"
OUTPUT_PATH = ROOT / "public" / "data_merged_diss_filtered.json"


def load_scientific_names(csv_path: Path) -> list[str]:
    names: list[str] = []
    seen = set()

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=";")
        if reader.fieldnames is None or "Scientific Name" not in reader.fieldnames:
            raise ValueError("CSV must contain a 'Scientific Name' column.")

        for row in reader:
            name = (row.get("Scientific Name") or "").strip()
            if not name or name in seen:
                continue
            names.append(name)
            seen.add(name)

    return names


def is_wild(domestication_value: object) -> bool:
    value = str(domestication_value or "").strip().lower()
    return value in {"wild", "w"}


def is_max_two_words(scientific_name: str) -> bool:
    return len(scientific_name.split()) <= 2


def main() -> None:
    scientific_names = load_scientific_names(DISS_CSV_PATH)

    with DATA_MERGED_PATH.open("r", encoding="utf-8") as f:
        data_merged = json.load(f)

    matched = {name: data_merged[name] for name in scientific_names if name in data_merged}
    filtered = {
        name: species
        for name, species in matched.items()
        if is_wild(species.get("Domestication")) and is_max_two_words(name)
    }
    missing = [name for name in scientific_names if name not in data_merged]
    excluded_non_wild = [name for name, species in matched.items() if not is_wild(species.get("Domestication"))]
    excluded_name_too_long = [name for name in matched if not is_max_two_words(name)]

    OUTPUT_PATH.write_text(
        json.dumps(filtered, indent=2, ensure_ascii=False).replace("NaN", "null"),
        encoding="utf-8",
    )

    print(f"Scientific names in Diss CSV: {len(scientific_names)}")
    print(f"Species matched in data_merged: {len(matched)}")
    print(f"Species kept (Domestication == Wild and <= 2 words): {len(filtered)}")
    print(f"Species excluded (not Wild): {len(excluded_non_wild)}")
    print(f"Species excluded (Scientific Name > 2 words): {len(excluded_name_too_long)}")
    print(f"Species missing in data_merged: {len(missing)}")
    print(f"Filtered data written to: {OUTPUT_PATH}")

    if missing:
        print("\nMissing species names:")
        for name in missing:
            print(f"- {name}")


if __name__ == "__main__":
    main()

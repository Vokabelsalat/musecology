#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path


CSV_PATH = Path(__file__).resolve().parent.parent / "public" / "manualCountryImport.csv"
COUNTRY_DICT_PATH = Path(__file__).resolve().parent.parent / "public" / "countryDictionary.json"


def parse_iso3_codes(value: str) -> list[str]:
    if not value:
        return []
    return [code.strip() for code in re.split(r"[;,]", value) if code.strip()]


def parse_countries(value: str) -> list[str]:
    if not value:
        return []
    return [country.strip() for country in value.split(",") if country.strip()]


def detect_delimiter(header_line: str) -> str:
    if "\t" in header_line:
        return "\t"
    if ";" in header_line:
        return ";"
    return ","


def main() -> None:
    with COUNTRY_DICT_PATH.open("r", encoding="utf-8") as f:
        country_dict = json.load(f)

    missing_codes: dict[str, list[str]] = {}
    total_rows = 0
    total_codes = 0
    total_missing = 0
    rows_with_length_mismatch = 0

    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        header_line = f.readline().rstrip("\n\r")
        delimiter = detect_delimiter(header_line)
        f.seek(0)

        reader = csv.reader(f, delimiter=delimiter)
        header = next(reader, [])
        if len(header) < 3:
            raise ValueError(
                "CSV header must contain at least 3 columns: "
                "Scientific Name, Country distribution, ISO3"
            )

        for row in reader:
            if not row:
                continue
            total_rows += 1
            species = (row[0] if len(row) > 0 else "").strip()
            countries = parse_countries(row[1] if len(row) > 1 else "")
            iso3_raw = delimiter.join(row[2:]).strip() if len(row) > 2 else ""
            iso3_codes = parse_iso3_codes(iso3_raw)

            total_codes += len(iso3_codes)
            if len(countries) != len(iso3_codes):
                rows_with_length_mismatch += 1
                print(
                    f"[LENGTH MISMATCH] {species}: "
                    f"{len(countries)} countries vs {len(iso3_codes)} ISO3 codes"
                )

            missing_for_row: list[str] = []
            for code in iso3_codes:
                if code not in country_dict:
                    total_missing += 1
                    missing_for_row.append(code)

            if missing_for_row:
                missing_codes[species] = missing_for_row
                print(f"[MISSING] {species}: {', '.join(missing_for_row)}")
            else:
                resolved_names = []
                for code in iso3_codes:
                    name = (
                        country_dict.get(code, {}).get("ROMNAM")
                        or country_dict.get(code, {}).get("isoName")
                        or "UNKNOWN_NAME"
                    )
                    resolved_names.append(f"{code} ({name})")
                print(f"[OK] {species}: {', '.join(resolved_names)}")

    print("\nSummary")
    print(f"- Rows checked: {total_rows}")
    print(f"- ISO3 codes checked: {total_codes}")
    print(f"- Missing ISO3 entries: {total_missing}")
    print(f"- Rows with country/ISO3 length mismatch: {rows_with_length_mismatch}")

    if missing_codes:
        print("- Species with missing codes:")
        for species, codes in missing_codes.items():
            print(f"  {species}: {', '.join(codes)}")


if __name__ == "__main__":
    main()

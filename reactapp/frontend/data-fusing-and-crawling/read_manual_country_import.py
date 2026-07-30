#!/usr/bin/env python3
import csv
import json
from pathlib import Path


CSV_PATH = Path(__file__).resolve().parent.parent / "public" / "manualCountryImport.csv"
COUNTRY_DICT_PATH = Path(__file__).resolve().parent.parent / "public" / "countryDictionary.json"
DATA_MERGED_PATH = Path(__file__).resolve().parent.parent / "public" / "data_merged.json"
DATA_MERGED_OUTPUTPATH = Path(__file__).resolve().parent.parent / "public" / "data_merged_manual.json"


def detect_delimiter(header_line: str) -> str:
    if "\t" in header_line:
        return "\t"
    if ";" in header_line:
        return ";"
    return ","


def main() -> None:
    with COUNTRY_DICT_PATH.open("r", encoding="utf-8") as f:
        country_dict = json.load(f)

    with DATA_MERGED_PATH.open("r", encoding="utf-8") as f:
        data_merged = json.load(f)

    print(f"Loaded country dictionary entries: {len(country_dict)}")
    print(f"Loaded merged species entries: {len(data_merged)}")

    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        header_line = f.readline().rstrip("\n\r")
        delimiter = detect_delimiter(header_line)
        f.seek(0)

        reader = csv.reader(f, delimiter=delimiter)
        header = next(reader, [])
        print("Header:", header)

        for i, row in enumerate(reader, start=1):
            if not row:
                continue
            species = row[0].strip() if len(row) > 0 else ""
            countries = row[1].strip() if len(row) > 1 else ""
            iso3 = delimiter.join(row[2:]).strip() if len(row) > 2 else ""
            iso3_codes = [x.strip() for x in iso3.replace(";", ",").split(",") if x.strip()]
            
            species_country_list = []
            for iso in iso3_codes:
                print(f"ISO {iso} gets mapped to {country_dict[iso]['ROMNAM']}")
                species_country_list.append(country_dict[iso]['ROMNAM'])

            data_merged[species]["manualCountries"] = species_country_list

            # print(
                # f"{i}. species={species} | countries={countries} | iso3={iso3} | "
                # f"resolved={', '.join(resolved)}"
            # )

    DATA_MERGED_OUTPUTPATH.write_text(
        json.dumps(data_merged, indent=2, ensure_ascii=False).replace("NaN", "null"),
        encoding="utf-8",
    )
    print(f"Updated merged data written to {DATA_MERGED_OUTPUTPATH}")


if __name__ == "__main__":
    main()

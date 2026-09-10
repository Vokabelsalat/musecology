#!/usr/bin/env python3
"""Check map geometry and country-dictionary coverage."""

import argparse
import json
import sys
from pathlib import Path
from typing import Any


DEFAULT_GEOJSON = (
    Path(__file__).resolve().parent.parent / "data" / "UN_Worldmap.json"
)
DEFAULT_COUNTRY_DICTIONARY = (
    Path(__file__).resolve().parent.parent / "data" / "countryDictionary.json"
)
DEFAULT_ORCHESTRAS = (
    Path(__file__).resolve().parent.parent / "data" / "Orchestras_worldwide.json"
)
POLYGON_TYPES = {"Polygon", "MultiPolygon"}


def feature_name(feature: dict[str, Any], index: int) -> str:
    """Return a useful label for a feature's output line."""
    properties = feature.get("properties")
    if isinstance(properties, dict):
        for key in ("ROMNAM", "MAPLAB", "NAME", "name", "ISO3CD"):
            value = properties.get(key)
            if value not in (None, ""):
                return str(value)

    feature_id = feature.get("id")
    return f"id={feature_id}" if feature_id is not None else f"index={index}"


def check_features(data: Any) -> tuple[bool, dict[str, dict[str, Any]]]:
    """Print geometry statuses and return validity plus map countries by ISO3 code."""
    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        print("ERROR: The root object is not a GeoJSON FeatureCollection.")
        return False, {}

    features = data.get("features")
    if not isinstance(features, list):
        print("ERROR: FeatureCollection 'features' must be a list.")
        return False, {}

    polygon_count = 0
    null_count = 0
    other_count = 0
    missing_country_code_count = 0
    map_countries: dict[str, dict[str, Any]] = {}

    for index, feature in enumerate(features):
        if not isinstance(feature, dict):
            other_count += 1
            print(f"[{index}] INVALID FEATURE: expected an object")
            continue

        label = feature_name(feature, index)
        geometry = feature.get("geometry")
        properties = feature.get("properties")
        country_code = properties.get("ISO3CD") if isinstance(properties, dict) else None

        if isinstance(country_code, str) and country_code.strip():
            map_countries[country_code.strip()] = properties
        else:
            missing_country_code_count += 1
            print(f"[{index}] {label}: MISSING ISO3CD COUNTRY CODE")

        if geometry is None:
            null_count += 1
            print(f"[{index}] {label}: NULL GEOMETRY")
        elif not isinstance(geometry, dict):
            other_count += 1
            print(
                f"[{index}] {label}: INVALID GEOMETRY "
                "(expected an object or null)"
            )
        elif geometry.get("type") in POLYGON_TYPES:
            polygon_count += 1
            print(f"[{index}] {label}: {geometry['type']} - OK")
        else:
            other_count += 1
            geometry_type = geometry.get("type", "missing type")
            print(f"[{index}] {label}: INVALID GEOMETRY TYPE ({geometry_type})")

    print("\nSummary")
    print(f"  Total features: {len(features)}")
    print(f"  Polygon/MultiPolygon: {polygon_count}")
    print(f"  Null geometry: {null_count}")
    print(f"  Other invalid entries: {other_count}")
    print(f"  Features missing ISO3CD: {missing_country_code_count}")

    is_valid = (
        null_count == 0
        and other_count == 0
        and missing_country_code_count == 0
    )
    print(f"  Geometry result: {'OK' if is_valid else 'PROBLEMS FOUND'}")
    return is_valid, map_countries


def dictionary_country_name(country_code: str, entry: Any) -> str:
    """Return a readable country name from a dictionary entry."""
    if isinstance(entry, dict):
        for key in ("ROMNAM", "MAPLAB", "isoName", "BGCI"):
            value = entry.get(key)
            if value not in (None, ""):
                return str(value)
    return country_code


def check_country_coverage(
    map_countries: dict[str, dict[str, Any]], country_dictionary: Any
) -> bool:
    """Print country-code differences between the map and dictionary."""
    print("\nCountry dictionary comparison")

    if not isinstance(country_dictionary, dict):
        print("ERROR: The country dictionary root must be an object.")
        return False

    dictionary_codes = set(country_dictionary)
    map_codes = set(map_countries)
    missing_from_dictionary = sorted(map_codes - dictionary_codes)
    missing_from_map = sorted(dictionary_codes - map_codes)

    if missing_from_dictionary:
        print("  In UN_Worldmap.json but missing from countryDictionary.json:")
        for country_code in missing_from_dictionary:
            name = dictionary_country_name(
                country_code, map_countries[country_code]
            )
            print(f"    {country_code}: {name}")
    else:
        print("  Every map country appears in countryDictionary.json.")

    if missing_from_map:
        print("  In countryDictionary.json but missing from UN_Worldmap.json:")
        for country_code in missing_from_map:
            name = dictionary_country_name(
                country_code, country_dictionary[country_code]
            )
            print(f"    {country_code}: {name}")
    else:
        print("  Every dictionary country appears in UN_Worldmap.json.")

    print(f"  Unique map country codes: {len(map_codes)}")
    print(f"  Dictionary country codes: {len(dictionary_codes)}")

    is_valid = not missing_from_dictionary and not missing_from_map
    print(f"  Dictionary result: {'OK' if is_valid else 'PROBLEMS FOUND'}")
    return is_valid


def create_dictionary_entry(
    country_code: str, map_properties: dict[str, Any]
) -> dict[str, Any]:
    """Build a dictionary entry using only information available in the map."""
    return {
        "ISO3": country_code,
        "ROMNAM": map_properties.get("ROMNAM", ""),
        "MAPLAB": map_properties.get("MAPLAB", ""),
        "ISO2": "",
        "Numeric": "",
        "isoName": "",
        "BGCI": "",
        "orchestraCountry": "",
        "capital": "replaceME",
    }


def write_country_dictionary(
    country_dictionary: dict[str, Any], dictionary_path: Path
) -> bool:
    """Safely replace the country dictionary with updated JSON."""
    temporary_path = dictionary_path.with_name(
        f".{dictionary_path.name}.tmp"
    )
    try:
        with temporary_path.open("w", encoding="utf-8") as dictionary_file:
            json.dump(
                country_dictionary,
                dictionary_file,
                ensure_ascii=False,
                indent=2,
            )
            dictionary_file.write("\n")
        temporary_path.replace(dictionary_path)
    except (OSError, TypeError) as error:
        temporary_path.unlink(missing_ok=True)
        print(
            f"ERROR: Could not write country dictionary {dictionary_path}: {error}",
            file=sys.stderr,
        )
        return False
    return True


def add_missing_countries(
    map_countries: dict[str, dict[str, Any]],
    country_dictionary: Any,
    dictionary_path: Path,
) -> bool:
    """Add missing map countries to the dictionary and write it to disk."""
    if not isinstance(country_dictionary, dict):
        print("ERROR: The country dictionary root must be an object.")
        return False

    missing_codes = sorted(set(map_countries) - set(country_dictionary))
    if not missing_codes:
        print("\nNo missing dictionary entries to create.")
        return True

    for country_code in missing_codes:
        country_dictionary[country_code] = create_dictionary_entry(
            country_code, map_countries[country_code]
        )

    if not write_country_dictionary(country_dictionary, dictionary_path):
        return False

    print(f"\nCreated {len(missing_codes)} missing dictionary entries:")
    for country_code in missing_codes:
        name = dictionary_country_name(
            country_code, map_countries[country_code]
        )
        print(f"  {country_code}: {name}")
    print(f"Updated: {dictionary_path}")
    return True


def orchestra_country_names(orchestra_data: Any) -> tuple[bool, set[str]]:
    """Extract unique country names from an orchestra GeoJSON file."""
    if (
        not isinstance(orchestra_data, dict)
        or orchestra_data.get("type") != "FeatureCollection"
    ):
        print("ERROR: The orchestra root is not a GeoJSON FeatureCollection.")
        return False, set()

    features = orchestra_data.get("features")
    if not isinstance(features, list):
        print("ERROR: Orchestra FeatureCollection 'features' must be a list.")
        return False, set()

    names: set[str] = set()
    invalid_count = 0
    for index, feature in enumerate(features):
        properties = feature.get("properties") if isinstance(feature, dict) else None
        country = properties.get("Country") if isinstance(properties, dict) else None
        if country is None and isinstance(properties, dict):
            country = properties.get("country")

        if isinstance(country, str) and country.strip():
            names.add(country.strip())
        else:
            invalid_count += 1
            print(f"Orchestra feature [{index}]: MISSING COUNTRY")

    if invalid_count:
        print(f"Orchestra features missing a country: {invalid_count}")
    return invalid_count == 0, names


def match_orchestra_countries(
    orchestra_countries: set[str], country_dictionary: Any
) -> tuple[dict[str, str], list[str], dict[str, list[str]]]:
    """Match orchestra country names exactly against ROMNAM and MAPLAB."""
    if not isinstance(country_dictionary, dict):
        return {}, sorted(orchestra_countries), {}

    names_to_codes: dict[str, set[str]] = {}
    for country_code, entry in country_dictionary.items():
        if not isinstance(entry, dict):
            continue
        for field in ("ROMNAM", "MAPLAB"):
            name = entry.get(field)
            if isinstance(name, str) and name:
                names_to_codes.setdefault(name, set()).add(country_code)

    matches: dict[str, str] = {}
    unmatched: list[str] = []
    ambiguous: dict[str, list[str]] = {}
    for orchestra_country in sorted(orchestra_countries):
        country_codes = sorted(names_to_codes.get(orchestra_country, set()))
        if len(country_codes) == 1:
            matches[country_codes[0]] = orchestra_country
        elif not country_codes:
            unmatched.append(orchestra_country)
        else:
            ambiguous[orchestra_country] = country_codes

    return matches, unmatched, ambiguous


def check_orchestra_countries(
    orchestra_data: Any,
    country_dictionary: Any,
    dictionary_path: Path,
    merge_matches: bool,
) -> bool:
    """Report orchestra-country matches and dictionary values that need updating."""
    print("\nOrchestra country comparison")
    data_is_valid, countries = orchestra_country_names(orchestra_data)
    matches, unmatched, ambiguous = match_orchestra_countries(
        countries, country_dictionary
    )

    merge_is_valid = True
    if merge_matches:
        merge_is_valid = merge_orchestra_countries(
            matches, country_dictionary, dictionary_path
        )

    mismatches: dict[str, str] = {}
    if isinstance(country_dictionary, dict):
        for country_code, orchestra_country in matches.items():
            entry = country_dictionary.get(country_code)
            if not isinstance(entry, dict):
                mismatches[country_code] = orchestra_country
            elif entry.get("orchestraCountry") != orchestra_country:
                mismatches[country_code] = orchestra_country

    print(f"  Unique orchestra countries: {len(countries)}")
    print(f"  Exact ROMNAM/MAPLAB matches: {len(matches)}")

    if unmatched:
        print("  Orchestra countries without an exact dictionary name match:")
        for country in unmatched:
            print(f"    {country}")
    else:
        print("  Every orchestra country has an exact dictionary name match.")

    if ambiguous:
        print("  Ambiguous orchestra country matches:")
        for country, country_codes in ambiguous.items():
            print(f"    {country}: {', '.join(country_codes)}")

    if mismatches:
        print("  Dictionary orchestraCountry values needing an update:")
        for country_code, orchestra_country in sorted(mismatches.items()):
            print(f"    {country_code}: {orchestra_country}")
    else:
        print("  All exact matches already have the correct orchestraCountry value.")

    is_valid = (
        data_is_valid
        and merge_is_valid
        and not unmatched
        and not ambiguous
        and not mismatches
    )
    print(f"  Orchestra result: {'OK' if is_valid else 'PROBLEMS FOUND'}")
    return is_valid


def merge_orchestra_countries(
    matches: dict[str, str],
    country_dictionary: Any,
    dictionary_path: Path,
) -> bool:
    """Set orchestraCountry for every unambiguous exact name match."""
    if not isinstance(country_dictionary, dict):
        print("ERROR: The country dictionary root must be an object.")
        return False

    updates: list[tuple[str, str]] = []
    for country_code, orchestra_country in matches.items():
        entry = country_dictionary.get(country_code)
        if not isinstance(entry, dict):
            continue
        if entry.get("orchestraCountry") != orchestra_country:
            entry["orchestraCountry"] = orchestra_country
            updates.append((country_code, orchestra_country))

    if not updates:
        print("\nNo orchestraCountry values need updating.")
        return True

    if not write_country_dictionary(country_dictionary, dictionary_path):
        return False

    print(f"\nUpdated {len(updates)} orchestraCountry values:")
    for country_code, orchestra_country in sorted(updates):
        print(f"  {country_code}: {orchestra_country}")
    print(f"Updated: {dictionary_path}")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Check GeoJSON polygon geometry and compare its countries with the "
            "country dictionary."
        )
    )
    parser.add_argument(
        "geojson",
        nargs="?",
        type=Path,
        default=DEFAULT_GEOJSON,
        help=f"GeoJSON file to check (default: {DEFAULT_GEOJSON})",
    )
    parser.add_argument(
        "--country-dictionary",
        type=Path,
        default=DEFAULT_COUNTRY_DICTIONARY,
        help=(
            "Country dictionary to check "
            f"(default: {DEFAULT_COUNTRY_DICTIONARY})"
        ),
    )
    parser.add_argument(
        "--orchestras",
        type=Path,
        default=DEFAULT_ORCHESTRAS,
        help=f"Orchestra GeoJSON file to check (default: {DEFAULT_ORCHESTRAS})",
    )
    parser.add_argument(
        "--add-missing-countries",
        action="store_true",
        help=(
            "Create dictionary entries for countries found in the map but missing "
            "from the dictionary; existing entries are never changed"
        ),
    )
    parser.add_argument(
        "--merge-orchestra-countries",
        action="store_true",
        help=(
            "Set orchestraCountry when an orchestra Country exactly matches one "
            "dictionary ROMNAM or MAPLAB value"
        ),
    )
    return parser.parse_args()


def load_json(path: Path, description: str) -> Any:
    """Load a JSON file and print a useful error before exiting on failure."""
    try:
        with path.open(encoding="utf-8") as json_file:
            return json.load(json_file)
    except FileNotFoundError:
        print(f"ERROR: {description} not found: {path}", file=sys.stderr)
    except PermissionError:
        print(f"ERROR: Cannot read {description}: {path}", file=sys.stderr)
    except json.JSONDecodeError as error:
        print(
            f"ERROR: Invalid JSON in {path} "
            f"(line {error.lineno}, column {error.colno}): {error.msg}",
            file=sys.stderr,
        )
    raise SystemExit(2)


def main() -> int:
    args = parse_args()
    data = load_json(args.geojson, "GeoJSON file")
    country_dictionary = load_json(
        args.country_dictionary, "country dictionary"
    )
    orchestra_data = load_json(args.orchestras, "orchestra GeoJSON file")

    geometry_is_valid, map_countries = check_features(data)
    write_is_valid = True
    if args.add_missing_countries:
        write_is_valid = add_missing_countries(
            map_countries,
            country_dictionary,
            args.country_dictionary,
        )

    dictionary_is_valid = check_country_coverage(
        map_countries, country_dictionary
    )
    orchestra_is_valid = check_orchestra_countries(
        orchestra_data,
        country_dictionary,
        args.country_dictionary,
        args.merge_orchestra_countries,
    )

    is_valid = (
        geometry_is_valid
        and dictionary_is_valid
        and orchestra_is_valid
        and write_is_valid
    )
    print(
        f"\nOverall result: "
        f"{'OK' if is_valid else 'PROBLEMS FOUND'}"
    )
    return 0 if is_valid else 1


if __name__ == "__main__":
    raise SystemExit(main())

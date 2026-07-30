# `mergeMapData.py` Process Documentation

This document describes how `data-fusing-and-crawling/mergeMapData.py` enriches species records with map-based IDs.

## Script Location

- `data-fusing-and-crawling/mergeMapData.py`

## Purpose

The script reads species data from `output/data_test.json`, looks up per-species map overlays in `downloaded-data/`, and writes a merged output to `output/data_merged.json`.

## Required Inputs

Run the script from inside `data-fusing-and-crawling/` so relative paths resolve.

- Base species data:
  - `output/data_test.json`
- Optional per-species map files (GeoJSON-like JSON with `features`):
  - `downloaded-data/Species_terrestrial_hexagons/<Species_Name>.json`
  - `downloaded-data/Species_marine_hexagons/<Species_Name>.json`
  - `downloaded-data/Species_terrestrial_ecoregions/<Species_Name>.json`
  - `downloaded-data/Species_marine_ecoregions/<Species_Name>.json`
  - `downloaded-data/Species_bioregions/<Species_Name>.json`

`<Species_Name>` is the scientific name with spaces replaced by underscores (for example `Picea_abies.json`).

## What Gets Merged

For each species in `output/data_test.json`, the script adds these fields when matching files exist:

- `terHexagons`: list of `HexagonID` from terrestrial hexagon features
- `marHexagons`: list of `HexagonID` from marine hexagon features
- `terEcos`: list of `ECO_ID` from terrestrial ecoregion features
- `marEcos`: list of `ECO_CODE` from marine ecoregion features
- `bios`: list of `BIOME_NUM` from bioregion features

## Processing Flow

1. Load `output/data_test.json` into memory.
2. Iterate all species and attempt to merge each map layer type.
3. If a file is missing or unreadable for a layer, log a message and continue.
4. Write merged JSON to `output/data_merged.json`.

## Output

- `output/data_merged.json`

The output is written with indentation and post-processed to replace `NaN` with `null`.

## Run

From project root:

```bash
cd data-fusing-and-crawling
python3 mergeMapData.py
```

## Notes

- Missing layer files are tolerated; the script prints warnings and continues.
- The script uses broad `except` blocks, so malformed JSON and missing files are reported the same way.
- Existing keys in each species record are preserved; only the map ID list fields are added/overwritten.

# `start.py` Pipeline Documentation

This document describes how `data-fusing-and-crawling/start.py` works, which input files it needs, and how to run it with different modes.

## Script Location

- `data-fusing-and-crawling/start.py`

## Required Inputs

The script expects to be run from inside `data-fusing-and-crawling/` so relative paths resolve correctly.

### Mandatory input (as requested)

- `downloaded-data/Database-musical_instruments-species.xlsx`

### Additional required files from `downloaded-data/`

- `downloaded-data/wcvp_names.csv`

### Required Excel sheets in `Database-musical_instruments-species.xlsx`

- `Species-Material Fotos`
- `Botanical species specification`
- `Musical instrument parts to spe`

### Existing output used as input in some modes

- `output/data.json` (required for `offline` and `mixed`)

## Mode Configuration

Mode is configured in the source:

```python
mode = "mixed"  # "offline" # "online" # "dry" # "mixed"
```

The script checks mode via string containment (`if "offline" in mode`, etc.), so combinations work in one string, for example:

- `"online"`
- `"offline"`
- `"mixed"`
- `"dry online"`
- `"dry mixed"`
- `"dry offline"`

## Mode Behavior

- `online`:
  - Loads input files from `downloaded-data/`
  - Crawls external sources (IUCN, BGCI, CITES, Wikipedia)
  - Builds/extends species data

- `offline`:
  - Loads existing `output/data.json`
  - Skips the online crawling block
  - Still executes post-processing (instrument mapping + common name normalization)

- `mixed`:
  - Loads existing `output/data.json`
  - Also runs online crawling for missing species only

- `dry`:
  - Can be combined with other modes
  - Disables file writes guarded by `if "dry" not in mode`

## Processing Steps

1. Optionally loads baseline data from `output/data.json` (`offline`/`mixed`).
2. In `online`/`mixed`:
   - Reads Excel workbook `Database-musical_instruments-species.xlsx`.
   - Uses sheet `Species-Material Fotos` and parses photos via `parsePhotos`.
   - Reads `wcvp_names.csv` to build synonym mappings.
   - Reads sheet `Botanical species specification` and iterates species.
   - For each species (if not already present in `mixed`):
     - Normalizes ecosystem/domestication values.
     - Resolves synonyms.
     - Crawls IUCN, BGCI, CITES, Wikipedia.
     - Attaches parsed photo data.
   - Periodically writes `output/data.json` unless in `dry`.
3. Reads the Excel sheet `Musical instrument parts to spe` and enriches each species with:
   - `groups`, `families`, `instruments`, `main_parts`, `origMat`
4. Normalizes/fixes common names into `fixedCommonNames` with priority:
   - IUCN -> CITES -> Wikipedia
5. Writes final merged result to `output/data_test.json` unless in `dry`.

## Outputs

Depending on mode:

- `output/photos.txt` (online/mixed, not dry)
- `output/data.json` (online/mixed incremental writes, not dry)
- `output/data_test.json` (final output, not dry)

## Run

From project root:

```bash
cd data-fusing-and-crawling
python3 start.py
```

## Notes

- `mode` is currently hardcoded in `start.py` and must be edited manually before running.
- If required input files are missing, the script will fail with file read errors.
- API/network availability is required for `online`/`mixed`.

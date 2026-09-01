# Overall Data Processing Pipeline

This document describes the full end-to-end data processing flow.

## Scope

Core build pipeline:

1. Start with Excel-based source data.
2. Run `start.py` to build species data.
3. Run `mergeMapData.py` to attach map-derived IDs.
4. Copy merged data to `public/` for downstream scripts.

Downstream enrichment and reporting:

5. Optional manual country import.
6. Optional Diss-list filter.
7. Export latest timeline values per species to CSV.
8. Merge latest timeline values into ISO -> species mapping.
9. Aggregate grouped counts per ISO and export to CSV.

## 0. Ground Source Data (Excel + helper files)

The pipeline starts with the Excel workbook in:

- `data-fusing-and-crawling/downloaded-data/Database-musical_instruments-species.xlsx`

`start.py` also expects additional files in `data-fusing-and-crawling/downloaded-data/`:

- `wcvp_names.csv`

Required sheets in `Database-musical_instruments-species.xlsx`:

- `Species-Material Fotos`
- `Botanical species specifications`
- `Musical instrument parts to spe`

For exact requirements and mode behavior, see:

- `docs/start-pipeline-process.md`

## 1. Run `start.py`

From project root:

```bash
cd data-fusing-and-crawling
python3 start.py
```

What this step produces (depending on mode):

- `output/data.json`
- `output/data_test.json` (main handoff file for map merge)
- `output/photos.txt`

Important:

- Configure `mode` directly in `data-fusing-and-crawling/start.py`.
- `offline`/`mixed` modes require existing `output/data.json`.

Detailed step documentation:

- `docs/start-pipeline-process.md`

## 2. Merge Map Data (`mergeMapData.py`)

Run after `start.py` has produced `output/data_test.json`.

From project root:

```bash
cd data-fusing-and-crawling
python3 mergeMapData.py
```

What this step does:

- Reads `output/data_test.json`
- Looks up species map layer JSONs in `downloaded-data/Species_*`
- Adds map ID arrays to each species entry
- Writes `output/data_merged.json`

Detailed step documentation:

- `docs/merge-map-data-process.md`

## 3. Move Merged Output to `public/`

Some downstream scripts expect the merged file in `public/data_merged.json`.

Run:

```bash
cp data-fusing-and-crawling/output/data_merged.json public/data_merged.json
```

## 4. (Optional) Manual Country Import

Adds `manualCountries` from curated CSV:

```bash
python3 data-fusing-and-crawling/read_manual_country_import.py
```

Details:

- `docs/manual-country-import-process.md`

## 5. (Optional) Diss Species Filter

Filters merged data to species listed in the Diss CSV:

```bash
python3 data-fusing-and-crawling/filter_data_merged_by_diss_list.py
```

Details:

- `docs/diss-species-filter-process.md`

## 6. Export Latest Timeline Assessments per Species

Create one CSV row per species with latest values from:

- `timeIUCN` (latest by `year`)
- `timeThreat` (latest by `assessmentYear`)
- `timeListing` (latest by `year`)

Run:

```bash
python3 data-fusing-and-crawling/export_latest_timelines_csv.py
```

Input:

- `public/data_merged.json`

Output:

- `public/data_merged_latest_timelines.csv`

## 7. Merge Latest Assessments into ISO -> Species Mapping

Replace species-name arrays by per-species assessment objects while keeping ISO keys.

Run:

```bash
python3 data-fusing-and-crawling/merge_iso_species_latest_assessments.py
```

Inputs:

- `public/isoToSpecies.json`
- `public/data_merged_latest_timelines.csv`

Output:

- `public/isoToSpecies_with_latest_assessments.json`

## 8. Group and Count Assessment Values per ISO

Group and count, within each ISO, values of:

- `timeIUCN_code`
- `timeThreat_threatened`
- `timeListing_appendix`

Run:

```bash
python3 data-fusing-and-crawling/export_iso_assessment_group_counts.py
```

Input:

- `public/isoToSpecies_with_latest_assessments.json`

Output:

- `public/iso_assessment_group_counts.csv`

## Quick Run Order

Use this order for a fresh full run:

1. Ensure Excel + required `downloaded-data` files are in place.
2. `python3 data-fusing-and-crawling/start.py`
3. `python3 data-fusing-and-crawling/mergeMapData.py`
4. `cp data-fusing-and-crawling/output/data_merged.json public/data_merged.json`
5. (Optional) `python3 data-fusing-and-crawling/read_manual_country_import.py`
6. (Optional) `python3 data-fusing-and-crawling/filter_data_merged_by_diss_list.py`
7. `python3 data-fusing-and-crawling/export_latest_timelines_csv.py`
8. `python3 data-fusing-and-crawling/merge_iso_species_latest_assessments.py`
9. `python3 data-fusing-and-crawling/export_iso_assessment_group_counts.py`

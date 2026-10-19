# Overall Data Processing Pipeline

This document describes the full end-to-end data processing flow.

## Run

All steps are chained in one script, run from the project root:

```bash
python3 data-fusing-and-crawling/run_pipeline.py
```

Options:

- `--mode MODE`: mode passed to `start.py` (`local` by default, see `docs/start-pipeline-process.md`)
- `--from STEP` / `--to STEP`: run only a range of steps, e.g. `--from merge-maps`
- `--list`: list the step names

For every step the script prints the command, the input files (`in`) before and the output files (`out`) after running, with their sizes. An output of one step reappears as `in` of a later step, which shows how the data is chained. The pipeline stops at the first failing step.

All scripts resolve their paths relative to their own location, so they can also be run individually from the project root, e.g. `python3 data-fusing-and-crawling/mergeMapData.py`.

## Steps

Paths are relative to `data-fusing-and-crawling/` unless they start with `public/`.

| # | Step | Script | Input | Output |
| --- | --- | --- | --- | --- |
| 1 | `start` | `start.py` | `downloaded-data/Database-musical_instruments-species.xlsx`, `downloaded-data/wcvp_names.csv`, `output/data.json` (local/offline/mixed) | `output/data_test.json` (+ `output/data.json`, `output/photos.txt` in online/mixed) |
| 2 | `download-maps` | `download_sciebo_folder.py` | sciebo share `/MusEcology/Maps` | `downloaded-data/` (incl. `Species_*` map folders) |
| 3 | `merge-maps` | `mergeMapData.py` | `output/data_test.json`, `downloaded-data/Species_*/` | `output/data_merged.json` |
| 4 | `fix-data` | `fixData.py` | `output/data_merged.json`, `level4.geojson`, `public/data/countryDictionary.json`, `downloaded-data/Reason for changing red list category_2007-2024.csv`, `downloaded-data/wcvp_names.csv`, `downloaded-data/wcvp_distribution.csv` | `public/data/data_merged.json`, `output/zero_ecos.json` |
| 5 | `manual-countries` | `read_manual_country_import.py` | `public/data/data_merged.json`, `public/data/manualCountryImport.csv`, `public/data/countryDictionary.json` | `public/data/data_merged_manual.json` |
| 6 | `filter` | `filter_data_merged_by_diss_list.py` | `public/data/data_merged_manual.json` | `public/data/data_merged_diss_filtered.json` |
| 7 | `statistics` | `export_statistics.py` | `public/data/data_merged_diss_filtered.json`, `public/data/countryDictionary.json`, `public/data/UN_Worldmap.json`, `public/data/WWF_Terrestrial_Ecoregions2017.json`, `public/data/Marine_ecoregions.json`, `public/data/hexagons.json` | `public/data/statistics.json` |
| 8 | `instrument-images` | `crawlInstrumentImages.py` | `downloaded-data/Database-musical_instruments-species.xlsx`, Wikipedia / Wikidata / Commons APIs | `public/data/instrument_images.json` |

### 1. Build species data (`start.py`)

Reads the Excel workbook and, depending on the mode, crawls IUCN, BGCI, CITES and Wikipedia or reuses the crawled data from `output/data.json`. Required sheets in the workbook:

- `Species-Material Fotos`
- `Botanical species specifications`
- `Musical instrument parts to spe`

Details: `docs/start-pipeline-process.md`

### 2. Download map data from sciebo (`download_sciebo_folder.py`)

Downloads the public sciebo folder `/MusEcology/Maps` via WebDAV into `downloaded-data/`. Files are only downloaded if they are missing locally or newer on sciebo, and get the modification time from sciebo, so `merge-maps` can pick the newest of a `.json`/`.geojson` pair. Local files with the same size whose timestamp is only shifted by whole hours (e.g. extracted from a zip) count as up to date and just get their timestamp synced. A different target folder can be passed as argument when running the script on its own.

### 3. Merge map data (`mergeMapData.py`)

Adds map IDs (`terHexagons`, `marHexagons`, `terEcos`, `marEcos`, `bios`) from the per-species files in `downloaded-data/Species_*`.

Details: `docs/merge-map-data-process.md`

### 4. Fix data (`fixData.py`)

- Maps outdated IUCN codes to current categories and adds the reason of change per assessment.
- Normalizes `timeIUCN`, `timeThreat` and `timeListing` years.
- Adds POWO distributions (`powo_areas_L3`, `powo_countries_L4`, `powoCountries`).
- Writes species without any eco/hexagon data to `output/zero_ecos.json`.

### 5. Manual country import (`read_manual_country_import.py`)

Adds `manualCountries` from the curated CSV.

Details: `docs/manual-country-import-process.md`

### 6. Species filter (`filter_data_merged_by_diss_list.py`)

Keeps species with `Domestication` = wild and a scientific name of at most two words.

Details: `docs/diss-species-filter-process.md`

### 7. Statistics (`export_statistics.py`)

Computes the data coverage shown on the unlinked page `/statistics`: totals of countries, ecoregions and hexagons on the world map and how many of them contain species, species missing countries, ecoregions or hexagons (each listed separately), per-ecoregion species lists with kingdom and IUCN breakdown, countries, ecoregions and hexagons per instrument family (with continents and realms), and country values or map IDs that cannot be matched to the map. Species are assigned to countries in the same way as in the frontend (first non-empty source of BGCI, IUCN, POWO, manual).

### 8. Instrument images (`crawlInstrumentImages.py`)

Crawls the top 3 Wikimedia Commons images for every instrument in the Excel sheet `Musical instrument parts to spe`. Already crawled instruments are kept, use `--refresh` when running the script on its own to crawl all again.

Details: `docs/instrument-images-process.md`

## Reporting (not part of `run_pipeline.py`)

Run after the pipeline when the ISO statistics are needed:

```bash
python3 data-fusing-and-crawling/export_latest_timelines_csv.py
python3 data-fusing-and-crawling/merge_iso_species_latest_assessments.py
python3 data-fusing-and-crawling/export_iso_assessment_group_counts.py
```

Details: `docs/iso-assessment-aggregation-pipeline.md`

# ISO Assessment Aggregation Pipeline

This document describes the pipeline that starts with per-species latest timeline export and ends with grouped assessment counts per ISO.

## Scope

Pipeline steps:

1. `export_latest_timelines_csv.py`
2. `merge_iso_species_latest_assessments.py`
3. `export_iso_assessment_group_counts.py`

## Step 1: Export Latest Timeline Values per Species

Script:

- `data-fusing-and-crawling/export_latest_timelines_csv.py`

Run:

```bash
python3 data-fusing-and-crawling/export_latest_timelines_csv.py
```

Input:

- `public/data_merged.json`

Output:

- `public/data_merged_latest_timelines.csv`

What it does:

- For each species, selects latest entries from:
  - `timeIUCN` by `year`
  - `timeThreat` by `assessmentYear`
  - `timeListing` by `year`
- Writes one CSV row per species.

## Step 2: Merge Latest Assessments into ISO -> Species Mapping

Script:

- `data-fusing-and-crawling/merge_iso_species_latest_assessments.py`

Run:

```bash
python3 data-fusing-and-crawling/merge_iso_species_latest_assessments.py
```

Inputs:

- `public/isoToSpecies.json`
- `public/data_merged_latest_timelines.csv`

Output:

- `public/isoToSpecies_with_latest_assessments.json`

What it does:

- Keeps ISO keys.
- Replaces each species-name list with an object mapping species name to latest assessment fields:
  - `timeIUCN_Year`
  - `timeIUCN_code`
  - `timeThreat_assesmentYear`
  - `timeThreat_threatened`
  - `timeListing_year`
  - `timeListing_appendix`

## Step 3: Group and Count Values per ISO

Script:

- `data-fusing-and-crawling/export_iso_assessment_group_counts.py`

Run:

```bash
python3 data-fusing-and-crawling/export_iso_assessment_group_counts.py
```

Input:

- `public/isoToSpecies_with_latest_assessments.json`

Output:

- `public/iso_assessment_group_counts.csv`

What it does:

- For each ISO, groups and counts:
  - `timeIUCN_code`
  - `timeThreat_threatened`
  - `timeListing_appendix`
- Produces ranked columns like:
  - `first_timeIUCN_code`, `first_timeIUCN_code_amount`
  - `second_timeIUCN_code`, `second_timeIUCN_code_amount`
  - `...`

## Quick Run Order

Run from project root:

```bash
python3 data-fusing-and-crawling/export_latest_timelines_csv.py
python3 data-fusing-and-crawling/merge_iso_species_latest_assessments.py
python3 data-fusing-and-crawling/export_iso_assessment_group_counts.py
```

## Notes

- If `public/data_merged.json` changes, rerun all three steps in order.
- Step 2 depends on Step 1 output.
- Step 3 depends on Step 2 output.

# Diss Species Filter Process

This process filters `data_merged.json` to only the species listed in the Diss CSV.

## Files Involved

- Input CSV: `public/Diss-list of species for musical instruments.csv`
- Input JSON: `public/data_merged.json`
- Output JSON: `public/data_merged_diss_filtered.json`
- Script: `data-fusing-and-crawling/filter_data_merged_by_diss_list.py`

## What the Script Does

1. Opens the Diss CSV (`;` delimited).
2. Reads all unique entries from the `Scientific Name` column.
3. Opens `data_merged.json`.
4. Keeps only matching species keys from `data_merged.json`.
5. Writes the filtered dictionary to `data_merged_diss_filtered.json`.
6. Prints a summary:
   - total scientific names in CSV
   - matched species count
   - missing species count
   - list of missing names

## Run

From project root:

```bash
python3 data-fusing-and-crawling/filter_data_merged_by_diss_list.py
```

## Notes

- Matching is exact string matching on species names.
- The script removes duplicate scientific names from the CSV before filtering.
- Output is written as pretty JSON (`indent=2`) and replaces `NaN` with `null`.

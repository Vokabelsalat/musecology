# Manual Country Import Process

This process adds manually curated country mappings from `manualCountryImport.csv` into merged species data.

## Files Involved

- Input CSV: `public/manualCountryImport.csv`
- Country dictionary: `public/countryDictionary.json`
- Base merged data: `public/data_merged.json`
- Output merged data: `public/data_merged_manual.json`
- Script: `data-fusing-and-crawling/read_manual_country_import.py`

## What the Script Does

1. Loads `countryDictionary.json` into memory.
2. Loads `data_merged.json` into memory.
3. Opens and reads `manualCountryImport.csv`.
4. Auto-detects CSV delimiter (`tab`, `;`, or `,`).
5. For each CSV row:
   - Reads `Scientific Name`.
   - Reads `ISO3` list (supports `;` and `,` separators).
   - Maps each ISO3 code to a country name using `countryDictionary.json` (`ROMNAM` field).
   - Writes mapped countries to:
     - `data_merged[species]["manualCountries"]`
6. Writes updated merged data to `public/data_merged_manual.json`.

## Expected CSV Columns

The script expects 3 columns in this order:

1. `Scientific Name`
2. `Country distribution`
3. `ISO3`

## Run

From project root:

```bash
python3 data-fusing-and-crawling/read_manual_country_import.py
```

## Output

After running, check:

- `public/data_merged_manual.json`

Each species found in the CSV will have:

```json
"manualCountries": ["Country A", "Country B", "..."]
```

## Notes

- If an ISO3 code is missing from `countryDictionary.json`, the current script will raise a key error.
- If a species from CSV is not present in `data_merged.json`, the current script will raise a key error.
- This is intentional currently (strict mode), so data issues are visible immediately.

# `crawlInstrumentImages.py` Process Documentation

This document describes how `data-fusing-and-crawling/crawlInstrumentImages.py` collects images for the musical instruments.

## Input

- `data-fusing-and-crawling/downloaded-data/Database-musical_instruments-species.xlsx`, sheet `Musical instrument parts to spe`, column `Instruments` (entries separated by `| `)
- Wikipedia, Wikidata and Wikimedia Commons APIs

## Processing Flow

1. Read all unique instrument names from the Excel sheet.
2. Resolve each name to its English Wikipedia article and Wikidata item:
   - Names in `ARTICLE_OVERRIDES` are mapped to a fixed article (misspellings, variants such as bows).
   - Otherwise the name itself is tried, then a lowercase variant, then the name without pitch prefix (`B♭ Trumpet` -> `Trumpet`).
3. Collect candidate images until 3 are found, in this order:
   1. Wikidata main image (P18)
   2. Images used in the Wikipedia article, in article order
   3. Search in the Commons category of the item (P373)
   4. Search for Commons files depicting the item (P180)
   5. Search for Commons files with the article name in their title (or the query in `COMMONS_SEARCH_OVERRIDES`)
4. Keep only JPEG, PNG, TIFF and WebP files hosted on Commons with a longer side of at least 500 px. Titles that suggest diagrams or notation (`range`, `schematic`, `fingering`, ...) are skipped.

## Output

- `public/data/instrument_images.json`

```json
{
  "Violin": {
    "wikipedia": "Violin",
    "qid": "Q8355",
    "images": [
      {
        "title": "File:Violin VL100.png",
        "link": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Violin_VL100.png",
        "thumb": "https://upload.wikimedia.org/...",
        "page": "https://commons.wikimedia.org/wiki/File:Violin_VL100.png",
        "width": 700,
        "height": 951,
        "license": "CC0",
        "author": "Just plain Bill"
      }
    ]
  }
}
```

`thumb` is an 800 px wide rendering (also for TIFF files, which browsers cannot show). `license`, `author` and `page` are needed for attribution.

## Run

```bash
python3 data-fusing-and-crawling/crawlInstrumentImages.py [--refresh]
```

Instruments that already have 3 images in the output are kept. `--refresh` crawls all instruments again.

## Notes

- Instruments resolving to the same article (e.g. all bows -> `Bow (music)`, `B♭ Trumpet` and `C Trumpet` -> `Trumpet`) get the same images.
- Instruments with fewer than 3 images are listed at the end of the run. To improve them, add an entry to `ARTICLE_OVERRIDES` or `COMMONS_SEARCH_OVERRIDES`.

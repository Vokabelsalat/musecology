import json
import csv
import pandas as pd
import random

from crawlIUCN import crawlIUCN 
from crawlWikipedia import crawlWikipedia
from crawlBGCI import crawlBGCI
from crawlCites import crawlCites
from parseExcel import parsePhotos
from crawlGBIF import query_species, query_occurrences

offline_mode = False
mode = "mixed" # "offline" # "online" # "dry" # "mixed"

all_species = {}

print(f"---- {mode} Mode ----")

if "offline" in mode or "mixed" in mode:
    with open("output/data.json", "r") as f:
        all_species = json.load(f)

if  "mixed" in mode or "online" in mode:
    excel_data = pd.read_excel('./downloaded-data/Database-musical_instruments-species.xlsx', None)

    excelPhotos = excel_data["Species-Material Fotos"]
    excelPhotos = excelPhotos.reset_index()

    powo_syns_by_name = {}
    powo_syns_by_id = {}
    with open('./downloaded-data/wcvp_names.csv', mode='r', encoding="utf-8-sig") as powo_file:
        csv_reader_powo = csv.DictReader(powo_file, delimiter="|")
        powo_rows = list(csv_reader_powo)

        for powo_row in powo_rows:
            if powo_row["taxon_status"] == "Accepted":
                if powo_row['taxon_name'] == ["Dalbergia masoalensis", "Dalbergia bojery", "Loxodonta africana", "Loxodonta cyclotis"]:
                    print("ACC", powo_row['taxon_name'])
                powo_syns_by_name[powo_row["taxon_name"]] = powo_row
                if powo_row["accepted_plant_name_id"] not in powo_syns_by_id:
                    powo_syns_by_id[str(powo_row["accepted_plant_name_id"])] = [powo_row]

            elif powo_row["taxon_status"] == "Synonym":
                if powo_row['taxon_name'] in ["Dalbergia masoalensis", "Dalbergia bojery", "Loxodonta africana", "Loxodonta cyclotis"]:
                    print("SYN", powo_row['taxon_name'])
                if powo_row["accepted_plant_name_id"] not in powo_syns_by_id:
                    powo_syns_by_id[str(powo_row["accepted_plant_name_id"])] = [powo_row]
                else:
                    powo_syns_by_id[str(powo_row["accepted_plant_name_id"])].append(powo_row)

    parsedPhotos = parsePhotos(excelPhotos)

    if "dry" not in mode:
        with open('output/photos.txt', 'w') as f:
            f.write(json.dumps(parsedPhotos, indent=2).replace('NaN', 'null'))
            f.close()

    species_sheet_name = "Botanical species specification"
    if species_sheet_name not in excel_data:
        raise ValueError(
            f"Missing sheet '{species_sheet_name}' in Database-musical_instruments-species.xlsx. "
            f"Available sheets: {list(excel_data.keys())}"
        )

    species_rows_df = excel_data[species_sheet_name].fillna("")
    rows = species_rows_df.to_dict(orient="records")

    # Shuffle the list randomly
    # random.shuffle(rows)

    counter = 0
    # Iterate through the rows
    for row in rows:
        row.pop("Used synonym for distribution data ", None)  # we do not need this column
        row["Ecosystem"] = str(row.get("Ecosystem", "")).replace("Freshwater", "F").replace("Marine", "M").replace("Terrestrial", "T")
        row["Domestication"] = str(row.get("Domestication", "")).replace("Domesticated", "D").replace("Wild", "W")
        speciesName = str(row.get("Scientific Name", "")).strip()
        if not speciesName:
            continue

        if speciesName in all_species: # skip species if his already exists in the data in case of mixed mode
            counter = counter + 1
            continue

        all_species[speciesName] = row # start a new species in the overall dictionary
        print(speciesName, f"{counter}/{len(rows)}")

        ############ SYNONYMES ############
        ### Erst alle von POWO dann von alle IUCN
        ### Save for which synonym we found something
        print(" - SYNONYMES")

        syns = []
        if speciesName in powo_syns_by_name:
            pid = powo_syns_by_name[speciesName]["plant_name_id"]
            if pid in powo_syns_by_id:
                all_species[speciesName]["synonyms"] = powo_syns_by_id[pid]
                for entry in powo_syns_by_id[pid]:
                    if entry["taxon_rank"] == "Species":
                        syns.append({"taxonName": entry["taxon_name"], "author": entry["taxon_authors"]})
            else:
                print("MISSING SYN", pid)

        ########### GBIF ############
        # print(" - GBIF")

        # gbif_search = query_species(speciesName)
        # print(gbif_search)
        # print(query_occurrences(gbif_search["speciesKey"]))

        ############ IUCN ############
        print(" - IUCN")

        [timeAssessments, speciesLocations, populationTrend, commonNames] = crawlIUCN(row["Genus"], row["Species"], syns) 
        all_species[speciesName]["timeIUCN"] = timeAssessments
        all_species[speciesName]["iucnCountries"] = list(set(speciesLocations)) if speciesLocations is not None else []
        all_species[speciesName]["populationTrend"] = populationTrend
        all_species[speciesName]["commonNamesIUCN"] = commonNames

        ############ BGCI ############
        print(" - BGCI")
        all_species[speciesName].update(crawlBGCI(speciesName, syns))

        ############ CITES ############
        print(" - CITES")
        all_species[speciesName].update(crawlCites(speciesName, syns))

        ############ WIKIPEDIA ############

        print(" - WIKIPEDIA")
        all_species[speciesName].update(crawlWikipedia(speciesName, syns))

        ############ PHOTOS ############
        print(" - PHOTOS")
        all_species[speciesName].update({'photos': parsedPhotos[speciesName] if speciesName in parsedPhotos else None})

        if counter % 20 == 0:
            if "dry" not in mode:
                print("\n############### WRITE! ############### WRITE! ############### WRITE! ###############\n")
                allSpeciesFile = open('output/data.json', "w")
                allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
                allSpeciesFile.close()  

        # if counter > 20:
        #     break
        counter = counter + 1 # stop after a few for test purposes

    if "dry" not in mode:
        print("\n############### WRITE! ############### WRITE! ############### WRITE! ###############\n")
        allSpeciesFile = open('output/data.json', "w")
        allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
        allSpeciesFile.close()  

# Read instrument-to-species mapping from the Excel sheet instead of the CSV file.
excel_data_for_parts = pd.read_excel(
    "./downloaded-data/Database-musical_instruments-species.xlsx",
    sheet_name=None,
)
parts_sheet_name = "Musical instrument parts to spe"
if parts_sheet_name not in excel_data_for_parts:
    raise ValueError(
        f"Missing sheet '{parts_sheet_name}' in Database-musical_instruments-species.xlsx. "
        f"Available sheets: {list(excel_data_for_parts.keys())}"
    )

instrument_parts_rows = excel_data_for_parts[parts_sheet_name].fillna("")

for _, row in instrument_parts_rows.iterrows():
    row = row.to_dict()
    specName = str(row.get("Scientific Name", "")).strip()
    if not specName:
        continue

    if specName in all_species:
        instrument_group = str(row.get("Instrument groups", "")).strip()
        if instrument_group:
            if "groups" in all_species[specName]:
                if instrument_group not in all_species[specName]["groups"]:
                    all_species[specName]["groups"].append(instrument_group)
            else:
                all_species[specName]["groups"] = [instrument_group]

        instrument_families = str(row.get("Instrument families", "")).replace(
            "Violin| Viola| Cello| Double Bass",
            "String instruments",
        )
        if instrument_families:
            if "families" in all_species[specName]:
                all_species[specName]["families"].extend(instrument_families.split("| "))
                all_species[specName]["families"] = list(set(all_species[specName]["families"]))
            else:
                all_species[specName]["families"] = list(set(instrument_families.split("| ")))

        instruments = str(row.get("Instruments", "")).strip()
        if instruments:
            if "instruments" in all_species[specName]:
                all_species[specName]["instruments"].extend(instruments.split("| "))
                all_species[specName]["instruments"] = list(set(all_species[specName]["instruments"]))
            else:
                all_species[specName]["instruments"] = list(set(instruments.split("| ")))

        main_part = str(row.get("Main part", "")).strip()
        if main_part:
            if "main_parts" in all_species[specName]:
                all_species[specName]["main_parts"].extend(main_part.split("| "))
                all_species[specName]["main_parts"] = list(set(all_species[specName]["main_parts"]))
            else:
                all_species[specName]["main_parts"] = list(set(main_part.split("| ")))

        orig_mat_entry = {
            "Subpart": row.get("Subpart", ""),
            "Main part": row.get("Main part", ""),
            "Instruments": row.get("Instruments", ""),
            "Instrument families": row.get("Instrument families", ""),
            "Instrument groups": row.get("Instrument groups", ""),
            "Musical instrument classification": row.get("Musical instrument classification", ""),
            "Source (Part - Unique species assignment)": row.get("Source (Part - Unique species assignment)", ""),
            "Source (Part - genus assignment)": row.get("Source (Part - genus assignment)", ""),
        }
        if "origMat" in all_species[specName]:
            all_species[specName]["origMat"].append(orig_mat_entry)
        else:
            all_species[specName]["origMat"] = [orig_mat_entry]

        
# Fix and unify the common names with the priority IUCN, CITES and than Wikipedia
for species in all_species:
    fixedCommonNames = {
        "iucn": {"en": [], "fr": [], "es": [], "de": []},
        "cites": {"en": [], "fr": [], "es": [], "de": []},
        "wiki": {"en": [], "fr": [], "es": [], "de": []}
        }
    
    commonNames = {"en": [], "fr": [], "es": [], "de": []}

    iucns = all_species[species]["commonNamesIUCN"] if "commonNamesIUCN" in all_species[species] else []
    if iucns is not None:
        for iucn in iucns:
            if iucn["language"] == "eng":
                fixedCommonNames["iucn"]["en"].append(iucn["name"])
            if iucn["language"] == "fre":
                fixedCommonNames["iucn"]["fr"].append(iucn["name"])
            if iucn["language"] == "ger":
                fixedCommonNames["iucn"]["de"].append(iucn["name"])
            if iucn["language"] == "spa":
                fixedCommonNames["iucn"]["es"].append(iucn["name"])

    fixedCommonNames["iucn"]["en"] = fixedCommonNames["iucn"]["en"]      
    fixedCommonNames["iucn"]["fr"] = fixedCommonNames["iucn"]["fr"]
    fixedCommonNames["iucn"]["de"] = fixedCommonNames["iucn"]["de"]
    fixedCommonNames["iucn"]["es"] = fixedCommonNames["iucn"]["es"]

    if "commonNamesCites" in all_species[species]:
        cites = all_species[species]["commonNamesCites"]
        for citesLang in cites:
            if citesLang == "de":
                fixedCommonNames["cites"]["de"] = cites[citesLang]
            if citesLang == "es":
                fixedCommonNames["cites"]["es"] = cites[citesLang]
            if citesLang == "fr":
                fixedCommonNames["cites"]["fr"] = cites[citesLang]
            if citesLang == "en":
                fixedCommonNames["cites"]["en"] = cites[citesLang]

    if "labels" in all_species[species]:
        labels = all_species[species]["labels"]
        if labels is not None:
            if "en" in labels:
                fixedCommonNames["wiki"]["en"].append(labels["en"]["value"])
            if "de" in labels:
                fixedCommonNames["wiki"]["de"].append(labels["de"]["value"])
            if "es" in labels:
                fixedCommonNames["wiki"]["es"].append(labels["es"]["value"])
            if "fr" in labels:
                fixedCommonNames["wiki"]["fr"].append(labels["fr"]["value"])

    # Abgleich von iucn und cites wenn wir beides haben, ansonsten priorisierung IUCN, CITES, WIKIPEDIA

    for lang in ["en", "de", "es", "fr"]:
        if len(fixedCommonNames["iucn"][lang]) > 0:
            commonNames[lang] = fixedCommonNames["iucn"][lang]
            commonNames[lang].reverse()
        if len(fixedCommonNames["cites"][lang]) > 0:
            if len(commonNames[lang]) > 0:
                newNames = []
                for e in commonNames[lang]:
                    if e in fixedCommonNames["cites"][lang] and e not in newNames:
                        newNames.append(e)
                commonNames[lang] = newNames
            else:
                commonNames[lang] = fixedCommonNames["cites"][lang]

        if len(commonNames[lang]) == 0 and len(fixedCommonNames["wiki"][lang]) > 0:
            commonNames[lang] = fixedCommonNames["wiki"][lang]

    all_species[species]["fixedCommonNames"] = commonNames
    try:
        del all_species[species]["commonNamesCites"]
    except:
        pass
    try:
        del all_species[species]["labels"]
    except:
        pass
    # all_species[species]["commonNamesAll"] = fixedCommonNames

if "dry" not in mode:
    allSpeciesFile = open('output/data_test.json', "w")
    allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
    allSpeciesFile.close()

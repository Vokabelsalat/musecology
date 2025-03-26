import json
import csv

all_species = {}

with open("output/data_merged.json", "r") as f:
    all_species = json.load(f)

iucn_categories = set()
bgci_categories = set()
cites_categories = set()

iucn_level_mapping = {
    "V": "VU",
    "I": "DD",
    "E": "EN",
    "K": "DD",
    "nt": "LC",
    "R": "NT",
    "NE": "DD",
    "N/A": "DD",
    "LR/lc": "LC",
    "LR/nt": "NT",
    "LR/cd": "NT"
}

powo_level4_mapping = {}

with open("level4.geojson", "r") as f:
    level4 = json.load(f)["features"]
    for e in level4:
        powo_level4_mapping[e["properties"]["Level3_cod"]] = e["properties"]["ISO_Code"]

countriesDict = {}
with open("../public/countryDictionary.json", "r") as f:
    countries = json.load(f)

change_per_species = {}
with open('./downloaded-data/Reason for changing red list category_2007-2024.csv', mode='r', encoding="utf-8-sig") as change_file:
    change_file_reader = csv.DictReader(change_file, delimiter=",")
    change_rows = list(change_file_reader)

    for row in change_rows:
        speciesName = row["Scientific name"]
        year = row["Year"][0:4]
        if speciesName in change_per_species:
            if year in change_per_species[speciesName] and row["Reason for change"] != change_per_species[speciesName][year]:
                print("Multiple assessments per year for", speciesName, row, change_per_species[speciesName][year])
            change_per_species[speciesName][year] = row["Reason for change"]
        else:
            change_per_species[speciesName] = {year: row["Reason for change"]}


for c in countries.values():
    countriesDict[c["ISO2"]] = c["ROMNAM"]

powo_distribution = {}

powo_syns_by_name = {}
powo_syns_by_id = {}
with open('./downloaded-data/wcvp_names.csv', mode='r', encoding="utf-8-sig") as powo_file:
    csv_reader_powo = csv.DictReader(powo_file, delimiter="|")
    powo_rows = list(csv_reader_powo)

    for powo_row in powo_rows:
        if powo_row["taxon_status"] == "Accepted":
            if powo_row['taxon_name'] in ["Alkanna tinctoria"]:
                print("ACC", powo_row['taxon_name'])
            powo_syns_by_name[powo_row["taxon_name"]] = powo_row
            if powo_row["accepted_plant_name_id"] not in powo_syns_by_id:
                powo_syns_by_id[str(powo_row["accepted_plant_name_id"])] = [powo_row]

        elif powo_row["taxon_status"] == "Synonym":
            if powo_row['taxon_name'] in ["Alkanna tinctoria"]:
                print("SYN", powo_row['taxon_name'])
            if powo_row["accepted_plant_name_id"] not in powo_syns_by_id:
                powo_syns_by_id[str(powo_row["accepted_plant_name_id"])] = [powo_row]
            else:
                powo_syns_by_id[str(powo_row["accepted_plant_name_id"])].append(powo_row)

with open('./downloaded-data/wcvp_distribution.csv', mode='r', encoding="utf-8-sig") as file:
    wcvp_distribution = list(csv.DictReader(file, delimiter="|"))
    for row in wcvp_distribution:
        if row["plant_name_id"] in powo_distribution:
            if row["area_code_l3"] not in powo_distribution[row["plant_name_id"]]:
                if str(row["introduced"]) == "0":
                    powo_distribution[row["plant_name_id"]].append(row["area_code_l3"])
        else:
            if str(row["introduced"]) == "0":
                powo_distribution[row["plant_name_id"]] = [row["area_code_l3"]]

zero_country_species = []
missingDistribution = []
zero_ecos = {}

def flatten(xss):
    return [x for xs in xss for x in xs]

for species in all_species:
    print(species)

    if all_species[species]["timeIUCN"] is not None:
        for element in all_species[species]["timeIUCN"]:
            try:
                element["original"] = element["code"]
                element["code"] = iucn_level_mapping[element["code"]]
            except:
                pass
            
            iucn_categories.add(element["code"])
            if "yearPublished" in element:
                element["year"] = int(element["yearPublished"])
                del element["yearPublished"]

    ########## REASON OF CHANGE ##########
    print("########## REASON OF CHANGE ##########")
    if species in change_per_species:
        print("Found", species)
        if all_species[species]["timeIUCN"] is not None:
            for assess in all_species[species]["timeIUCN"]:
                print(assess, change_per_species[species])
                if str(assess["year"]) in change_per_species[species]:
                    print("FOUND AGAIN!")
                    assess["reasonOfChange"] = change_per_species[species][str(assess["year"])]

    for element in all_species[species]["timeThreat"]:
        bgci_categories.add(element["threatened"])

    for element in all_species[species]["timeListing"]:
        cites_categories.add(element["appendix"])
        year = element["effective_at"][0:4]
        element["assessment_year"] = element["year"]
        element["year"] = year

    all_species[species]["treeCountries"] = list(set(all_species[species]["treeCountries"]))
    all_species[species]["iucnCountries"] = list(set(all_species[species]["iucnCountries"]))

    if len(all_species[species]["iucnCountries"]) == 0 and len(all_species[species]["treeCountries"]) == 0 and species not in zero_country_species:
        zero_country_species.append(species)

    if species in powo_syns_by_name:
        allPOWOIds = list(set(flatten([[x['accepted_plant_name_id'], x['plant_name_id']] for x in powo_syns_by_id[powo_syns_by_name[species]["plant_name_id"]]])))
        area_code_l3s = []
        for id in allPOWOIds:
            if id in powo_distribution:
                area_code_l3s.extend(powo_distribution[id])

        if len(area_code_l3s) > 0:
            all_species[species]["powo_areas_L3"] = list(set(area_code_l3s))
            all_species[species]["powo_countries_L4"] = list(set([powo_level4_mapping[x].replace("UK","GB") for x in all_species[species]["powo_areas_L3"]]))
            all_species[species]["powoCountries"] = []
            for x in all_species[species]["powo_countries_L4"]:
                if x in countriesDict:
                    if countriesDict[x] not in all_species[species]["powoCountries"]:
                        all_species[species]["powoCountries"].append(countriesDict[x])
                else:
                    print("Could not find country", x)
        else:
            if species in zero_country_species:
                missingDistribution.append(species)
    else:
        if species in zero_country_species:
            missingDistribution.append(species)

    if "marEcos" not in all_species[species] and "terEcos" not in all_species[species]:
        if "marHexagons" not in all_species[species] and "terHexagons" not in all_species[species]:
            if species not in zero_ecos:
                if all_species[species]["Kingdom"] != "Animalia":
                    zero_ecos[species] = {}
                    if "powoCountries" in all_species[species]:
                        zero_ecos[species]["powo"] = all_species[species]["powoCountries"]
                    if "treeCountries" in all_species[species]:
                        zero_ecos[species]["bgci"] = all_species[species]["treeCountries"]
                    if "iucnCountries" in all_species[species]:
                        zero_ecos[species]["iucn"] = all_species[species]["iucnCountries"]

print("ZERO COUNTRIES", len(zero_country_species), zero_country_species)
print("MISSING DISTRIBUTIONS", len(missingDistribution), missingDistribution)
print("ZERO ECOS", len(zero_ecos.keys()), zero_ecos)


allSpeciesFile = open('../public/data_merged.json', "w")
allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
allSpeciesFile.close()

zero_ecosFile = open('output/zero_ecos.json', "w")
zero_ecosFile.write(json.dumps(zero_ecos, indent=2).replace('NaN', 'null'))
zero_ecosFile.close()

# powo_syns_by_idFile = open('output/powo_syns_by_id.json', "w")
# powo_syns_by_idFile.write(json.dumps(powo_syns_by_id, indent=2).replace('NaN', 'null'))
# powo_syns_by_idFile.close()

# powo_syns_by_nameFile = open('output/powo_syns_by_name.json', "w")
# powo_syns_by_nameFile.write(json.dumps(powo_syns_by_name, indent=2).replace('NaN', 'null'))
# powo_syns_by_nameFile.close()
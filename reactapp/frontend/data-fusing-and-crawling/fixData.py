import json

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
            element["year"] = int(element["yearPublished"])
            del element["yearPublished"]


    for element in all_species[species]["timeThreat"]:
        print(element)
        bgci_categories.add(element["threatened"])

    for element in all_species[species]["timeListing"]:
        cites_categories.add(element["appendix"])
        year = element["effective_at"][0:4]
        element["assessment_year"] = element["year"]
        element["year"] = year

print(iucn_categories)
print(bgci_categories)
print(cites_categories)

allSpeciesFile = open('../public/data_merged.json', "w")
allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
allSpeciesFile.close()
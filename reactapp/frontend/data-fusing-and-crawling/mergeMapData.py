import json

all_species = {}

with open("output/data_test.json", "r") as f:
    all_species = json.load(f)

def merge_terrestrial_hexagons(all_species):
    for species in all_species:
        print(species)

        file_name = species.replace(" ", "_")
        try:
            with open(f"downloaded-data/Species_terrestrial_hexagons/{file_name}.json", "r") as f:
                speciesHexagons = json.load(f)
                print(len(speciesHexagons["features"]))
                all_species[species]["terHexagons"] = [feature["properties"]["HexagonID"] for feature in speciesHexagons["features"]]
        except:
            print(f"Couldn't find terrestrial hexagons for {species}")

def merge_marine_hexagons(all_species):
    for species in all_species:
        print(species)

        file_name = species.replace(" ", "_")
        try:
            with open(f"downloaded-data/Species_marine_hexagons/{file_name}.json", "r") as f:
                speciesHexagons = json.load(f)
                print(len(speciesHexagons["features"]))
                all_species[species]["marHexagons"] = [feature["properties"]["HexagonID"] for feature in speciesHexagons["features"]]
        except:
            print(f"Couldn't find marine hexagons for {species}")

def merge_terrestrial_ecoregions(all_species):
    for species in all_species:
        print(species)

        file_name = species.replace(" ", "_")
        try:
            with open(f"downloaded-data/Species_terrestrial_ecoregions/{file_name}.json", "r") as f:
                speciesHexagons = json.load(f)
                print(len(speciesHexagons["features"]))
                all_species[species]["terEcos"] = [feature["properties"]["ECO_ID"] for feature in speciesHexagons["features"]]
        except:
            print(f"Couldn't find terrestrial ecoregions for {species}")

def merge_marine_ecoregions(all_species):
    for species in all_species:
        print(species)

        file_name = species.replace(" ", "_")
        try:
            with open(f"downloaded-data/Species_marine_ecoregions/{file_name}.json", "r") as f:
                speciesHexagons = json.load(f)
                print(len(speciesHexagons["features"]))
                all_species[species]["marEcos"] = [feature["properties"]["ECO_CODE"] for feature in speciesHexagons["features"]]
        except:
            print(f"Couldn't find marine ecoregions for {species}")

def merge_bio_regions(all_species):
    for species in all_species:
        print(species)

        file_name = species.replace(" ", "_")
        try:
            with open(f"downloaded-data/Species_bioregions/{file_name}.json", "r") as f:
                speciesHexagons = json.load(f)
                print(len(speciesHexagons["features"]))
                all_species[species]["bios"] = [feature["properties"]["BIOME_NUM"] for feature in speciesHexagons["features"]]
        except:
            print(f"Couldn't find bioregions for {species}")


merge_terrestrial_hexagons(all_species)
merge_marine_hexagons(all_species)
merge_terrestrial_ecoregions(all_species)
merge_marine_ecoregions(all_species)
merge_bio_regions(all_species)

allSpeciesFile = open('output/data_merged.json', "w")
allSpeciesFile.write(json.dumps(all_species, indent=2).replace('NaN', 'null'))
allSpeciesFile.close()        
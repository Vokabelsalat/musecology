import json
import csv

species = {}

""" fieldnames = [
    "TS ID","Family","TaxonName in TS","Author1","BGCI_Scope","AssessmentYear","Category","Threatened","Reference","BGCI_URL","GTS ID","GTS TaxonName"
]

with open('./bgciThreatsSearchBySpecies.csv') as csv_file:
    reader = csv.reader(csv_file, delimiter=';')
    bgciThreats = {}
    for row in reader:
        threat = {}
        for i in range(0,len(row)):
            threat[fieldnames[i]] = row[i]

        speciesName = threat["GTS TaxonName"]

        if speciesName in bgciThreats:
            bgciThreats[speciesName].append(threat)
        else:
            bgciThreats[speciesName] = [threat]

with open("./generatedOutput/allBGCIThreats.json", 'w') as outfile:
    json.dump(bgciThreats, outfile, separators=(',', ':'))
    outfile.close() """

for index in range(21,31):
    with open('./timelineAndMapData/generatedData.json'.format(index)) as json_file:
        data = json.load(json_file)
        for p in data:
            print(p)

            obj = data[p]

            obj["allCountries"] = []
            if "treeCountries" in obj:
                newCountries = {}
                countries = obj["treeCountries"]
                for country in countries:
                	if country not in obj["allCountries"]:
                		obj["allCountries"].append(country)
                	newCountries[country] = []
                	for provinceObject in countries[country]:
                	    if provinceObject["province"] != None and provinceObject["province"] not in newCountries[country]:
            		        newCountries[country].append(provinceObject["province"])


                obj["treeCountries"] = newCountries
                obj["treeCountriesShort"] = obj["allCountries"]


            
            # if "trees" in obj:
            #     speciesCountries = []
            #     for tree in obj["trees"]:
            #         if tree["taxon"] == p and "TSGeolinks" in tree:
            #             for geo in tree["TSGeolinks"]:
            #                 speciesCountries.append(geo["country"])

            #     obj["speciesCountries"] = speciesCountries
            #     obj["allCountries"] = speciesCountries

            if 'iucnCountries' in obj:
             	if p in obj['iucnCountries']:
             		countries = []
             		for element in obj['iucnCountries'][p]:
             			if element["distribution_code"] == "Native":
             				countries.append(element['country'])
             				obj['allCountries'].append(element['country'])

             		obj['iucnCountriesShort'] = countries


            if "populationTrend" in obj:
                obj["populationTrend"] = obj["populationTrend"][p][0]

            # Hexagon_distribution_maps
            try:
                hex_filename = './timelineAndMapData/Hexagon_distribution_maps/{}.json'.format(p.strip().replace(" ", "_"))
                with open(hex_filename) as hexagon_file:
                    hexagon_data = json.load(hexagon_file)
                    species_hexagons = []
                    for feature in hexagon_data["features"]:
                        species_hexagons.append(str(feature["properties"]["HexagonID"]));
                        #species_hexagons.append({"hexagonID": str(feature["properties"]["HexagonID"]), "count": feature["properties"]["Join_Count"]})

                    obj["hexagons"] = species_hexagons

            except FileNotFoundError:
                print('File {} was not found.'.format(hex_filename))

            # Ecoregions_distribution_maps
            try:
                eco_filename = './timelineAndMapData/Ecoregions/{}.json'.format(p.strip().replace(" ", "_"))
                with open(eco_filename) as eco_file:
                    ecoregion_data = json.load(eco_file)
                    species_ecoregions = []
                    for feature in ecoregion_data["features"]:
                        species_ecoregions.append(str(feature["properties"]["ECO_ID"]));

                    obj["ecoregions"] = species_ecoregions

            except FileNotFoundError:
                print('File {} was not found.'.format(eco_filename))


            obj.pop('trade', None)
            obj.pop('iucn', None)
            obj.pop('threats', None)
            obj.pop('syns', None)
            obj.pop('synonymos', None)
            obj.pop('species', None)
            obj.pop('trees', None)
            obj.pop('reverseSyns', None)
            obj.pop('allCircleData', None)
            obj.pop('treeSpeciesNamesAndSyns', None)

            species[p] = obj

            with open("./generatedOutput/"+p.strip().replace(" ", "_")+'.json', 'w') as outfile:
                json.dump(obj, outfile, separators=(',', ':'))
                outfile.close()

species.pop("- -", None)

with open("./generatedOutput/allSpecies_test.json", 'w') as outfile:
    json.dump(species, outfile, separators=(',', ':'))
    outfile.close()


    # iucnCats = ["EX", "EW", "RE", "CR", "EN", "VU", "V", "NT", "LC", "DD", "NA", "NE"]

    # notInIUCNCats = []

    # for index in range(11,28):
    #   with open('crawledData ({}).json'.format(index)) as json_file:
    #       print(json_file)
    #       data = json.load(json_file)
    #       for p in data:
    #           genusMode = False
    #           if " " not in p:
    #               genusMode = True

    #           syns = []
    #           if "syns" in data[p]:
    #               for name in data[p]["syns"]:
    #                   for entry in data[p]["syns"][name]:
    #                       if "canonicalName" in entry:
    #                           syns.append([name, entry["canonicalName"]])
                             
    #           data[p]["synonymos"] = syns

    #           if "iucn" in data[p]:
    #               for species in data[p]["iucn"]:
    #                   for entry in data[p]["iucn"][species]:
    #                       if entry["code"] not in iucnCats:
    #                           entry["Scientific Name"] = species;
    #                           notInIUCNCats.append(entry)

    #           if "trade" in data[p]:
    #               with open(p.strip().replace(" ", "_")+'_trades.json', 'w') as outfile:
    #                   json.dump(data[p]["trade"], outfile)
    #           else:
    #               with open(p.strip().replace(" ", "_")+'_trades.json', 'w') as outfile:
    #                   json.dump({}, outfile)

    #           speciesNamesAndSyns = {}
    #           reverseSyns = {}
    #           allAccepted = {p.strip(): 1}

    #           if "trees" in data[p]:
    #               for tree in data[p]["trees"]:
    #                   speciesName = tree["taxon"]

    #                   if genusMode is False and speciesName != p:
    #                       continue

    #                   for syn in syns:
    #                       try:
    #                           index = syn.index(speciesName)
    #                           newIndex = 1 - index
    #                           synonym = syn[newIndex]

    #                           if speciesName not in speciesNamesAndSyns:
    #                               speciesNamesAndSyns[speciesName] = {}

    #                           speciesNamesAndSyns[speciesName].append(synonym)
    #                           reverseSyns[synonym] = speciesName

    #                           allAccepted[synonym] = 1

    #                       except:
    #                           if speciesName not in speciesNamesAndSyns:
    #                               speciesNamesAndSyns[speciesName] = []

    #                       allAccepted[speciesName] = 1;

    #                   if "TSGeolinks" in tree:
    #                       for geo in tree["TSGeolinks"]:
    #                           country = geo["country"]
    #                           province = geo["province"]

    #                           if country in treeSearchCountriesAndProvinces:
    #                               if province not in treeSearchCountriesAndProvinces[country]:
    #                                   treeSearchCountriesAndProvinces[country].append(province)

    #                           else:
    #                               treeSearchCountriesAndProvinces[country] = [province]

                            

    #           if "threats" in data[p]:
    #               with open(p.strip().replace(" ", "_")+'_threats.json', 'w') as outfile:
    #                   json.dump(data[p]["threats"], outfile)

    #                   for threat in data[p]["threats"]:
    #                       if "consAssCategory" in threat and threat["consAssCategory"] is not None:
    #                           if threat["consAssCategory"].strip() not in threatcats:
    #                               threatcats[threat["consAssCategory"].strip()] = 0

    #                           if threatcats[threat["consAssCategory"].strip()] == 0 and threat["bgciUrl"] is not None:
    #                               threatcats[threat["consAssCategory"].strip()] = threat["bgciUrl"]

    #                       if "countries" in threat:
    #                           country = "".join(threat["countries"])
    #                           if country not in threatcountries:
    #                               threatcountries[country] = {}

    #                           if "consAssCategory" in threat and threat["consAssCategory"] is not None:
    #                               cat = threat["consAssCategory"].strip()

    #                               if threatcats[cat] != 1:
    #                                   threatcats[cat] = 1

    #                               if cat not in threatcountries[country]:
    #                                   threatcountries[country][cat] = {
    #                                       "criteriaUsed": ",".join(threat["criteriaUsed"]) if "criteriaUsed" in threat else "",
    #                                       "regionalStatus": ",".join(threat["regionalStatus"]) if "regionalStatus" in threat else "",
    #                                       "comment": threat["comment"],
    #                                       "interpreted": threat["threatened"],
    #                                       "url": threat["bgciUrl"]
    #                                   }
    #                       else:
    #                           if threat["consAssCategory"] is not None:
    #                               cat = threat["consAssCategory"].strip()
    #                               url = threat["bgciUrl"]
    #                               if cat in noCountryThreats:
    #                                   if url not in noCountryThreatsUrls[cat]:
    #                                       noCountryThreats[cat].append(threat)
    #                                       noCountryThreatsUrls[cat].append(url)
    #                               else:
    #                                   noCountryThreats[cat] = [threat]
    #                                   noCountryThreatsUrls[cat] = [url]

    #           else:
    #               with open(p.strip().replace(" ", "_")+'_threats.json', 'w') as outfile:
    #                   json.dump({}, outfile)

    #           data[p]["speciesNamesAndSyns"] = speciesNamesAndSyns
    #           data[p]["allAccepted"] = list(allAccepted.keys())
    #           data[p]["reverseSyns"] = reverseSyns

    #           data[p].pop('trade', None)
    #           data[p].pop('threats', None)
    #           with open(p.strip().replace(" ", "_")+'.json', 'w') as outfile:
    #               json.dump(data[p], outfile)

    # with open('threatcountries.json', 'w') as outfile:
    #   json.dump(threatcountries, outfile)
    #   outfile.close()

    # wfile = open("localThreats.csv", "w")
    # wfile.write(u"%s;%s;%s;%s;%s;%s;%s;%s\n" % ("Land", "Kategorie", "Kriterium", "Regionaler Status", "Kommentar", "Interpretierter Status", "URL", "bgciScope"))
    # #for land in threatcountries:
    # # for cat in threatcountries[land]:
    # #     writeString = "%s;%s;%s;%s;%s;%s;%s;\n" % (land, cat, threatcountries[land][cat]["criteriaUsed"], threatcountries[land][cat]["regionalStatus"], threatcountries[land][cat]["comment"], threatcountries[land][cat]["interpreted"], threatcountries[land][cat]["url"])
    # #     wfile.write(writeString.encode("utf8"))

    # #wfile.write(u";;;;;;\n")
    # #wfile.write(u"No country;;;;;;;\n")
    # for cat in noCountryThreats:
    #   for threat in noCountryThreats[cat]:

    #       criteriaUsed = ",".join(threat["criteriaUsed"]).encode("utf8") if "criteriaUsed" in threat else ""
    #       regionalStatus = ",".join(threat["regionalStatus"]).encode("utf8") if "regionalStatus" in threat else ""
    #       comment = threat["comment"].encode("utf8") if threat["comment"] is not None else ""
    #       interpreted = threat["threatened"].encode("utf8") if threat["threatened"] is not None else ""
    #       url = threat["bgciUrl"].encode("utf8") if threat["bgciUrl"] is not None else ""

    #       writeString = u"%s;%s;%s;%s;%s;%s;%s;%s\n" % ("", cat, criteriaUsed, regionalStatus, comment, interpreted, url, threat['bgciScope'].encode("utf8"))
    #       wfile.write(writeString)


    # wfile.close()


    # wfile = open("notInIUCNCats.csv", "w")
    # wfile.write(u"%s;%s;%s;%s\n" % ("Scientific Name", "Code", "Category", "Year"))

    # for entry in notInIUCNCats:
    #   writeString = u"%s;%s;%s;%s\n" % (entry["Scientific Name"], entry["code"], entry["category"], entry["year"])
    #   wfile.write(writeString)

    # wfile.close()

    # wfile = open("treeSearchCountriesAndProvinces.csv", "w")
    # wfile.write(u"%s;%s\n" % ("country", "province"))

    # for country in treeSearchCountriesAndProvinces:
    #   for province in treeSearchCountriesAndProvinces[country]:
    #       writeString = u"%s;%s\n" % (country, province)
    #       wfile.write(writeString)

    # wfile.close()
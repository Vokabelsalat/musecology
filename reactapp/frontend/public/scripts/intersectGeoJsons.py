import geojson
import json
from shapely.geometry import Polygon, MultiPolygon

countriesGJ = None
with open("./UN_Worldmap_FeaturesToJSON10percentCorrected.json") as f:
    countriesGJ = geojson.load(f)
    #features = gj['features'][0]

ecosGJ = None
with open("./wwf_terr_ecos_Project_Featur10percentCorrected.json") as f:
    ecosGJ = geojson.load(f)

intersections = {}

testCountryNames = False
bgciCountries = ["Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia, Plurinational State of","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, The Democratic Republic of the","Cook Islands","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czech Republic","Denmark","Disputed Territory","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran, Islamic Republic of","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Korea, Democratic People's Republic of","Korea, Republic of","Kuwait","Kyrgyzstan","Lao People's Democratic Republic","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia, Federated States of","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Macedonia","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestine, State of","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Réunion","Romania","Russian Federation","Rwanda","Saint Bathélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia","Saint Martin","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tomé and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Sweden","Switzerland","Syrian Arab Republic","Taiwan, Province of China","Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay","Uzbekistan","Vanuatu","Venezuela, Bolivarian Republic of","Viet Nam","Virgin Islands, British","Virgin Islands, U.S.","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"];

includingCountryNames = {}
if testCountryNames:
    for feature in countriesGJ["features"]:
        for country in bgciCountries:
            if country == feature.properties['ROMNAM']:
                pass
            elif country in feature.properties['ROMNAM'].strip() or country in feature.properties['MAPLAB'].strip():
                if feature.properties['ROMNAM'] in includingCountryNames:
                    includingCountryNames[feature.properties['ROMNAM']].append(country)
                else:
                    includingCountryNames[feature.properties['ROMNAM']] = [country]
            elif (feature.properties['ROMNAM'].strip() is not "" and feature.properties['ROMNAM'].strip() in country) or (feature.properties['MAPLAB'].strip() is not "" and feature.properties['MAPLAB'].strip() in country):
                if feature.properties['ROMNAM'] in includingCountryNames:
                    includingCountryNames[feature.properties['ROMNAM']].append(country)
                else:
                    includingCountryNames[feature.properties['ROMNAM']] = [country]

    with open("./includingCountryNames.json", "w") as f:
        f.write(json.dumps(includingCountryNames))

    print(includingCountryNames)
    exit()

for feature in countriesGJ["features"]:
    if len(feature.geometry.coordinates) > 0:
        polys = []
        if feature.geometry.type == "MultiPolygon":
            for pol in feature.geometry.coordinates:
                polys.append(Polygon(pol[0]))
        else:
            for pol in feature.geometry.coordinates:
                polys.append(Polygon(pol))


        countryname = feature.properties['ROMNAM']
        intersectedRegions = []
        for ecofeature in ecosGJ["features"]:
            try:
                if len(ecofeature.geometry.coordinates) > 0:
                    p2 = Polygon(ecofeature.geometry.coordinates[0])
                    for p1 in polys:
                        if p1.intersects(p2):
                            intersectedRegions.append(ecofeature.id)
            except AttributeError:
                print("AttributeError")
                print(ecofeature)

        intersections[countryname] = intersectedRegions
        #geojsonio.display(json.dumps(intersectedRegions))
    #print(intersections)

with open("./intersectionsOfEcoAndCountries.geo.json", "w") as f:
    f.write(json.dumps(intersections))
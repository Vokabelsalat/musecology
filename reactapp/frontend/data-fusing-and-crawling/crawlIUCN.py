import json
import csv
import time
import random

import requests

# Define custom headers
headers = {
    "Authorization": "HHxRCaC4kzjmRJqSVZvMUf6vRbttZ3Ne7VD2",
    "Accept": "application/json",
    "User-Agent": "MyApp/1.0"
}

def query_assessment_information(assessmentID):
    global headers
    
    url = f"https://api.iucnredlist.org/api/v4/assessment/{assessmentID}"

    # Send GET request with headers
    response = requests.get(url, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        return [
                {
                    "code": data["red_list_category"]["code"], 
                    "yearPublished": int(data["year_published"]),
                    "category": data["red_list_category"]["description"]["en"],
                    "assessmentDate": data["assessment_date"]
                }, 
                [e["code"] for e in data["locations"] if len(e["code"]) == 2] if data["latest"] == True else [], # the locations need to be extracted from the latest assessment
                int(data["population_trend"]["code"]) if data["latest"] == True and data["population_trend"] is not None else None, # population trend
            ]
    else:
        print("Failed to retrieve data:", response.status_code)
        return None

def query_IUCN_taxa_information(genus, species):
    global headers

    # Define the API endpoint
    url = f"https://api.iucnredlist.org/api/v4/taxa/scientific_name?genus_name={genus}&species_name={species}"

    print(url)
    # Send GET request with headers
    response = requests.get(url, headers=headers)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        assessments = data["assessments"]
        commonNames = [e for e in data["taxon"]["common_names"] if e["language"] in ["eng", "fre", "ger", "spa"]]
        timeAssessments = []
        speciesLocations = []
        speciesPopulationTrend = None
        for assessment in assessments:
            scope = assessment["scopes"][0]["code"]
            if scope == "1": # only go forward if the assessment is global (1)
                [timeIucn, locations, populationTrend] = query_assessment_information(assessment["assessment_id"])
                timeAssessments.append(timeIucn)
                if len(locations) > 0:
                    speciesLocations.extend(locations)
                if populationTrend is not None:
                    speciesPopulationTrend = populationTrend

        return [timeAssessments, speciesLocations, speciesPopulationTrend, commonNames]
    else:
        print("Failed to retrieve data:", response.status_code)
        return [None, None, None, None]

def crawlIUCN(genus, species, synonyms):
    # Try the original genus + species first
    time.sleep(random.uniform(0, 1))
    timeAssessments, speciesLocations, populationTrend, commonNames = query_IUCN_taxa_information(genus, species) 

    # Check synonyms if no data is found
    if not timeAssessments:
        print("CHECKING SYNONYMS!")

        for synCounter, synonym in enumerate(synonyms):
            time.sleep(2 + random.uniform(0, 0.5))
            print("Checking with ", synonym["taxonName"])

            splitName = synonym["taxonName"].split(" ")
            if len(splitName) < 2:
                print(f"Skipping invalid synonym: {synonym}")
                continue  # Skip malformed synonyms
            
            # Try querying with the synonym
            timeAssessments, speciesLocations, populationTrend, commonNames = query_IUCN_taxa_information(
                splitName[0], " ".join(splitName[1:])
            )

            if timeAssessments:  # Stop searching if data is found
                print("Found with synonym instead:", synonym)
                for assessment in timeAssessments:
                    assessment["foundBy"] = synonym
                break
    
    return timeAssessments, speciesLocations, populationTrend, commonNames

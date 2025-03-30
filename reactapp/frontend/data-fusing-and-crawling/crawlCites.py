#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Mar 28 00:11:52 2023

@author: kusnick
"""

citesApiToken = 'PWYVqDSjjfzgSqj6wvQ7Dwtt'
headers = {"X-Authentication-Token": citesApiToken}

import pandas as pd
import time
import random
from datetime import datetime

import requests

def getTaxon(species):
    global headers
    
    r = requests.get("https://api.speciesplus.net/api/v1/taxon_concepts.json", headers=headers, params={"name": species})
    result = r.json()
    
    if 'taxon_concepts' in result and len(result['taxon_concepts']) > 0:
        return result['taxon_concepts'][0]['id']
    
    return None

def getListingHistory(taxon_id):
    global headers

    if taxon_id is None:
        return []
    
    url = "https://api.speciesplus.net/api/v1/taxon_concepts/" + str(taxon_id )+ "/cites_legislation.json"
    print(url)

    r = requests.get(url, headers=headers, params={"scope": "all"})
    result = r.json()
    
    if 'cites_listings' in result and len(result['cites_listings']) > 0:
        return list(map(lambda e: {'year': int(e['effective_at'][:4]), 'accessDate': datetime.today().strftime('%Y-%m-%d'), **e}, result['cites_listings']))
    
    return []

def getCommonNames(species):
    global headers
    params = {"name": species}

    r = requests.get("https://api.speciesplus.net/api/v1/taxon_concepts.json", params=params, headers=headers)
    
    result = r.json()
    
    commonNamesCites = {}
    
    if 'taxon_concepts' in result and len(result['taxon_concepts']) > 0:
        print("TRUE")
        for taxon in result['taxon_concepts']:
            if 'common_names' in taxon and len(taxon['common_names']) > 0:
                grouped = pd.DataFrame(taxon['common_names']).groupby(['language'])['name'].apply(list).to_dict()

                if "DE" in grouped and len(grouped["DE"]) > 0:
                    commonNamesCites["de"] = grouped['DE']
                    
                if "ES" in grouped and len(grouped["ES"]) > 0:
                    commonNamesCites["es"] = grouped['ES']
                    
                if "FR" in grouped and len(grouped["FR"]) > 0:
                    commonNamesCites["fr"] = grouped['FR']
                    
                if "EN" in grouped and len(grouped["EN"]) > 0:
                    commonNamesCites["en"] = grouped['EN']
                    
    return commonNamesCites

  
def crawlCites(speciesName, speciesSynonyms):
    print("CITES", speciesName, speciesSynonyms)
    time.sleep(random.uniform(0, 1))
    timeListing = []
    timeListing = getListingHistory(getTaxon(speciesName))

    synCounter = 0
    if timeListing == []:
        print("CHECKING SYNONYMS!")
        for synCounter, synonym in enumerate(speciesSynonyms):
            print("Checking with ", synonym["taxonName"])
            time.sleep(2 + random.uniform(0, 0.5))
            timeListing = getListingHistory(getTaxon(synonym["taxonName"]))
            if timeListing != []:
                print("Found with synonym instead:", synonym)
                for listing in timeListing:
                    listing["foundBy"] = synonym
                break

    commonNamesCites = {}
    if len(timeListing) > 1:
        print("CHECKING COMMON NAMES!")
        commonNamesCites = getCommonNames(speciesName)
        print("commonNamesCites", commonNamesCites)
        if commonNamesCites == {}:
            for synCounter, synonym in enumerate(speciesSynonyms):
                print("Checking with ", synonym["taxonName"])
                time.sleep(2 + random.uniform(0, 0.5))
                commonNamesCites = getCommonNames(synonym["taxonName"])
                print("commonNamesCites", commonNamesCites)
                if commonNamesCites != {}:
                    print("Found with synonym instead:", synonym)
                    break

    return {"timeListing": timeListing, "commonNamesCites": commonNamesCites}
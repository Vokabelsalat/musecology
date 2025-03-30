#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 22 14:58:07 2023

@author: kusnick
"""

from bs4 import BeautifulSoup

import requests
import re  
import time
import random
from datetime import datetime

def getTreeSearch(species):
    splitArray = species.split(" ")
    genus = splitArray[0]
    species = " ".join(splitArray[1:])
    
    url = "https://data.bgci.org/treesearch/genus/" + genus + "/species/" + species
    r = requests.get(url)

    print(url)
    
    result = r.json()

    return result['results'] if 'results' in result else []

def filterOutCountryNames(treeSearch):
    countries = []
    TSGeolinks = sum(map(lambda e: e['TSGeolinks'], treeSearch), [])
    countries = list(map(lambda e: e['country'], TSGeolinks))

    return countries

def getThreatSearch(species):
    splitArray = species.split(" ")
    genus = splitArray[0]
    species = " ".join(splitArray[1:])
    
    url = "https://data.bgci.org/threatsearch/genus/" + genus + "/species/" + species

    print(url)

    r = requests.get(url)
    
    result = r.json()

    return result['results'] if 'results' in result else []

def getNationalRedList(threat):
    
    url = threat['bgciUrl']

    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'}
    
    r = requests.post(url, headers=headers)

    html = r.text

    # parse the HTML
    soup = BeautifulSoup(html, "html.parser")
    
    border = soup.find(id='search_generic_border')
    
    if border is not None:
        country = border.get_text().strip().replace("Country: ", "").strip()
        country = re.sub("\(.*\)", "", country).strip()
    else:
        country = None
        
    return country
    
def crawlBGCI(speciesName, speciesSynonyms):
    found = None
    time.sleep(random.uniform(0, 1))
    threatSearch = getThreatSearch(speciesName)

    if not threatSearch:
        print("CHECKING SYNONYMS!")
        for synCounter, synonym in enumerate(speciesSynonyms):
            time.sleep(2 + random.uniform(0, 0.5))
            print("Checking with ", synonym["taxonName"])
            threatSearch = getThreatSearch(synonym["taxonName"])
            if threatSearch:
                print("Found with synonym instead:", synonym)
                found = synonym
                break

    tmpThreats = []
    
    for threat in threatSearch:
        threat["accessDate"] = datetime.today().strftime('%Y-%m-%d')
        if threat["bgciScope"] == "Global" and ((threat["taxonName"] == found["taxonName"] if found is not None else "") or threat["taxonName"] == speciesName):
            if found is not None:
                threat["foundBy"] = found
            if threat['reference'] == 'NationalRL_0915' or threat['reference'] == 'National Red List':
                country = getNationalRedList(threat)
                threat['country'] = country
            tmpThreats.append({key: threat[key] for key in ["reference", "taxonName", "threatened", "assessmentYear", "bgciScope", "foundBy", "accessDate"] if key in threat})

    treeSearch = getTreeSearch(speciesName)

    synCounter = 0
    found = None
    if treeSearch == []:
        print("CHECKING SYNONYMS!")
        for synCounter, synonym in enumerate(speciesSynonyms):
            time.sleep(2 + random.uniform(0, 0.5))
            print("Checking with ", synonym["taxonName"])
            treeSearch = getTreeSearch(synonym["taxonName"])
            if treeSearch != []:
                print("Found with synonym instead:", synonym)
                found = synonym
                break
        
    return {
            'treeCountries': filterOutCountryNames(treeSearch), 
            'treeAccess': datetime.today().strftime('%Y-%m-%d'),
            'timeThreat': tmpThreats,
            "treeCountriesFoundBy": found
            }

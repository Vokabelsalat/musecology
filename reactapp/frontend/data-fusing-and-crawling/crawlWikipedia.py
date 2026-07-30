#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr  3 19:51:42 2023

@author: kusnick
"""

import requests
import time
import random
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from urllib.parse import quote

headers = {
    # Use a descriptive User-Agent for Wikimedia APIs.
    "User-Agent": "musecology-data-bot/1.0 (contact: jakob.kusnick@uib.no)",
    "Accept": "application/json",
}

session = requests.Session()
retry = Retry(
    total=5,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
)
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)
session.mount("http://", adapter)


def get_json(url, params=None):
    try:
        r = session.get(url, headers=headers, params=params, timeout=20)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except ValueError:
        print("Could not parse JSON response.")
        return None

def getQID(speciesName):

    result = get_json(
        "https://www.wikidata.org/w/api.php",
        {"action": "wbgetentities", "sites": "specieswiki", "titles": speciesName, "format": "json"},
    )
    if result is None:
        return
    
    if 'entities' in result and len(result['entities']) > 0:
        for qID in result['entities']:
            entity = result['entities'][qID]
            if 'labels' in entity:
                labelValues = list(map(lambda e: e['value'], list(entity['labels'].values())))

                if speciesName in labelValues:
                    return qID
                
def getLabels(speciesName):
    result = get_json(
        "https://www.wikidata.org/w/api.php",
        {"action": "wbgetentities", "sites": "specieswiki", "titles": speciesName, "format": "json"},
    )
    if result is None:
        return
    
    if 'entities' in result and len(result['entities']) > 0:
        for qID in result['entities']:
            entity = result['entities'][qID]
            if 'labels' in entity:
                return {key: entity["labels"][key] for key in ["en", "de", "es", "fr"] if key in entity["labels"]}
    

def getImages(speciesName):
    # https://commons.wikimedia.org/w/api.php?action=query&prop=images&imlimit=10&redirects=1&titles=Cedrus%20deodara

    result = get_json(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "format": "json", "imlimit": 10, "prop": "images", "redirects": 1, "titles": speciesName},
    )
    if result is None:
        return []

    # print(result)
    
    if 'query' in result:
        if 'pages' in result['query']:
            return list(map(lambda e: list(map(lambda e: e['title'], e['images'] if 'images' in e else [])), list(result['query']['pages'].values())))
    
    else:
        return []
    
    # if 'query' in result:
    #     if 'pages' in result['query']:
    #         return list(map(lambda e: e['imageinfo'][0]['url'], list(result['query']['pages'].values())))
    # else:
    #     return []
    
def getMediaTitles(speciesName):
    # https://en.wikipedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg&prop=imageinfo
    url = "https://en.wikipedia.org/api/rest_v1/page/media-list/" + quote(speciesName, safe="")
    result = get_json(url, {"redirect": "true", "format": "json"})
    if result is None:
        return []
    
    if 'items' in result:
        return list(map(lambda e: e['title'], result['items']))
    
    else:
        return []
    
def getMediaURL(mediaName):
    # https://en.wikipedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg&prop=imageinfo&iiprop=url
    result = get_json(
        "https://en.wikipedia.org/w/api.php",
        {"action": "query", "titles": mediaName, "prop": "imageinfo", "iiprop": "url|extmetadata", "format": "json"},
    )
    if result is None:
        return []
    
    if 'query' in result:
        if 'pages' in result['query']:
            rtrList = []
            for e in list(result['query']['pages'].values()):
                if "status_iucn" not in e['imageinfo'][0]['url'].lower():
                    rtrList.append({"link": e['imageinfo'][0]['url'], "license": e['imageinfo'][0]["extmetadata"]['UsageTerms']["value"] if "UsageTerms" in e['imageinfo'][0]["extmetadata"] else "", "author": e['imageinfo'][0]["extmetadata"]['Artist']["value"] if "Artist" in e['imageinfo'][0]["extmetadata"] else ""})
            return rtrList
            # return list(map(lambda e: {"link": e['imageinfo'][0]['url'], "licens": e['imageinfo'][0]['UsageTerms']["value"], "author": e['imageinfo'][0]['Artist']["value"]}, list(result['query']['pages'].values())))
    else:
        return []
        

def getMediaUrls(speciesName):
    returnList = []
    for entry in getMediaTitles(speciesName):
        returnList = returnList + getMediaURL(entry)
        
    return returnList

def getCommonImageUrls(speciesName):
    returnList = []
    # print(getImages(speciesName))
    # for entry in getImages(speciesName):
    #     returnList = returnList + getMediaURL(entry)
        
    # return returnList

def crawlWikipedia(speciesName, speciesSynonyms):
    time.sleep(random.uniform(0, 1))
    qID = getQID(speciesName)
    labels = getLabels(speciesName)
    mediaUrls = getMediaUrls(speciesName)

    if not qID:
        print("CHECKING SYNONYMS!")
        for synCounter, synonym in enumerate(speciesSynonyms):
            time.sleep(2 + random.uniform(0, 0.5))
            print("Checking with ", synonym["taxonName"])
            newName = synonym["taxonName"]
            qID = getQID(newName)
            labels = getLabels(newName)
            mediaUrls = getMediaUrls(newName)

            if qID is not None:
                print("Found with synonym instead:", synonym)
                return {"qID": qID, "labels": labels, "mediaUrls": mediaUrls, "wikiFoundBy": synonym}
    
    return {"qID": qID, "labels": labels, "mediaUrls": mediaUrls}

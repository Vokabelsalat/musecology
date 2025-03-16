#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr  3 19:51:42 2023

@author: kusnick
"""

import requests
import time
import random

headers = {"Content-Type": "application/json"}

def getQID(speciesName):
    
    r = requests.get("https://www.wikidata.org/w/api.php", headers=headers, params={"action": "wbgetentities", "sites": "specieswiki", "titles": speciesName, "format": "json"})
    result = r.json()
    
    if 'entities' in result and len(result['entities']) > 0:
        for qID in result['entities']:
            entity = result['entities'][qID]
            if 'labels' in entity:
                labelValues = list(map(lambda e: e['value'], list(entity['labels'].values())))

                if speciesName in labelValues:
                    return qID
                
def getLabels(speciesName):
    r = requests.get("https://www.wikidata.org/w/api.php", headers=headers, params={"action": "wbgetentities", "sites": "specieswiki", "titles": speciesName, "format": "json"})
    result = r.json()
    
    if 'entities' in result and len(result['entities']) > 0:
        for qID in result['entities']:
            entity = result['entities'][qID]
            if 'labels' in entity:
                return {key: entity["labels"][key] for key in ["en", "de", "es", "fr"] if key in entity["labels"]}
    

def getImages(speciesName):
    # https://commons.wikimedia.org/w/api.php?action=query&prop=images&imlimit=10&redirects=1&titles=Cedrus%20deodara
    
    r = requests.get("https://commons.wikimedia.org/w/api.php", headers=headers, params={"action": "query", "format": "json", "imlimit": 10,
                                                                                         "prop": "images", "redirects": 1, "titles": speciesName})
    
    # print(r.url)
    result = r.json()
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
    url = "https://en.wikipedia.org/api/rest_v1/page/media-list/"+speciesName
    r = requests.get(url, headers=headers, params={"redirect": "true", "format": "json"})
    result = r.json()
    
    if 'items' in result:
        return list(map(lambda e: e['title'], result['items']))
    
    else:
        return []
    
def getMediaURL(mediaName):
    # https://en.wikipedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg&prop=imageinfo&iiprop=url
    r = requests.get("https://en.wikipedia.org/w/api.php", headers=headers, params={"action": "query", "titles": mediaName, "prop": "imageinfo", 'iiprop': 'url', "format": "json"})
    result = r.json()
    
    if 'query' in result:
        if 'pages' in result['query']:
            return list(map(lambda e: e['imageinfo'][0]['url'], list(result['query']['pages'].values())))
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
import requests

BASE_URL = "http://api.gbif.org/v1"

def query_species(name):
    response = requests.get(f"{BASE_URL}/species/match", params={"name": name})
    data = response.json()
    if data.get("confidence", 0) > 80:
        return data
    return None

def query_occurrences(taxon_key):
    results = []
    offset = 0
    limit = 300

    while True:
        response = requests.get(f"{BASE_URL}/occurrence/search", params={
            "taxonKey": taxon_key,
            "limit": limit,
            "offset": offset
        })
        data = response.json()
        results.extend(data.get("results", []))

        if data.get("endOfRecords") or len(data.get("results", [])) == 0:
            break

        offset += limit

    return results

def query_species_by_genus(genus):
    response = requests.get(f"{BASE_URL}/species/match", params={"genus": genus})
    data = response.json()
    return data.get("genusKey", "trySpeciesNames")

def get_genus_key_by_species_name(genus):
    response = requests.get(f"{BASE_URL}/species", params={"name": genus})
    data = response.json()

    for entry in sorted(data.get("results", []), key=lambda x: int(x.get("numDescendants", 0)), reverse=True):
        if entry.get("rank") == "GENUS" and entry.get("canonicalName") == genus:
            return entry.get("genusKey")
    return None

def get_children(genus_key, offset=0):
    response = requests.get(f"{BASE_URL}/species/{genus_key}/children", params={"limit": 1000, "offset": offset})
    data = response.json()
    return {
        "data": data.get("results", []),
        "endOfRecords": data.get("endOfRecords")
    }

def get_synonyms(taxon_key):
    response = requests.get(f"{BASE_URL}/species/{taxon_key}/synonyms", params={"limit": 1000})
    try:
        data = response.json()
        return data.get("results", [])
    except Exception:
        return []

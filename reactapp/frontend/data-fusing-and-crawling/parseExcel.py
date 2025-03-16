#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Mar 24 13:07:37 2023

@author: kusnick
"""

def parseOrchestra(excelData):
    parsedOrchestra = {}
    for idx, instrumentPart in excelData.iterrows():
        # if type(instrumentPart['Genus']) == str and type(instrumentPart['Species']) == str:
        if type(instrumentPart['Scientific Name']) == str:
            speciesName = instrumentPart['Scientific Name'].strip()
            if speciesName in parsedOrchestra:
                if instrumentPart['Main part'] not in parsedOrchestra[speciesName]['main_parts'] and type(instrumentPart['Main part']) == str:
                    parsedOrchestra[speciesName]['main_parts'].append(instrumentPart['Main part'])
                
                if instrumentPart['Instruments'] not in parsedOrchestra[speciesName]['instruments'] and type(instrumentPart['Instruments']) == str:
                    parsedOrchestra[speciesName]['instruments'].append(instrumentPart['Instruments'])

                if instrumentPart['Instrument groups'] not in parsedOrchestra[speciesName]['groups'] and type(instrumentPart['Instrument groups']) == str:
                    parsedOrchestra[speciesName]['groups'].append(instrumentPart['Instrument groups'])
               
                if instrumentPart['Instrument families'] not in parsedOrchestra[speciesName]['families'] and type(instrumentPart['Instrument families']) == str:
                    parsedOrchestra[speciesName]['families'].append(instrumentPart['Instrument families'])
               
                if instrumentPart['Musical instrument classification'] not in parsedOrchestra[speciesName]['classifications'] and type(instrumentPart['Musical instrument classification']) == str:
                    parsedOrchestra[speciesName]['classifications'].append(instrumentPart['Musical instrument classification'])

                parsedOrchestra[speciesName]['origMat'].append(instrumentPart.to_dict())
                
            else:
                parsedOrchestra[speciesName] = {
                    'main_parts': [instrumentPart['Main part']],
                    'instruments': [instrumentPart['Instruments']] if type(instrumentPart['Instruments']) == str else [],
                    'groups': [instrumentPart['Instrument groups']] if type(instrumentPart['Instrument groups']) == str else [],
                    'families': [instrumentPart['Instrument families']] if type(instrumentPart['Instrument families']) == str else [],
                    'classifications': [instrumentPart['Musical instrument classification']] if type(instrumentPart['Musical instrument classification']) == str else [],
                    'origMat': [instrumentPart.to_dict()]
                    }
        
    return parsedOrchestra

def parseSpecies(speciesData):
    parsedSpecies = {}
    for idx, species in speciesData.iterrows():
        # if type(instrumentPart['Genus']) == str and type(instrumentPart['Species']) == str:
        if type(species['Scientific Name']) == str:
            speciesName = species['Scientific Name'].strip()
            if speciesName not in parsedSpecies:
                parsedSpecies[speciesName] = {
                    'Family': species['Family'].strip() if type(species['Family']) == str else None,
                    'Kingdom': species['Kingdom'].strip() if type(species['Kingdom']) == str else None,
                    'Genus': species['Genus'].strip(),
                    'Species': species['Species'].strip(),
                    }
        
    return parsedSpecies

def parsePhotos(excelPhotos):
    parsedPhotos = {}
    for idx, photo in excelPhotos.iterrows():
        if type(photo['Genus']) == str and type(photo['Species']) == str:
            speciesName = '%s %s' % (photo['Genus'].strip(), photo['Species'].strip())


            if speciesName in parsedPhotos:
                parsedPhotos[speciesName].append(photo.to_dict())
            else:
                parsedPhotos[speciesName] = [photo.to_dict()]
            
            
    return parsedPhotos

def parseExcel(excelData, speciesData):
    return [parseOrchestra(excelData), parseSpecies(speciesData)]
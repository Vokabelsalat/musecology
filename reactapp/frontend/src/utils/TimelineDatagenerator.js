import { iucnColors, citesAppendixSorted } from './timelineUtils';
import { pushOrCreate, getOrCreate, pushOrCreateWithoutDuplicates, threatenedToDangerMap, colorBrewerScheme8Qualitative } from './utils';
import { timeParse, extent } from "d3";

export class TimelineDatagenerator {
    constructor(input) {
        this.input = input; //TODO rewrite as object input from index.ejs
        this.minYear = 9999;
        this.maxYear = -9999;
        this.domainYears = [];

        this.sourceColorMap = {};

        this.data = {};
    }

    getData() {
        return this.data;
    }

    getSourceColorMap() {
        return this.sourceColorMap;
    }

    getDomainYears() {
        return { minYear: this.minYear, maxYear: this.maxYear };
    }

    getTreeSpeciesNames(i_speciesName, speciesObject) {
        if (speciesObject.hasOwnProperty("trees")) {


            let speciesNames = speciesObject.trees.map(e => e.taxon);

            let speciesNamesAndSyns = {};
            let reverseSyns = {};

            let allAccepted = {};

            for (let speciesName of speciesNames) {
                for (let syns of speciesObject.synonymos) {
                    let index = syns.indexOf(speciesName);
                    if (index > -1) {
                        let newIndex = 1 - index;

                        let syn = syns[newIndex];

                        pushOrCreate(speciesNamesAndSyns, speciesName, syn);
                        reverseSyns[syn] = speciesName;

                        allAccepted[syn] = 1;
                    }
                    else if (!Object.keys(speciesNamesAndSyns).includes(speciesName)) {
                        speciesNamesAndSyns[speciesName] = [];
                    }
                    allAccepted[speciesName] = 1;
                }
            }

            allAccepted[i_speciesName] = 1;
            speciesNamesAndSyns[i_speciesName] = [];

            allAccepted = Object.keys(allAccepted);

            return [speciesNamesAndSyns, reverseSyns, allAccepted];
        }
        else {
            let speciesNamesAndSyns = {};
            speciesNamesAndSyns[i_speciesName] = [];
            return [speciesNamesAndSyns, [], [i_speciesName]];
        }
    }

    processData(tradeData, i_threatData, i_tradeData) {

        //########### CREATING DATA ###########
        let genusMode = false;

        for (let speciesName of Object.keys(tradeData)) {
            speciesName = speciesName.trim();

            if (!speciesName.includes(" ")) {
                genusMode = true;
            }

            let speciesObject = tradeData[speciesName];

            if (i_tradeData !== undefined && i_tradeData.hasOwnProperty(speciesName)) {
                let tradeArray = i_tradeData[speciesName];
                speciesObject.trade = tradeArray;
            }

            if (i_threatData !== undefined && i_threatData.hasOwnProperty(speciesName)) {
                let threatArray = i_threatData[speciesName];
                speciesObject.threats = threatArray;
            }

            let [treeSpeciesNamesAndSyns, reverseSyns, allAccepted] = this.getTreeSpeciesNames(speciesName, speciesObject);
            speciesObject.treeSpeciesNamesAndSyns = treeSpeciesNamesAndSyns;
            speciesObject.reverseSyns = reverseSyns;
            speciesObject.allAccepted = allAccepted;

            let [data, groupedBySource] = this.getTimelineTradeDataFromSpecies(speciesObject);
            let listingData = this.getTimelineListingDataFromSpecies(speciesObject, genusMode);
            let iucnData = this.getTimelineIUCNDataFromSpecies(speciesObject, genusMode);
            let threatData = this.getTimelineThreatsDataFromSpecies(speciesObject, genusMode);

            tradeData[speciesName].timeTrade = [data, groupedBySource];
            tradeData[speciesName].timeListing = listingData;

            tradeData[speciesName].timeIUCN = iucnData;
            tradeData[speciesName].timeThreat = threatData;

            let allCircleData = [];
            allCircleData.push(...listingData);
            allCircleData.push(...iucnData);
            allCircleData.push(...threatData);

            let domainYears = data.map(function (d) {
                return d.year;
            });

            domainYears.push(...allCircleData.map((d) => d.year));

            this.domainYears = domainYears;

            let dataextent = extent(domainYears);

            if (dataextent[0] !== undefined) {
                this.minYear = Math.min(this.minYear, dataextent[0]);
            }

            if (dataextent[1] !== undefined) {
                this.maxYear = Math.max(this.maxYear, dataextent[1]);
            }

            tradeData[speciesName].allCircleData = allCircleData;
            tradeData[speciesName].timeExtent = dataextent;

            this.data = tradeData;
        }
        return this.data;
    }




    /* ############## HELPER FUNCTIONS ############## */

    getTimelineThreatsDataFromSpecies(speciesObject, genusMode) {
        if (speciesObject.hasOwnProperty("threats") && Array.isArray(speciesObject.threats)) {
            let groupedByYear = {};
            let groupdBySpecies = {};
            for (let entry of speciesObject["threats"].values()) {
                let year = entry.assessmentYear;

                if (speciesObject.allAccepted.includes(entry.genusSpecies)) {
                    if (speciesObject.reverseSyns.hasOwnProperty(entry.genusSpecies) && !speciesObject.species.hasOwnProperty(entry.genusSpecies)) {
                        entry.genusSpecies = speciesObject.reverseSyns[entry.genusSpecies];
                    }
                    pushOrCreate(groupdBySpecies, entry.genusSpecies, entry);
                    if (year) {
                        pushOrCreate(groupedByYear, year.toString(), entry);
                    }
                }
            }

            let maxPerYear = Math.max(...Object.values(groupedByYear).map(e => e.length));

            let returnData = [];

            let years = Object.keys(groupedByYear).map((e) => parseInt(e));
            let yearMin = Math.min(...years);
            let yearMax = Math.max(...years);

            for (let year = yearMin; year <= yearMax; year++) {
                if (groupedByYear.hasOwnProperty(year.toString())) {
                    let count = 0;
                    returnData.push(
                        ...groupedByYear[year.toString()].map((e) => {
                            if (e.consAssCategory) {
                                e.consAssCategoryOrig = e.consAssCategory;
                                if (e.consAssCategory.length > 2) {
                                    let split = e.consAssCategory.split(" ");
                                    e.consAssCategory = split.map((e) => e.charAt()).join("");

                                    for (let cat of Object.keys(iucnColors)) {
                                        if (e.consAssCategory.toLowerCase().includes(cat)) {
                                            e.consAssCategory = cat;
                                        }
                                    }
                                }

                                if (
                                    e.consAssCategory === "NT" &&
                                    e.consAssCategoryOrig.toLowerCase().includes("not")
                                ) {
                                    e.consAssCategory = "nT";
                                }
                            }

                            return {
                                year: year,
                                scope: e.bgciScope,
                                count: count++,
                                threatened: e.threatened.trim(),
                                consAssCategory: e.consAssCategory,
                                text: e.threatened.trim() ? threatenedToDangerMap[e.threatened.trim().toLowerCase()] : null,
                                danger: e.threatened.trim() ? threatenedToDangerMap[e.threatened.trim().toLowerCase()] : null,
                                consAssCategoryOrig: e.consAssCategoryOrig,
                                type: "threat",
                                reference: e.reference,
                                countries: e.countries,
                                maxPerYear: maxPerYear,
                                genusSpecies: e.genusSpecies
                            };
                        })
                    );
                }
            }

            if (genusMode) {
                for (let species of Object.keys(speciesObject.treeSpeciesNamesAndSyns)) {

                    if (!species.includes(" ")) {
                        continue; //because it is a genus listing
                    }

                    if (speciesObject.reverseSyns.hasOwnProperty(species) && !speciesObject.species.hasOwnProperty(species)) {
                        species = speciesObject.reverseSyns[species];
                    }

                    if (!groupdBySpecies.hasOwnProperty(species)) {
                        returnData.push({
                            year: 2019,
                            scope: "Global",
                            threatened: "DD",
                            consAssCategory: "DD",
                            text: "DD",
                            danger: "DD",
                            consAssCategoryOrig: "DD",
                            type: "threat",
                            reference: "Kusnick",
                            genusSpecies: species
                        });

                        pushOrCreate(groupdBySpecies, species, {});
                    }
                }
            }

            return returnData.filter((e) => e.scope === "Global"); //!e.reference.includes("IUCN") &&
        } else {
            return [];
        }
    }

    getTimelineListingDataFromSpecies(speciesObject, genusMode) {

        let speciesCountries = {};
        //Collect all countries
        if (speciesObject.hasOwnProperty("trees")) {
            for (let entry of speciesObject["trees"]) {
                for (let geoEntry of entry["TSGeolinks"]) {
                    pushOrCreateWithoutDuplicates(speciesCountries, entry.taxon, geoEntry.country);
                }
            }
        }

        if (speciesObject.hasOwnProperty("listingHistory")) {
            var parseTime = timeParse("%d/%m/%Y");
            let groupedByYear = {};
            let groupdBySpecies = {};

            for (let entry of speciesObject["listingHistory"].values()) {
                let dateString = entry.EffectiveAt;
                let date = parseTime(dateString);
                let year = date.getFullYear();

                entry.sciName = `${entry.Genus} ${entry.Species}`.trim();

                if (speciesObject.allAccepted.includes(entry.sciName)) {
                    if (speciesObject.reverseSyns.hasOwnProperty(entry.sciName) && !speciesObject.species.hasOwnProperty(entry.sciName)) {
                        entry.sciName = speciesObject.reverseSyns[entry.sciName];
                    }

                    pushOrCreate(groupedByYear, year.toString(), entry);
                }
            }

            let returnData = [];

            let years = Object.keys(groupedByYear).map((e) => parseInt(e));
            let yearMin = Math.min(...years);
            let yearMax = Math.max(...years);

            let genusListings = [];

            for (let year = yearMin; year <= yearMax; year++) {
                if (groupedByYear.hasOwnProperty(year.toString())) {
                    let count = 0;
                    returnData.push(
                        ...groupedByYear[year.toString()]
                            .filter(e => e["ChangeType"] === "ADDITION")
                            .map((e) => {
                                let returnElement = {
                                    year: year,
                                    appendix: e["Appendix"],
                                    text: e["Appendix"],
                                    count: count++,
                                    type: "listingHistory",
                                    rank: e["RankName"],
                                    genus: e["Genus"],
                                    species: e["Species"],
                                    sciName: e.sciName
                                };

                                if (e.hasOwnProperty("FullAnnotationEnglish")) {
                                    returnElement["annotation"] = e["FullAnnotationEnglish"];
                                }

                                if (e["RankName"] === "GENUS") {
                                    if (speciesObject.hasOwnProperty("genusAnnotations")) {
                                        for (let anot of speciesObject.genusAnnotations) {
                                            if (anot.listedPopulationsOfGenus.trim() !== "") {
                                                if (returnElement.annotation.includes(anot.listedPopulationsOfGenus)) {
                                                    returnElement.countries = anot.listedPopulationsOfGenus;
                                                    returnElement.annotation = anot.FullAnnotationEnglish;
                                                }
                                            }
                                        }
                                    }

                                    genusListings.push(returnElement);
                                }
                                else {
                                    pushOrCreate(groupdBySpecies, (e.Genus + " " + e.Species).trim(), returnElement);
                                }

                                return returnElement;
                            })
                    );
                }
            }

            let testSpec = {};
            for (let gListing of genusListings) {

                for (let species of Object.keys(speciesObject.treeSpeciesNamesAndSyns)) {

                    if (!species.includes(" ")) {
                        continue; //because it is a genus listing
                    }

                    testSpec[species] = 1;

                    if (groupdBySpecies[species]) {

                        let filtered = groupdBySpecies[species].filter(e => {
                            if (parseInt(e.year) <= parseInt(gListing.year)) {
                                return true;
                            }

                            return false;
                        });

                        let sorted = filtered.sort((a, b) => parseInt(b.year) - parseInt(a.year));

                        if (sorted.length > 0) {
                            if (citesAppendixSorted.indexOf(sorted[0].appendix) < citesAppendixSorted.indexOf(gListing.appendix)) {
                                continue;
                            }
                        }
                    }

                    let isLocale = false;
                    let countries = null;
                    /* let annotation = null; */
                    if (gListing.hasOwnProperty("countries")) {
                        if (speciesCountries.hasOwnProperty(species)
                            && speciesCountries[species].includes(gListing.countries)
                            && speciesCountries[species].length === 1) {
                            isLocale = true;
                            countries = gListing.countries;
                            /* annotation = gListing.; */
                        }
                    }
                    else {
                        isLocale = true;
                    }

                    if (isLocale) {
                        let returnElement = {
                            year: gListing.year,
                            appendix: gListing["appendix"],
                            text: gListing["text"],
                            type: "listingHistory",
                            rank: "SPECIESfromGENUS",
                            genus: gListing["genus"],
                            species: species.replace(gListing["genus"], "").trim()
                        };

                        if (countries)
                            returnElement["countries"] = countries;

                        if (gListing.hasOwnProperty("annotation"))
                            returnElement["annotation"] = gListing["annotation"];

                        returnData.push(returnElement);
                    }
                }
            }

            if (genusMode) {
                for (let species of Object.keys(speciesObject.treeSpeciesNamesAndSyns)) {
                    if (!species.includes(" ")) {
                        continue; //because it is a genus
                    }

                    if (!groupdBySpecies.hasOwnProperty(species)) {
                        if (speciesObject.reverseSyns.hasOwnProperty(species) && !speciesObject.species.hasOwnProperty(species)) {
                            species = speciesObject.reverseSyns[species];
                        }

                        let genus = species.split(" ")[0];

                        returnData.push({
                            year: 2019,
                            appendix: "DD",
                            text: "Data Deficient",
                            type: "listingHistory",
                            sciName: species,
                            rank: "SPECIESfromGENUS",
                            genus, genus,
                            species: species.replace(genus, "").trim()
                        });
                    }
                }
            }

            return returnData;
        } else {
            return [];
        }
    }

    getTimelineIUCNDataFromSpecies(speciesObject, genusMode) {
        if (speciesObject.hasOwnProperty("iucn")) {

            //subkeys
            let groupedByYear = {};
            let groupdBySpecies = {};
            for (let subkey of Object.keys(speciesObject["iucn"])) {
                let tradeArray = speciesObject["iucn"][subkey];
                for (let iucn of tradeArray) {
                    let year = iucn.year;

                    if (speciesObject.allAccepted.includes(subkey)) {
                        iucn.sciName = speciesObject.reverseSyns[subkey] !== undefined ? speciesObject.reverseSyns[subkey] : subkey;
                        iucn.genus = subkey.split(" ")[0];
                        pushOrCreate(groupedByYear, year.toString(), iucn);
                        pushOrCreate(groupdBySpecies, iucn.sciName, iucn);
                    }
                }
            }

            let returnData = [];

            let years = Object.keys(groupedByYear).map((e) => parseInt(e));
            let yearMin = Math.min(...years);
            let yearMax = Math.max(...years);

            let getPositionOfIUCN = (e) => {
                let index = Object.keys(iucnColors).indexOf(e.code);
                if (index < 0) {
                    return 99;
                }

                return index;
            };

            for (let year of Object.keys(groupedByYear)) {
                let data = groupedByYear[year.toString()].map(e => {
                    for (let cat of Object.keys(iucnColors)) {
                        if (e.code.toLowerCase().includes(cat.toLowerCase())) {
                            e.code = cat;
                        }
                    }

                    if (e.code === "NT" && e.category.toLowerCase().includes("not")) {
                        e.code = "nT";
                    }

                    if (speciesObject.reverseSyns.hasOwnProperty(e.sciName) && !speciesObject.species.hasOwnProperty(e.sciName)) {
                        e.sciName = speciesObject.reverseSyns[e.sciName];
                    }

                    return {
                        year: year,
                        code: e.code,
                        text: e.code,
                        category: e.category,
                        type: "iucn",
                        sciName: e.sciName
                    };
                });

                returnData.push(...data);
            }

            if (genusMode) {
                for (let species of Object.keys(speciesObject.treeSpeciesNamesAndSyns)) {
                    if (!species.includes(" ")) {
                        continue; //because it is a genus
                    }

                    if (!groupdBySpecies.hasOwnProperty(species)) {
                        if (speciesObject.reverseSyns.hasOwnProperty(species)) {
                            species = speciesObject.reverseSyns[species];
                        }

                        returnData.push({
                            year: 2019,
                            code: "DD",
                            text: "Data Deficient",
                            category: "DD",
                            type: "iucn",
                            sciName: species
                        });
                    }
                }
            }

            return returnData;
        } else {
            return [];
        }
    }

    getTimelineTradeDataFromSpecies(speciesObject) {

        if (speciesObject.hasOwnProperty("trade")) {
            //subkeys
            //let sciName = speciesObject.material[0].Genus.trim() + " " + speciesObject.material[0].Species.trim();

            let trades = [];

            let groupedByYear = {};
            let groupByExIm = {};
            let groupedBySource = {};
            for (let subkey of Object.keys(speciesObject["trade"])) {
                let tradeArray = speciesObject["trade"][subkey];
                for (let trade of tradeArray.values()) {
                    let year = trade.Year;
                    trades.push(trade);
                    pushOrCreate(groupedBySource, trade.Source, trade);
                    getOrCreate(
                        this.sourceColorMap,
                        trade.Source,
                        colorBrewerScheme8Qualitative[Object.keys(this.sourceColorMap).length]
                    );
                    pushOrCreate(groupedByYear, year.toString(), trade);
                    pushOrCreate(groupByExIm, trade.Exporter + "|" + trade.Importer, trade);
                }
            }

            let returnData = [];

            let years = Object.keys(groupedByYear).map((e) => parseInt(e));
            let yearMin = Math.min(...years);
            let yearMax = Math.max(...years);

            for (let year = yearMin; year <= yearMax; year++) {
                returnData.push({
                    year,
                    count: groupedByYear.hasOwnProperty(year.toString())
                        ? groupedByYear[year.toString()].length
                        : 0,
                    trades: groupedByYear.hasOwnProperty(year.toString()) ? groupedByYear[year.toString()] : [],
                    type: "trade",
                });
            }
            return [returnData, groupedBySource];
        } else {
            return [[], []];
        }
    }
}
import { iucnColors, citesAppendixSorted } from "./timelineUtils";
import {
  pushOrCreate,
  getOrCreate,
  pushOrCreateWithoutDuplicates,
  threatenedToDangerMap,
  colorBrewerScheme8
} from "./utils";
import { timeParse, extent } from "d3";

export class TimelineDatagenerator {
  constructor(oldInput) {
    this.oldInput = oldInput;
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

  getTreeCountries(i_speciesName, speciesObject) {
    let countries = {};
    if (speciesObject.hasOwnProperty("trees")) {
      for (let treeEntry of speciesObject["trees"]) {
        if (treeEntry.hasOwnProperty("TSGeolinks")) {
          for (let geoData of treeEntry["TSGeolinks"]) {
            let country = geoData.country;
            pushOrCreate(countries, country, geoData);
          }
        }
      }
    }

    return countries;
  }

  getTreeSpeciesNames(i_speciesName, speciesObject) {
    if (speciesObject.hasOwnProperty("trees")) {
      let speciesNamesAndSyns = {};
      let reverseSyns = {};

      let allAccepted = {};

      for (let tree of speciesObject.trees) {
        let speciesName = tree.taxon;
        for (let syns of speciesObject.synonymos) {
          let index = syns.indexOf(speciesName);
          if (index > -1) {
            let newIndex = 1 - index;

            let syn = syns[newIndex];

            pushOrCreate(speciesNamesAndSyns, speciesName, syn);
            reverseSyns[syn] = speciesName;

            allAccepted[syn] = 1;
          } else if (!Object.keys(speciesNamesAndSyns).includes(speciesName)) {
            speciesNamesAndSyns[speciesName] = [];
          }
          allAccepted[speciesName] = 1;
        }
      }

      console.log(JSON.stringify(allAccepted));

      if (speciesObject.synonyms) {
        for (let subkey of Object.keys(speciesObject.synonyms)) {
          let synArray = speciesObject.synonyms[subkey];
          let acceptedSynKey = null;
          for (let syn of synArray) {
            if (
              syn.species === i_speciesName ||
              syn.canonicalName === i_speciesName
            ) {
              acceptedSynKey = syn.speciesKey;
            }
          }
          if (acceptedSynKey !== null) {
            for (let syn of synArray) {
              if (
                acceptedSynKey === syn.speciesKey &&
                syn.taxonomicStatus === "HOMOTYPIC_SYNONYM"
              ) {
                allAccepted[syn.canonicalName] = 1;
              }
            }
          }
        }
      }

      allAccepted[i_speciesName] = 1;
      speciesNamesAndSyns[i_speciesName] = [];

      allAccepted = Object.keys(allAccepted);

      return [speciesNamesAndSyns, reverseSyns, allAccepted];
    } else {
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
      let generateNew = true;

      if (this.oldInput.hasOwnProperty(speciesName)) {
        let dataKey =
          "CITES" +
          (tradeData[speciesName].listingHistory !== undefined
            ? tradeData[speciesName].listingHistory.length
            : 0) +
          "IUCN" +
          (tradeData[speciesName].iucn !== undefined
            ? Object.keys(tradeData[speciesName].iucn).length
            : 0) +
          "BGCI" +
          (tradeData[speciesName].threats !== undefined
            ? tradeData[speciesName].threats.length
            : 0);

        let dataKeyOld =
          "CITES" +
          (this.oldInput[speciesName].listingHistory !== undefined
            ? this.oldInput[speciesName].listingHistory.length
            : 0) +
          "IUCN" +
          (this.oldInput[speciesName].iucn !== undefined
            ? Object.keys(this.oldInput[speciesName].iucn).length
            : 0) +
          "BGCI" +
          (this.oldInput[speciesName].threats !== undefined
            ? this.oldInput[speciesName].threats.length
            : 0);

        if (dataKey === dataKeyOld) {
          tradeData[speciesName].timeTrade =
            this.oldInput[speciesName].timeTrade;
          tradeData[speciesName].timeListing =
            this.oldInput[speciesName].timeListing;

          tradeData[speciesName].timeIUCN = this.oldInput[speciesName].timeIUCN;
          tradeData[speciesName].timeThreat =
            this.oldInput[speciesName].timeThreat;
          generateNew = false;
        }
      }

      if (generateNew) {
        if (!speciesName.includes(" ")) {
          genusMode = true;
        }

        let speciesObject = tradeData[speciesName];

        if (
          i_tradeData !== undefined &&
          i_tradeData.hasOwnProperty(speciesName)
        ) {
          let tradeArray = i_tradeData[speciesName];
          speciesObject.trade = tradeArray;
        }

        if (
          i_threatData !== undefined &&
          i_threatData.hasOwnProperty(speciesName)
        ) {
          let threatArray = i_threatData[speciesName];
          speciesObject.threats = threatArray;
        }

        let [speciesNamesAndSyns, reverseSyns, allAccepted] =
          this.getTreeSpeciesNames(speciesName, speciesObject);
        speciesObject.speciesNamesAndSyns =
          speciesObject.speciesNamesAndSyns !== undefined
            ? speciesObject.speciesNamesAndSyns
            : {};
        speciesObject.reverseSyns =
          speciesObject.reverseSyns !== undefined
            ? speciesObject.reverseSyns
            : {};
        speciesObject.allAccepted = allAccepted;
        let countries = this.getTreeCountries(speciesName, speciesObject);
        speciesObject.treeCountries = countries;

        let [data, groupedBySource] =
          this.getTimelineTradeDataFromSpecies(speciesObject);
        let listingData = this.getTimelineListingDataFromSpecies(
          speciesObject,
          genusMode
        );
        let iucnData = this.getTimelineIUCNDataFromSpecies(
          speciesObject,
          genusMode
        );
        let threatData = this.getTimelineThreatsDataFromSpecies(
          speciesObject,
          genusMode
        );

        tradeData[speciesName].timeTrade = [data, groupedBySource];
        tradeData[speciesName].timeListing = listingData;

        tradeData[speciesName].timeIUCN = iucnData;
        tradeData[speciesName].timeThreat = threatData;
      }

      let allCircleData = [];
      allCircleData.push(...tradeData[speciesName].timeListing);
      allCircleData.push(...tradeData[speciesName].timeIUCN);
      allCircleData.push(...tradeData[speciesName].timeThreat);

      let domainYears = [];

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
    if (
      speciesObject.hasOwnProperty("threats") &&
      Array.isArray(speciesObject.threats)
    ) {
      let groupedByYear = {};
      let groupdBySpecies = {};
      for (let entry of speciesObject["threats"]) {
        let year = entry.assessmentYear;

        entry.genusSpecies =
          entry.genusSpecies !== null ? entry.genusSpecies.trim() : null;

        if (speciesObject.allAccepted.includes(entry.genusSpecies)) {
          if (
            speciesObject.reverseSyns.hasOwnProperty(entry.genusSpecies) &&
            !speciesObject.species.hasOwnProperty(entry.genusSpecies)
          ) {
            entry.genusSpecies = speciesObject.reverseSyns[entry.genusSpecies];
          }
          pushOrCreate(groupdBySpecies, entry.genusSpecies, entry);
          if (year) {
            pushOrCreate(groupedByYear, year.toString(), entry);
          }
        }
        /*  else {
                    console.log(entry.genusSpecies, entry, speciesObject.allAccepted);
                } */
      }

      let maxPerYear = Math.max(
        ...Object.values(groupedByYear).map((e) => e.length)
      );

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
                text: e.threatened.trim()
                  ? threatenedToDangerMap[e.threatened.trim().toLowerCase()]
                  : null,
                danger: e.threatened.trim()
                  ? threatenedToDangerMap[e.threatened.trim().toLowerCase()]
                  : null,
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
        for (let species of Object.keys(speciesObject.speciesNamesAndSyns)) {
          if (!species.includes(" ")) {
            continue; //because it is a genus listing
          }

          if (
            speciesObject.reverseSyns.hasOwnProperty(species) &&
            !speciesObject.species.hasOwnProperty(species)
          ) {
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

      returnData = returnData.filter((e) => e.scope === "Global"); //!e.reference.includes("IUCN") &&
      return returnData;
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
          pushOrCreateWithoutDuplicates(
            speciesCountries,
            entry.taxon,
            geoEntry.country
          );
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
          if (
            speciesObject.reverseSyns.hasOwnProperty(entry.sciName) &&
            !speciesObject.species.hasOwnProperty(entry.sciName)
          ) {
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
              .filter((e) => e["ChangeType"] === "ADDITION")
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
                        if (
                          returnElement.annotation.includes(
                            anot.listedPopulationsOfGenus
                          )
                        ) {
                          returnElement.countries =
                            anot.listedPopulationsOfGenus;
                          returnElement.annotation = anot.FullAnnotationEnglish;
                        }
                      }
                    }
                  }

                  genusListings.push(returnElement);
                } else {
                  pushOrCreate(
                    groupdBySpecies,
                    (e.Genus + " " + e.Species).trim(),
                    returnElement
                  );
                }

                return returnElement;
              })
          );
        }
      }

      let testSpec = {};
      for (let gListing of genusListings) {
        for (let species of Object.keys(speciesObject.speciesNamesAndSyns)) {
          if (!species.includes(" ")) {
            continue; //because it is a genus listing
          }

          testSpec[species] = 1;

          if (groupdBySpecies[species]) {
            let filtered = groupdBySpecies[species].filter((e) => {
              if (parseInt(e.year) <= parseInt(gListing.year)) {
                return true;
              }

              return false;
            });

            let sorted = filtered.sort(
              (a, b) => parseInt(b.year) - parseInt(a.year)
            );

            if (sorted.length > 0) {
              if (
                citesAppendixSorted.indexOf(sorted[0].appendix) <
                citesAppendixSorted.indexOf(gListing.appendix)
              ) {
                continue;
              }
            }
          }

          let isLocale = false;
          let countries = null;
          /* let annotation = null; */
          if (gListing.hasOwnProperty("countries")) {
            if (
              speciesCountries.hasOwnProperty(species) &&
              speciesCountries[species].includes(gListing.countries) &&
              speciesCountries[species].length === 1
            ) {
              isLocale = true;
              countries = gListing.countries;
              /* annotation = gListing.; */
            }
          } else {
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

            if (countries) returnElement["countries"] = countries;

            if (gListing.hasOwnProperty("annotation"))
              returnElement["annotation"] = gListing["annotation"];

            returnData.push(returnElement);
          }
        }
      }

      if (genusMode) {
        for (let species of Object.keys(speciesObject.speciesNamesAndSyns)) {
          if (!species.includes(" ")) {
            continue; //because it is a genus
          }

          if (!groupdBySpecies.hasOwnProperty(species)) {
            if (
              speciesObject.reverseSyns.hasOwnProperty(species) &&
              !speciesObject.species.hasOwnProperty(species)
            ) {
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
              genus,
              genus,
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
            iucn.sciName =
              speciesObject.reverseSyns[subkey] !== undefined
                ? speciesObject.reverseSyns[subkey]
                : subkey;
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
        let data = [];
        for (let e of groupedByYear[year.toString()]) {
          if (e.code !== null) {
            for (let cat of Object.keys(iucnColors)) {
              if (e.code.toLowerCase().includes(cat.toLowerCase())) {
                e.code = cat;
              }
            }

            if (e.code === "NT" && e.category.toLowerCase().includes("not")) {
              e.code = "LC";
            }

            if (
              speciesObject.reverseSyns.hasOwnProperty(e.sciName) &&
              !speciesObject.species.hasOwnProperty(e.sciName)
            ) {
              e.sciName = speciesObject.reverseSyns[e.sciName];
            }

            data.push({
              year: year,
              code: e.code,
              text: e.code,
              category: e.category,
              type: "iucn",
              sciName: e.sciName
            });
          }
        }

        returnData.push(...data);
      }

      if (genusMode) {
        for (let species of Object.keys(speciesObject.speciesNamesAndSyns)) {
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
            colorBrewerScheme8[Object.keys(this.sourceColorMap).length]
          );
          pushOrCreate(groupedByYear, year.toString(), trade);
          pushOrCreate(
            groupByExIm,
            trade.Exporter + "|" + trade.Importer,
            trade
          );
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
          trades: groupedByYear.hasOwnProperty(year.toString())
            ? groupedByYear[year.toString()]
            : [],
          type: "trade"
        });
      }
      return [returnData, groupedBySource];
    } else {
      return [[], []];
    }
  }
}

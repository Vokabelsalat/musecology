import { useMemo } from "react";

import {
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../../utils/timelineUtils";
import { returnImageLink, returnDummyLink, returnImageLinks } from "../Home";

export function useParseSpeciesJSON(i_speciesData, slice) {
  return useMemo(() => {
    const speciesData = Object.fromEntries(
      Object.entries(i_speciesData != null ? i_speciesData : {}).slice(
        0,
        slice
          ? 140
          : Object.keys(i_speciesData != null ? i_speciesData : {}).length
      )
    );

    let tmpImageLinks = {};
    let tmpDummyImageLinks = {};
    let tmpSpeciesSignThreats = {};
    let tmpTimelineData = {};
    let tmpYears = new Set();
    let tmpInstrumentGroupData = {};
    let tmpInstrumentData = {};
    let tmpSpeciesCountries = {};
    let tmpSpeciesEcos = {};
    let tmpSpeciesHexas = {};
    let tmpSpeciesLabels = {};
    /* let tmpTreeMapData = {
            Animalia: { name: "Animalia", children:  },
            Plantae: { name: "Plantae", children: {} }
          }; */

    let kingdoms = { Animalia: [], Plantae: [] };
    let families = {};
    let genera = {};
    let speciesTreeMapData = {};
    let noCountries = {};

    for (const spec of Object.keys(speciesData)) {
      const speciesObj = speciesData[spec];

      if (
        speciesObj.Kingdom === null ||
        !Object.keys(kingdoms).includes(speciesObj.Kingdom)
      ) {
        let tempKingdom = null;
        for (let mat of speciesObj.origMat) {
          if (
            mat.Kingdom != null &&
            Object.keys(kingdoms).includes(mat.Kingdom)
          ) {
            tempKingdom = mat.Kingdom;
          }
        }
        speciesObj.Kingdom = tempKingdom;
      }

      if (speciesObj.Family === null) {
        let tempFamily = null;
        for (let mat of speciesObj.origMat) {
          if (mat.Family != null) {
            tempFamily = mat.Family;
          }
        }
        speciesObj.Family = tempFamily;
      }

      let family = speciesObj.Family != null ? speciesObj.Family.trim() : "";
      let genus = speciesObj.Genus.trim();
      let species = speciesObj.Species.trim();
      let genusSpecies = `${genus.trim()} ${species.trim()}`;

      kingdoms[speciesObj.Kingdom].push(family);
      if (families.hasOwnProperty(family)) {
        families[family].push(genus);
      } else {
        families[family] = [genus];
      }

      if (genera.hasOwnProperty(genus)) {
        genera[genus].push(genusSpecies);
      } else {
        genera[genus] = [genusSpecies];
      }

      tmpImageLinks[spec] = returnImageLinks(speciesObj);

      tmpDummyImageLinks[spec] = returnDummyLink(speciesObj);

      speciesTreeMapData[genusSpecies] = {
        image: tmpImageLinks[spec],
        proxy: tmpDummyImageLinks[spec],
        mediaUrls: speciesObj["mediaUrls"]
      };

      if (speciesObj.origMat == null) {
        // console.log("Skip species", spec);
        continue;
      }

      for (const mat of speciesObj.origMat) {
        if (
          tmpInstrumentGroupData[mat["Instrument groups"]] &&
          mat.Instruments != null
        ) {
          tmpInstrumentGroupData[mat["Instrument groups"]].push(
            mat.Instruments
          );
        } else if (mat.Instruments != null) {
          tmpInstrumentGroupData[mat["Instrument groups"]] = [mat.Instruments];
        }

        const mP = mat["Main part"];
        if (tmpInstrumentData[mat.Instruments]) {
          if (tmpInstrumentData[mat.Instruments][mP]) {
            if (!tmpInstrumentData[mat.Instruments][mP].includes(spec)) {
              tmpInstrumentData[mat.Instruments][mP].push(spec);
            }
          } else {
            tmpInstrumentData[mat.Instruments][mP] = [spec];
          }
        } else {
          tmpInstrumentData[mat.Instruments] = {};
          tmpInstrumentData[mat.Instruments][mP] = [spec];
        }
      }

      let tmpElement = {
        iucn: [],
        cites: [],
        bgci: [],
        populationTrend: speciesObj.populationTrend,
        isAnimal: speciesObj.Kingdom === "Animalia" ? true : false,
        kingdom: speciesObj.Kingdom,
        family: speciesObj.Family,
        genus: speciesObj.Genus,
        species: speciesObj.Species,
        author: speciesObj.Author
      };

      if (speciesObj.timeIUCN != null && speciesObj.timeIUCN.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesObj.timeIUCN) {
          tmpYears.add(parseInt(element.year));
          
          let year = element.year.toString();
          let assessment = iucnAssessment.get(element.code);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort < assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["iucn"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });
      } else {
        speciesObj.timeIUCN = [];
      }

      if (speciesObj.timeThreat.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesObj.timeThreat) {
          if (element.assessmentYear === null) {
            continue;
          }
          let year = element.assessmentYear.toString();
          element.year = year;
          element.type = "bgci";
          tmpYears.add(parseInt(element.assessmentYear));
          let assessment = bgciAssessment.get(element.threatened);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort < assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["bgci"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });
      }

      if (speciesObj.timeListing.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesObj.timeListing) {
          let year = element.effective_at.substring(0, 4);
          element["assessment_year"] = element.year;
          element.year = year;
          tmpYears.add(parseInt(element.year));
          let assessment = citesAssessment.get(element.appendix);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort < assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["cites"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });
      }

      tmpTimelineData[spec] = tmpElement;
      tmpSpeciesSignThreats[spec] = {
        cites: [...tmpElement["cites"]].pop(),
        threats: [...tmpElement["bgci"]].pop(),
        iucn: [...tmpElement["iucn"]].pop()
      };

      let tmpCountries = [];
      // if (spec === "Dalbergia scorpioides") {
      //   console.log("HERE", spec, speciesObj);
      // }

      if (
        speciesObj.hasOwnProperty("treeCountries") && //bgci
        speciesObj["treeCountries"].length > 0
      ) {
        tmpCountries = speciesObj["treeCountries"];
      } else {
        if (
          speciesObj.hasOwnProperty("iucnCountries") &&
          speciesObj["iucnCountries"].length > 0
        ) {
          tmpCountries = speciesObj["iucnCountries"];
        } else {
          // console.log("HERE using POWO countries", speciesObj, spec);

          if (speciesObj.hasOwnProperty("powoCountries") && speciesObj["powoCountries"].length > 0) {
            // console.log(spec, speciesObj["powoCountries"]);
            tmpCountries = speciesObj["powoCountries"];
          }
          else {
           if (speciesObj.hasOwnProperty("manualCountries") && speciesObj["manualCountries"].length > 0) {
              tmpCountries = speciesObj["manualCountries"];
            } 
          }
        }
      }

      tmpSpeciesCountries[genusSpecies] = tmpCountries;

      if (tmpCountries.length === 0) {
        // console.log(genusSpecies, tmpCountries);
        noCountries[genusSpecies] = 1;
      }

      tmpSpeciesEcos[genusSpecies] = {
        terrestrial: speciesObj.terEcos != null ? speciesObj.terEcos : [],
        marine: speciesObj.marEcos != null ? speciesObj.marEcos : []
      };

      tmpSpeciesHexas[genusSpecies] = {
        terrestrial: speciesObj.terHexagons ?? [],
        marine: speciesObj.marHexagons ?? []
      };

      console.log('here', genusSpecies, tmpSpeciesHexas[genusSpecies]);
      

      // Labels as Common Names from Wikipedia
      tmpSpeciesLabels[genusSpecies] = speciesObj.fixedCommonNames;
    }

    for (const group of Object.keys(tmpInstrumentGroupData)) {
      tmpInstrumentGroupData[group] = [
        ...new Set(tmpInstrumentGroupData[group])
      ];
    }

    /* for (const instrument of Object.keys(tmpInstrumentData)) {
            tmpInstrumentData[instrument] = [
              ...new Set(tmpInstrumentData[instrument])
            ];
          } */

    let tmpDomainYears = {
      maxYear: Math.max(...tmpYears) + 1,
      minYear: Math.min(...tmpYears) - 1
    };

    let tmpKingdomData = [];
    for (let kingdom of Object.keys(kingdoms)) {
      let familiesInKingdom = [...new Set(kingdoms[kingdom])];
      let kingdomValue = 0;

      let familyData = [];
      for (let family of familiesInKingdom) {
        let genusInFamily = [...new Set(families[family])];

        let genusData = [];
        let familyValue = 0;
        for (let genus of genusInFamily) {
          let speciesInGenus = genera[genus];

          let speciesData = [];
          let speciesCount = {};
          let genusValue = 0;
          for (let genusSpecies of speciesInGenus) {
            if (speciesCount.hasOwnProperty(genusSpecies)) {
              speciesCount[genusSpecies] = speciesCount[genusSpecies] + 1;
            } else {
              speciesCount[genusSpecies] = 1;
            }
          }

          for (let genusSpecies of [...new Set(speciesInGenus)]) {
            speciesData.push({
              name: genusSpecies,
              image: speciesTreeMapData[genusSpecies]["image"],
              proxy: speciesTreeMapData[genusSpecies]["proxy"],
              mediaUrls: speciesTreeMapData[genusSpecies]["mediaUrls"],
              value: speciesCount[genusSpecies],
              filterDepth: 4
            });
            //genusValue = genusValue + speciesCount[genusSpecies];
          }

          genusData.push({
            name: genus,
            children: speciesData,
            filterDepth: 3
            //value: genusValue
          });

          familyValue = familyValue + genusValue;
        }
        familyData.push({
          name: family,
          children: genusData,
          filterDepth: 2
          //value: familyValue
        });
        kingdomValue = kingdomValue + familyValue;
      }
      tmpKingdomData.push({
        name: kingdom,
        children: familyData,
        /* value: kingdomValue, */
        filterDepth: 1
      });
    }

    // console.log("noCountries", Object.keys(noCountries));

    return {
      imageLinks: tmpImageLinks,
      dummyImageLinks: tmpDummyImageLinks,
      speciesSignThreats: tmpSpeciesSignThreats,
      timelineData: tmpTimelineData,
      species: speciesData,
      domainYears: tmpDomainYears,
      instrumentData: tmpInstrumentData,
      instrumentGroupData: tmpInstrumentGroupData,
      speciesCountries: tmpSpeciesCountries,
      speciesEcos: tmpSpeciesEcos,
      speciesHexas: tmpSpeciesHexas,
      speciesLabels: tmpSpeciesLabels,
      kingdomData: tmpKingdomData
    };
  }, [i_speciesData, slice]);
}

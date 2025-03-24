import { useEffect, useState, useMemo, useRef } from "react";
import FullScreenButton from "./FullScreenButton";
import Tooltip from "./Tooltip";
import TimelineViewNew from "./TimelineViewNew";
import ResizeComponent from "./ResizeComponent";
import CenterPanel from "./CenterPanel";
import OrchestraNew from "./OrchestraNew";
import TreeMapView from "./TreeMapViewNew";
import { ThreatLevel } from "../utils/timelineUtils";
//import Map from "./MapNewTest";
import Map from "./MapNew";
import { getOrCreate, pushOrCreateWithoutDuplicates } from "../utils/utils";
import {
  bgciAssessment,
  citesAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import Overlay from "./Overlay";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

import { HoverProvider } from "./HoverProvider";
import { TooltipProvider } from "./TooltipProvider";
import { OverlayProvider } from "./OverlayProvider";
import { filter, tree } from "d3";
import { useTreeMapFilter } from "./Hooks/useTreeMapFilter";
import { useMapFilter } from "./Hooks/useMapFilter";
import { useTimelineFilter } from "./Hooks/useTimelineFilter";
import { useFilterSpecies } from "./Hooks/useFilterSpecies";
import { useParseSpeciesJSON } from "./Hooks/useParseSpeciesJSON";
import { useOrchestraFilter } from "./Hooks/useOrchestraFilter";
import Footer from "./Footer";

export const returnDummyLink = (speciesObj) => {
  if (speciesObj["photos"] != null) {
    let sortedPhotos = speciesObj["photos"].sort((pA, pB) => {
      return pA.Priority - pB.Priority;
    });

    if (sortedPhotos.length > 0) {
      if (sortedPhotos[0].Proxy != null) {
        return {
          link: "fotos/" + sortedPhotos[0].Proxy.replace(" ", ""),
          source: sortedPhotos[0].Source
        };
      }
    }
  }
  return null;
};

export const returnImageLinks = (speciesObj) => {
  if (speciesObj["photos"] != null) {
    let sortedPhotos = speciesObj["photos"].sort((pA, pB) => {
      return pA.Priority - pB.Priority;
    });

    const returnLinks = [];
    for (const photo of sortedPhotos) {
      if (photo.Foto != null) {
        returnLinks.push({
          link: "fotos/" + photo.Foto.replace(" ", ""),
          source: photo.Source
        });
      }
    }
    if (returnLinks.length > 0) {
      return returnLinks;
    }
  }
  return null;
};

export const getSpeciesFromTreeMap = (treeMapData) => {
  return treeMapData.flatMap((el) => {
    if (el.children) {
      return getSpeciesFromTreeMap(el.children);
    } else {
      return el.name;
    }
  });
};

export const filterTreeMap = (node, keys, filterLevel) => {
  // console.log("NODE", node);
  let test = node.filter((e) => {
    // console.log("FILTER", e);
  });
  // console.log(test);
  return node.filter((el) => {
    if (el.filterDepth === filterLevel) {
      return keys.includes(el.name);
    } else {
      el.children = filterTreeMap(el.children, keys, filterLevel);
      return el.children.length > 0;
    }
  });
};

export default function HomeNew(props) {
  const showMap = true;
  const showTimeline = true;
  const showOrchestra = true;
  const showTreeMap = true;

  const [zoomOrigin, setZoomOrigin] = useState("0% 0%");
  const [zoomTransform, setZoomTransform] = useState("");

  const [instrument, setInstrument] = useState();
  const [instrumentGroup, setInstrumentGroup] = useState();
  const [instrumentPart, setInstrumentPart] = useState();

  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const [orchestrasToISO3, setOrchestrasToISO3] = useState(null);
  const [ecoRegionSearchOptions, setEcoRegionSearchOptions] = useState(null);
  const [ecoMarineRegionSearchOptions, setMarineEcoRegionSearchOptions] =
    useState(null);

  const [timeFrame, setTimeFrame] = useState([]);
  const [speciesData, setSpeciesData] = useState({});

  const [colorBlind, setColorBlind] = useState(false);

  const [threatType, setThreatType] = useState("economically");

  const [formMapMode, setFormMapMode] = useState("countries");

  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedEcoregion, setSelectedEcoregion] = useState();

  const [treeMapFilter, setTreeMapFilter] = useState({});

  const [categoryFilter, setCategoryFilter] = useState(null);
  const mapRef = useRef(null);

  const slice = false;

  const getSpeciesSignThreat = (species, type = null) => {
    if (type === null) {
      type = threatType;
    }

    const speciesObj = timelineData[species];

    if (speciesObj == null) {
      return citesAssessment.dataDeficient;
    }

    if (type === "economically") {
      let lastElement = [...speciesObj["cites"]]
        .filter((e) =>
          timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
        )
        .pop();
      if (lastElement) {
        return ThreatLevel.revive(lastElement.assessment);
        /* return JSON.parse(lastElement.assessment, function (key, value) {
          return key === "" && value.hasOwnProperty("__type")
            ? ThreatLevel.revive(value)
            : this[key];
        }); */
      } else {
        return citesAssessment.dataDeficient;
      }
    } else {
      let lastElementIUCN = [...speciesObj["iucn"]]
        .filter((e) =>
          timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
        )
        .pop();
      if (lastElementIUCN) {
        /* return JSON.parse(lastElementIUCN.assessment, function (key, value) {
          return key === "" && value.hasOwnProperty("__type")
            ? ThreatLevel.revive(value)
            : this[key];
        }); */
        return ThreatLevel.revive(lastElementIUCN.assessment);
      } else {
        let lastElementBGCI = [...speciesObj["bgci"]]
          .filter((e) =>
            timeFrame[1] !== undefined ? e.element.year < timeFrame[1] : true
          )
          .pop();
        if (lastElementBGCI) {
          /* return JSON.parse(lastElementBGCI.assessment, function (key, value) {
            return key === "" && value.hasOwnProperty("__type")
              ? ThreatLevel.revive(value)
              : this[key];
          }); */
          return ThreatLevel.revive(lastElementBGCI.assessment);
        } else {
          return bgciAssessment.dataDeficient;
        }
      }
    }
  };

  useEffect(() => {
    fetch("/data_merged.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        setSpeciesData(speciesData);
      })
      .catch((error) => {
        console.log(`Couldn't find file allSpecies.json`, error);
      });

    fetch("/countryDictionary.json")
      .then((res) => res.json())
      .then(function (json) {
        let tmpOrchestraToISO3 = {};
        for (let country of Object.values(json)) {
          tmpOrchestraToISO3[country["orchestraCountry"]] = country["ISO3"];
        }
        setCountriesDictionary(json);
        setOrchestrasToISO3(tmpOrchestraToISO3);
      });
  }, []);

  const {
    imageLinks,
    dummyImageLinks,
    speciesSignThreats,
    timelineData,
    species,
    domainYears,
    instrumentData,
    instrumentGroupData,
    speciesCountries,
    speciesEcos,
    speciesHexas,
    speciesLabels,
    kingdomData
  } = useParseSpeciesJSON(speciesData, slice);

  //FilterSection
  /*  const filteredSpeciesFromOrchestra = useMemo(() => {
    let filtSpecies = Object.keys(species);
    if (instrumentGroup) {
      let filtInstruments = instrumentGroupData[instrumentGroup];
      if (instrument) {
        filtInstruments = [instrument];
      }

      if (instrumentPart) {
        filtSpecies = instrumentData[instrument][instrumentPart];
      } else {
        filtSpecies = filtInstruments
          .filter((key) => key in instrumentData)
          .reduce(
            (obj2, key) => (
              obj2.push(
                ...Object.values(instrumentData[key]).flatMap((entry) => {
                  return entry;
                })
              ),
              obj2
            ),
            []
          );
      }

      filtSpecies = [...new Set(filtSpecies)];
    }

    return filtSpecies;
  }, [
    instrument,
    instrumentData,
    instrumentGroup,
    instrumentGroupData,
    instrumentPart,
    species
  ]); */

  /* console.log("instrumentData", instrumentData);
  console.log("filteredSpeciesFromOrchestra", filteredSpeciesFromOrchestra); */

  const filteredSpeciesFromOrchestra = useOrchestraFilter(
    species,
    instrument,
    instrumentData,
    instrumentGroup,
    instrumentGroupData,
    instrumentPart
  );

  const filteredSpeciesFromTreeMap = useTreeMapFilter(
    treeMapFilter,
    filterTreeMap,
    getSpeciesFromTreeMap,
    kingdomData,
    species
  );

  /* console.log("filteredSpeciesFromTreeMap", filteredSpeciesFromTreeMap); */

  const filteredSpeciesFromMap = useMapFilter(
    species,
    speciesCountries,
    selectedCountry
  );

  const filteredSpeciesFromTimeline = useTimelineFilter(
    categoryFilter,
    species,
    getSpeciesSignThreat
  );

  const intersectedSpecies = filteredSpeciesFromMap.filter(
    (value) =>
      filteredSpeciesFromTreeMap.includes(value) &&
      filteredSpeciesFromOrchestra.includes(value) &&
      filteredSpeciesFromTimeline.includes(value)
  );

  /* console.log("filteredSpeciesFromOrchestra", filteredSpeciesFromOrchestra);
  console.log("filteredSpeciesFromTreeMap", filteredSpeciesFromTreeMap);
  console.log("filteredSpeciesFromMap", filteredSpeciesFromMap);
  console.log("intersectedSpecies", intersectedSpecies); */

  const {
    filteredKingdomData,
    visibleSpeciesTimelineData,
    filteredInstrumentData,
    visibleSpeciesCountries,
    visibleSpeciesEcos,
    visibleSpeciesHexas
  } = useFilterSpecies(
    JSON.stringify(kingdomData),
    filterTreeMap,
    JSON.stringify(instrumentData),
    JSON.stringify(speciesCountries),
    JSON.stringify(timelineData),
    JSON.stringify(intersectedSpecies),
    JSON.stringify(speciesEcos),
    JSON.stringify(speciesHexas)
  );

  const getPopulationTrend = (speciesName) => {
    if (visibleSpeciesTimelineData.hasOwnProperty(speciesName)) {
      return visibleSpeciesTimelineData[speciesName].populationTrend;
    } else {
      return null;
    }
  };

  return (
    <>
      <HoverProvider>
        <TooltipProvider speciesLabels={speciesLabels}>
          <OverlayProvider>
            {/* {<Tooltip speciesLabels={speciesLabels} />} */}
            {<Overlay />}

            <div
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                gridTemplateColumns: "50% 50%",
                gridTemplateRows: "calc(50% - 55px) 90px calc(50% - 55px) 20px",
                transformOrigin: zoomOrigin,
                transform: zoomTransform,
                transitionProperty: "transform",
                transitionDuration: "0.4s"
              }}
            >
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 1,
                  gridRowStart: 1,
                  gridRowEnd: 1,
                  position: "relative"
                }}
              >
                {/*   <iframe
                  style={{ width: "500px", height: "500px" }}
                  src="https://commons.wikimedia.org/wiki/Diospyros_mespiliformis#/media/File:Diospyros_mespiliformis_Kruger-NP.jpg"
                ></iframe> */}
                {showOrchestra && (
                  <ResizeComponent>
                    <OrchestraNew
                      instrumentData={filteredInstrumentData}
                      instrumentGroupData={instrumentGroupData}
                      getThreatLevel={getSpeciesSignThreat}
                      threatType={threatType}
                      colorBlind={colorBlind}
                      setInstrument={setInstrument}
                      setInstrumentGroup={setInstrumentGroup}
                      instrument={instrument}
                      instrumentGroup={instrumentGroup}
                      instrumentPart={instrumentPart}
                      setInstrumentPart={setInstrumentPart}
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(zoomTransform !== "" ? "0% 0%" : "0% 0%");
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 2,
                  gridColumnEnd: 2,
                  gridRowStart: 1,
                  gridRowEnd: 1,
                  position: "relative"
                }}
              >
                {showTreeMap && (
                  <ResizeComponent>
                    <TreeMapView
                      data={{
                        name: "Kingdom",
                        children: filteredKingdomData,
                        filterDepth: 0
                      }}
                      /* kingdom={selectedKingdom}
              family={selectedFamily}
              genus={selectedGenus}
              species={selectedSpecies} */
                      treeMapFilter={treeMapFilter}
                      setTreeMapFilter={setTreeMapFilter}
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(zoomTransform !== "" ? "0% 0%" : "100% 0%");
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: "span 2",
                  gridRowStart: 2,
                  gridRowEnd: 2
                }}
              >
                {
                  <CenterPanel
                    data={visibleSpeciesTimelineData}
                    getSpeciesThreatLevel={getSpeciesSignThreat}
                    threatType={threatType}
                    setThreatType={setThreatType}
                    colorBlind={colorBlind}
                    setColorBlind={setColorBlind}
                    setCategoryFilter={setCategoryFilter}
                    categoryFilter={categoryFilter}
                    speciesData={species}
                    treeMapFilter={treeMapFilter}
                    setTreeMapFilter={setTreeMapFilter}
                    formMapMode={formMapMode}
                    countriesDictionary={countriesDictionary}
                    ecoRegionSearchOptions={ecoRegionSearchOptions}
                    setSelectedCountry={setSelectedCountry}
                    selectedCountry={selectedCountry}
                    setSelectedEcoregion={setSelectedEcoregion}
                  />
                }
              </div>
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 1,
                  gridRowStart: 3,
                  gridRowEnd: 3,
                  position: "relative",
                  height: "100%"
                }}
              >
                {Object.keys(visibleSpeciesTimelineData).length > 0 && (
                  <>
                    {showTimeline && (
                      <ResizeComponent>
                        <TimelineViewNew
                          data={visibleSpeciesTimelineData}
                          getTreeThreatLevel={getSpeciesSignThreat}
                          imageLinks={imageLinks}
                          dummyImageLinks={dummyImageLinks}
                          setTimeFrame={setTimeFrame}
                          timeFrame={timeFrame}
                          colorBlind={colorBlind}
                          domainYears={domainYears}
                          setTreeMapFilter={setTreeMapFilter}
                        />
                      </ResizeComponent>
                    )}
                  </>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(
                      zoomTransform !== "" ? "0% 0%" : "0% calc(100% - 60px)"
                    );
                  }}
                />
              </div>
              <div
                style={{
                  gridColumnStart: 2,
                  gridColumnEnd: 2,
                  gridRowStart: 3,
                  gridRowEnd: 3,
                  position: "relative"
                }}
              >
                {showMap && (
                  <ResizeComponent>
                    <Map
                      speciesCountries={visibleSpeciesCountries}
                      speciesEcos={visibleSpeciesEcos}
                      speciesHexas={visibleSpeciesHexas}
                      colorBlind={colorBlind}
                      getSpeciesThreatLevel={getSpeciesSignThreat}
                      threatType={threatType}
                      setSelectedCountry={setSelectedCountry}
                      selectedCountry={selectedCountry}
                      ref={mapRef}
                      getPopulationTrend={getPopulationTrend}
                      formMapMode={formMapMode}
                      setFormMapMode={setFormMapMode}
                      timeFrame={timeFrame}
                      countriesDictionary={countriesDictionary}
                      orchestrasToISO3={orchestrasToISO3}
                      setEcoRegionSearchOptions={setEcoRegionSearchOptions}
                      setMarineEcoRegionSearchOptions={
                        setMarineEcoRegionSearchOptions
                      }
                    />
                  </ResizeComponent>
                )}
                <FullScreenButton
                  scaleString={zoomTransform}
                  onClick={() => {
                    setZoomTransform(zoomTransform !== "" ? "" : "scale(2)");
                    setZoomOrigin(
                      zoomTransform !== "" ? "0% 0%" : "100% calc(100% - 60px)"
                    );
                  }}
                />
              </div>
              <Footer />
            </div>
          </OverlayProvider>
        </TooltipProvider>
      </HoverProvider>
    </>
  );
}

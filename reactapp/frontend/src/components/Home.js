import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThreatLevel } from "../utils/timelineUtils";
import CenterPanel from "./CenterPanel";
import FullScreenButton from "./FullScreenButton";
import OrchestraNew from "./Orchestra";
import ResizeComponent from "./ResizeComponent";
import TimelineViewNew from "./TimelineView";
import TreeMapView from "./TreeMapViewNew";
//import Map from "./MapNewTest";
import {
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import Map from "./Map";
import Overlay from "./Overlay";

import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";

import { useFilterSpecies } from "./Hooks/useFilterSpecies";
import { useMapFilter } from "./Hooks/useMapFilter";
import { useOrchestraFilter } from "./Hooks/useOrchestraFilter";
import { useParseSpeciesJSON } from "./Hooks/useParseSpeciesJSON";
import { useTimelineFilter } from "./Hooks/useTimelineFilter";
import { useTreeMapFilter } from "./Hooks/useTreeMapFilter";
import { HoverProvider } from "./HoverProvider";
import Navbar from "./Navbar";
import { OverlayProvider } from "./OverlayProvider";
import { TooltipProvider } from "./TooltipProvider";

export const returnDummyLink = (speciesObj) => {
  if (speciesObj["photos"] != null) {
    let sortedPhotos = [...speciesObj["photos"]].sort((pA, pB) => {
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
    let sortedPhotos = [...speciesObj["photos"]].sort((pA, pB) => {
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

const findLatestAssessment = (assessments, endYear) => {
  for (let index = assessments.length - 1; index >= 0; index -= 1) {
    if (endYear === undefined || assessments[index].element.year < endYear) {
      return assessments[index];
    }
  }
  return undefined;
};

export const filterTreeMap = (node, keys, filterLevel) => {
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
  const [instrumentVideos, setInstrumentVideos] = useState();

  const [treeMapFilter, setTreeMapFilter] = useState({});

  const [categoryFilter, setCategoryFilter] = useState(null);
  const mapRef = useRef(null);

  const slice = false;
  const parsedSpecies = useParseSpeciesJSON(speciesData, slice);
  const { timelineData } = parsedSpecies;

  const getSpeciesSignThreat = useCallback((species, type = null) => {
    if (type === null) {
      type = threatType;
    }

    const speciesObj = timelineData[species];

    if (speciesObj == null) {
      return citesAssessment.dataDeficient;
    }

    if (type === "economically") {
      let lastElement = findLatestAssessment(speciesObj["cites"], timeFrame[1]);
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
      let lastElementIUCN = findLatestAssessment(
        speciesObj["iucn"],
        timeFrame[1]
      );
      if (lastElementIUCN) {
        /* return JSON.parse(lastElementIUCN.assessment, function (key, value) {
          return key === "" && value.hasOwnProperty("__type")
            ? ThreatLevel.revive(value)
            : this[key];
        }); */
        return ThreatLevel.revive(lastElementIUCN.assessment);
      } else {
        let lastElementBGCI = findLatestAssessment(
          speciesObj["bgci"],
          timeFrame[1]
        );
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
  }, [threatType, timeFrame, timelineData]);

  useEffect(() => {
    // fetch("/data_merged.json")
    fetch("/data_merged_diss_filtered.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        setSpeciesData(speciesData);
      })
      .catch((error) => {
        console.log(`Couldn't find file allSpecies.json`, error);
      });

    fetch("/instrument_videos.json")
      .then((res) => res.json())
      .then(function (instrumentVideos) {
        setInstrumentVideos(instrumentVideos);
      })
      .catch((error) => {
        console.log(`Couldn't find instrument_videos.json`, error);
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
    species,
    domainYears,
    instrumentData,
    instrumentGroupData,
    speciesCountries,
    speciesEcos,
    speciesHexas,
    speciesLabels,
    kingdomData
  } = parsedSpecies;

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

  const intersectedSpecies = useMemo(() => {
    const treeMapSpecies = new Set(filteredSpeciesFromTreeMap);
    const orchestraSpecies = new Set(filteredSpeciesFromOrchestra);
    const timelineSpecies = new Set(filteredSpeciesFromTimeline);
    return filteredSpeciesFromMap.filter(
      (value) =>
        treeMapSpecies.has(value) &&
        orchestraSpecies.has(value) &&
        timelineSpecies.has(value)
    );
  }, [
    filteredSpeciesFromMap,
    filteredSpeciesFromOrchestra,
    filteredSpeciesFromTimeline,
    filteredSpeciesFromTreeMap
  ]);

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
    kingdomData,
    filterTreeMap,
    instrumentData,
    speciesCountries,
    timelineData,
    intersectedSpecies,
    speciesEcos,
    speciesHexas
  );

  const getPopulationTrend = useCallback((speciesName) => {
    if (visibleSpeciesTimelineData.hasOwnProperty(speciesName)) {
      return visibleSpeciesTimelineData[speciesName].populationTrend;
    } else {
      return null;
    }
  }, [visibleSpeciesTimelineData]);

  return (
    <>
      <HoverProvider>
        <TooltipProvider speciesLabels={speciesLabels}>
            {/* {<Tooltip speciesLabels={speciesLabels} />} */}
            <div
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                gridTemplateColumns: "50% 50%",
                gridTemplateRows: "40px calc(50% - 65px) 90px calc(50% - 65px)",
                transformOrigin: zoomOrigin,
                transform: zoomTransform,
                transitionProperty: "transform",
                transitionDuration: "0.4s"
              }}
            >
              <Navbar />
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 1,
                  gridRowStart: 2,
                  gridRowEnd: 2,
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
                      instrumentVideos={instrumentVideos}
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
                  gridRowStart: 2,
                  gridRowEnd: 2,
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
                  gridRowStart: 3,
                  gridRowEnd: 3
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
                  gridRowStart: 4,
                  gridRowEnd: 4,
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
                  gridRowStart: 4,
                  gridRowEnd: 4,
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
            </div>
        </TooltipProvider>
      </HoverProvider>
    </>
  );
}

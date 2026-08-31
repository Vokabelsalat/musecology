import ContentPanel from "./ContentPanel";
import ContentWrapper from "./ContentWrapper";
import { Content } from "./Content";
import ResizeComponent from "../ResizeComponent";
import Map from "../Map";
import bowContents from "./bowstory";
import concertContents from "./concertstory";
import { useTreeMapFilter } from "../Hooks/useTreeMapFilter";
import { useParseSpeciesJSON } from "../Hooks/useParseSpeciesJSON";
import { useFilterSpecies } from "../Hooks/useFilterSpecies";
import { useMapFilter } from "../Hooks/useMapFilter";
import { useOrchestraFilter } from "../Hooks/useOrchestraFilter";
import { useTimelineFilter } from "../Hooks/useTimelineFilter";
import { HoverProvider } from "../HoverProvider";
import { TooltipProvider } from "../TooltipProvider";
import { OverlayProvider } from "../OverlayProvider";

import {
  bgciAssessment,
  citesAssessment
} from "../../utils/timelineUtils";

import { filterTreeMap, getSpeciesFromTreeMap } from "../Home";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

import { useIntersection } from "./useIntersection";
import Overlay from "../Overlay/Overlay";
import { ThreatLevel } from "../../utils/timelineUtils";

const storyScripts = { bowstory: bowContents, concertstory: concertContents };

const findLatestAssessment = (assessments, endYear) => {
  for (let index = assessments.length - 1; index >= 0; index -= 1) {
    if (endYear === undefined || assessments[index].element.year < endYear) {
      return assessments[index];
    }
  }
  return undefined;
};

export default function Story(props) {
  const { width, height, storyName, contents: i_contents = null } = props;

  const contents = i_contents ? i_contents : storyScripts[storyName];

  const ref = useRef(null);

  const { hash } = window.location;
  const requestedFigure = Number.parseInt(hash.replace("#", ""), 10);
  const initialFigure =
    Number.isInteger(requestedFigure) &&
    requestedFigure >= 0 &&
    requestedFigure < (contents?.length ?? 0)
      ? requestedFigure
      : 0;

  const [activeFigure, setActiveFigure] = useState(initialFigure);
  const activeFigureRef = useRef();
  activeFigureRef.current = activeFigure;

  const [activeMapLayer, setActiveMapLayer] = useState();
  const [speciesData, setSpeciesData] = useState({});
  const [showThreatDonuts, setShowThreatDonuts] = useState(true);
  const [extraPolygon, setExtraPolygon] = useState(null);
  const [showThreatStatusInCluster, setShowThreatStatusInCluster] =
    useState(true);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [isIntro, setIsIntro] = useState(true);
  const [enableAutoPlay, setEnableAutoPlay] = useState(false);
  const offset = 0;

  const [projection, setProjection] = useState("equalEarth");

  const fontStyle = "classic"; // "modern" | "classic"
  const alignment = "centerBlockText"; // "center" | "left" | "right" | "centerBlockText"
  const [effect, setEffect] = useState("");
  const [showCountries, setShowCountries] = useState(true);
  const [mapFilter, setMapFilter] = useState({ country: null });
  const [formMapMode, setFormMapMode] = useState("countries");

  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const [orchestrasToISO3, setOrchestrasToISO3] = useState(null);
  const [instrumentVideos, setInstrumentVideos] = useState({});

  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  const [timeFrame, setTimeFrame] = useState([]);
  const [threatType, setThreatType] = useState("economically");

  const [overlayContent, setOverlayContent] = useState(null);
  const parsedSpecies = useParseSpeciesJSON(speciesData, false);
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

  function flyToMapPosition(flyTo) {
    if (mapRef.current) {
      mapRef.current.flyTo({
        /* center: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 100],
        essential: true // this animation is considered essential with respect to prefers-reduced-motion */
        ...flyTo,
        essential: true
      });
    }
  }

  const mobile = useMemo(() => {
    if (width < 600) {
      return true;
    } else {
      return false;
    }
  }, [width]);

  const storyHeight =
    Number.isFinite(height) && height > 0 ? height : window.innerHeight;

  useEffect(() => {
    const scrollToHashElement = () => {
      const { hash } = window.location;
      const idx = hash?.replace("#", "");
      const elementToScroll = document.getElementById(idx);

      if (!elementToScroll) return;

      ref.current.scrollTo({
        top: elementToScroll.offsetTop - offset,
        behavior: "instant"
      });
      setActiveFigure(parseInt(idx));
    };

    scrollToHashElement();

    window.addEventListener("hashchange", scrollToHashElement);
    return () => window.removeEventListener("hashchange", scrollToHashElement);
  }, [offset]);

  useIntersection(
    ref,
    "div.contentWrapper",
    (entry, idx) => {
      /* if (entry.intersectionRatio > 0.1) {
        setActiveFigure(idx);
      } */
      if (entry.isIntersecting === true) {
        /* const tmpTest = [...activeFigure];
        tmpTest[idx] = entry.intersectionRatio; */
        if (storyName !== "test") {
          if (typeof window.history.pushState == "function") {
            setTimeout(() => {
              window.history.pushState(
                null,
                `${storyName}#${idx}`,
                `${storyName}#${idx}`
              );
            }, 500);
          } else {
            setTimeout(() => {
              window.location.hash = idx;
            }, 500);
          }
        }
        setActiveFigure(idx);
      }

      /*       tmpTest[idx] = entry.intersectionRatio;
      setActiveFigure(tmpTest); */
    },
    //{ threshold: 1, rootMargin: "32px 0px -65% 0px" }
    {
      // threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      threshold: 0,
      rootMargin: "-30% 0px -35% 0px"
      // rootMargin: "0px 0px 0px 0px"
    }
  );

  function applyContentEffect(effect) {
    switch (effect.type) {
      case "black":
        setEffect(effect.type);
        break;
      default:
    }
  }

  useEffect(() => {
    if (activeFigure != null) {
      if (activeFigure > 0) {
        setIsIntro(false);
      } else {
        setIsIntro(true);
      }
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null
    ) {
      setActiveMapLayer(contents[activeFigure].mapLayer ?? null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].extraPolygon != null
    ) {
      setExtraPolygon(contents[activeFigure].extraPolygon);
    } else {
      setExtraPolygon(null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].showCountries != null
    ) {
      setShowCountries(contents[activeFigure].showCountries);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].categoryFilter != null
    ) {
      setCategoryFilter(contents[activeFigure].categoryFilter);
    } else {
      setCategoryFilter(null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].showThreatDonuts != null
    ) {
      setShowThreatDonuts(contents[activeFigure].showThreatDonuts);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].showThreatStatusInCluster != null
    ) {
      setShowThreatStatusInCluster(
        contents[activeFigure].showThreatStatusInCluster
      );
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].effect != null
    ) {
      applyContentEffect(contents[activeFigure].effect);
    } else {
      setEffect("");
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].speciesFilter != null
    ) {
      setSpeciesFilter(contents[activeFigure].speciesFilter);
    } else {
      setSpeciesFilter([]);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].treeMapFilter != null
    ) {
      setTreeMapFilter(contents[activeFigure].treeMapFilter);
    } else {
      setTreeMapFilter({
        species: null,
        genus: null,
        kingdom: null,
        family: null
      });
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].mapFilter != null
    ) {
      setMapFilter(contents[activeFigure].mapFilter);
    } else {
      setMapFilter({
        country: null
      });
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].threatType != null
    ) {
      setThreatType(contents[activeFigure].threatType);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].projection != null
    ) {
      setProjection(contents[activeFigure].projection);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].instrument !== undefined
    ) {
      setInstrument(contents[activeFigure].instrument);
    } else {
      setInstrument(null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].instrumentGroup !== undefined
    ) {
      setInstrumentGroup(contents[activeFigure].instrumentGroup);
    } else {
      setInstrumentGroup(null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] != null &&
      contents[activeFigure].instrumentPart !== undefined
    ) {
      setInstrumentPart(contents[activeFigure].instrumentPart);
    } else {
      setInstrumentPart(null);
    }

    if (
      activeFigure != null &&
      contents != null &&
      contents[activeFigure] &&
      contents[activeFigure].flyTo != null
    ) {
      flyToMapPosition(contents[activeFigure].flyTo);
    }
  }, [activeFigure, contents]);

  const [instrument, setInstrument] = useState();
  const [instrumentGroup, setInstrumentGroup] = useState();
  const [instrumentPart, setInstrumentPart] = useState();
  const [colorBlind, setColorBlind] = useState(false);

  useEffect(() => {
    fetch("/data_merged_diss_filtered.json")
      .then((res) => res.json())
      .then(function (speciesData) {
        setSpeciesData(speciesData);
      })
      .catch((error) => {
        console.log(`Couldn't find data_merged_diss_filtered.json`, error);
      });

    fetch("/instrument_videos.json")
      .then((res) => res.json())
      .then(function (videos) {
        setInstrumentVideos(videos);
      })
      .catch((error) => {
        console.log(`Couldn't find instrument_videos.json`, error);
      });

    fetch("/countryDictionary.json")
      .then((res) => res.json())
      .then(function (dictionary) {
        const orchestraCountries = {};
        for (const country of Object.values(dictionary)) {
          orchestraCountries[country.orchestraCountry] = country.ISO3;
        }
        setCountriesDictionary(dictionary);
        setOrchestrasToISO3(orchestraCountries);
      })
      .catch((error) => {
        console.log(`Couldn't find countryDictionary.json`, error);
      });
  }, []);

  const {
    imageLinks,
    dummyImageLinks,
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

  const [speciesFilter, setSpeciesFilter] = useState([]);
  const [treeMapFilter, setTreeMapFilter] = useState({
    species: null,
    genus: null,
    kingdom: null,
    family: null
  });

  /* const filteredSpeciesCountries = useMemo(() => {
    return Object.fromEntries(
      Object.entries(speciesCountries).filter(([key]) => {
        let hit = true;

        if (speciesFilter.length > 0) {
          hit = speciesFilter.includes(key);
        }

        if (hit && countriesFilter.length > 0) {
          hit =
            arrayIntersection(speciesCountries[key], countriesFilter).length >
            0;
        }

        if (hit && instrumentGroup != null) {
          let filteredInstruments = instrumentGroupData[instrumentGroup];

          if (hit && instrument != null) {
            filteredInstruments = [instrument];
          }

          const testSpecies = [];

          filteredInstruments.forEach((inst) => {
            if (instrumentData[inst].includes(key)) {
              testSpecies.push(inst);
            }
          });

          hit = testSpecies.length > 0;
        }
        return hit;
      })
    );
  }, [
    speciesCountries,
    speciesFilter,
    countriesFilter,
    instrument,
    instrumentGroup,
    instrumentData,
    instrumentGroupData
  ]); */

  const filteredSpeciesFromTreeMap = useTreeMapFilter(
    treeMapFilter,
    filterTreeMap,
    getSpeciesFromTreeMap,
    kingdomData,
    species
  );

  const filteredSpeciesFromMap = useMapFilter(
    species,
    speciesCountries,
    mapFilter.country
  );

  const filteredSpeciesFromOrchestra = useOrchestraFilter(
    species,
    instrument,
    instrumentData,
    instrumentGroup,
    instrumentGroupData,
    instrumentPart
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
    const explicitlyFilteredSpecies = new Set(speciesFilter);
    return filteredSpeciesFromMap.filter(
      (value) =>
        treeMapSpecies.has(value) &&
        orchestraSpecies.has(value) &&
        timelineSpecies.has(value) &&
        (explicitlyFilteredSpecies.size === 0 ||
          explicitlyFilteredSpecies.has(value))
    );
  }, [
    filteredSpeciesFromMap,
    filteredSpeciesFromOrchestra,
    filteredSpeciesFromTimeline,
    filteredSpeciesFromTreeMap,
    speciesFilter
  ]);

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

  const getPopulationTrend = useCallback(
    (speciesName) =>
      visibleSpeciesTimelineData[speciesName]?.populationTrend ?? null,
    [visibleSpeciesTimelineData]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        let idx = Math.min(
          contents.length,
          Math.max(0, activeFigureRef.current - 1)
        );
        window.location.replace(`${storyName}#${idx}`);
      } else if (e.key === "ArrowRight") {
        let idx = Math.min(
          contents.length,
          Math.max(0, activeFigureRef.current + 1)
        );
        window.location.replace(`${storyName}#${idx}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contents.length, storyName]);

  /*  const processedContents = useMemo(() => {
    const processed = [];

      processedContents.push({ content: cont });
    }
  }, []); */

  return (
    <>
      <HoverProvider>
        <TooltipProvider speciesLabels={speciesLabels}>
          <OverlayProvider>
            <div
              style={{
                width: "100%",
                height: `${storyHeight}px`,
                minHeight: 0,
                display: "grid",
                gridTemplateRows: mobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "minmax(0, 1fr)",
                gridTemplateColumns: mobile
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",
                overflow: "hidden"
              }}
              ref={wrapperRef}
            >
              <div
                className="storyMapWrapper"
                style={{
                  width: "100%",
                  height: "100%",
                  minWidth: 0,
                  minHeight: 0,
                  position: "relative"
                }}
              >
                <ResizeComponent>
                  <Map
                    keepAspectRatio={false}
                    speciesCountries={visibleSpeciesCountries}
                    speciesEcos={visibleSpeciesEcos}
                    speciesHexas={visibleSpeciesHexas}
                    colorBlind={colorBlind}
                    getSpeciesThreatLevel={getSpeciesSignThreat}
                    threatType={threatType}
                    ref={mapRef}
                    activeMapLayer={activeMapLayer}
                    showCountries={showCountries}
                    showThreatDonuts={showThreatDonuts}
                    showThreatStatusInCluster={showThreatStatusInCluster}
                    projection={projection}
                    extraPolygon={extraPolygon}
                    timeFrame={timeFrame}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    getPopulationTrend={getPopulationTrend}
                    formMapMode={formMapMode}
                    setFormMapMode={setFormMapMode}
                    countriesDictionary={countriesDictionary}
                    orchestrasToISO3={orchestrasToISO3}
                    isStory={true}
                  />
                  {/* <StoryMap
              speciesCountries={visibleSpeciesCountries}
              speciesEcos={filteredSpeciesEcos}
              speciesHexas={visibleSpeciesHexas}
              // colorBlind={colorBlind}
              getSpeciesThreatLevel={getSpeciesSignThreat}
              // threatType={threatType}
              // setSelectedCountry={setSelectedCountry}
            /> */}
                </ResizeComponent>
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    display: isIntro ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      boxShadow: "5px 10px 8px #888888",
                      padding: "15px",
                      borderRadius: "5px"
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gap: "5px",
                        gridTemplateColumns: "auto auto"
                      }}
                    >
                      <div
                        style={{
                          gridColumn: "span 2"
                          /* fontSize: "x-large",
                  fontWeight: "bold",
                  marginBottom: "15px" */
                        }}
                      >
                        <h3>Welcome to the Story!</h3>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        For the full immersive experience please enable:
                      </div>
                      <label
                        style={{ gridColumn: "span 2" }}
                        className="checkMarkContainer"
                      >
                        <div style={{ gridColumn: "1" }}>
                          &#x266A; Automatic Replay of Audios & Videos
                        </div>
                        <input
                          style={{ gridColumn: "2" }}
                          type="checkbox"
                          checked={enableAutoPlay ? "checked" : ""}
                          onChange={(event) => {
                            setEnableAutoPlay(event.target.checked);
                          }}
                        />
                        <span
                          style={{ gridColumn: "2" }}
                          className="checkmark"
                        ></span>
                      </label>
                      <label
                        style={{ gridColumn: "span 2" }}
                        className="checkMarkContainer"
                      >
                        <div style={{ gridColumn: "1" }}>
                          Color Blind Friendly
                        </div>
                        <input
                          style={{ gridColumn: "2" }}
                          type="checkbox"
                          checked={colorBlind ? "checked" : ""}
                          onChange={(event) => {
                            setColorBlind(event.target.checked);
                          }}
                        />
                        <span
                          style={{ gridColumn: "2" }}
                          className="checkmark"
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minWidth: 0,
                  minHeight: 0,
                  position: "relative"
                }}
              >
                <ContentPanel className={`contentPanel ${effect}`} ref={ref}>
                  {contents != null &&
                    contents.map((content, index) => {
                      return (
                        <ContentWrapper
                          id={index}
                          key={`contentWrapper${index}`}
                          style={
                            {
                              opacity: activeFigure === index ? 1.0 : 0.3,
                              height: "auto",
                              minHeight: mobile ? "auto" : "100vh"
                              /* "scroll-snap-align": "start" */
                            }
                            /* height: ["storyTitle", "fullSizeQuote", "end"].includes(
                        content.type
                      )
                        ? mobile
                          ? "45vh"
                          : "100vh"
                        : null
                    } */
                          }
                        >
                          {/* <div
                style={{
                  height: "600px",
                  width: "100%",
                  border: "1px solid black",
                  marginBottom: "10px"
                }}
              >
                {index}
              </div> */}
                          <Content
                            id={`content${index}`}
                            key={`content${index}`}
                            {...content}
                            alignment={alignment}
                            fontStyle={fontStyle}
                            playAudio={enableAutoPlay && activeFigure === index}
                            mobile={mobile}
                            setOverlayContent={setOverlayContent}
                            colorBlind={colorBlind}
                            legend={
                              content.legend != null
                                ? {
                                    ...content.legend,
                                    setCategoryFilter: setCategoryFilter,
                                    categoryFilter: categoryFilter,
                                    threatType: threatType,
                                    colorBlind: colorBlind
                                  }
                                : null
                            }
                            visualization={
                              content.visualization != null
                                ? {
                                    ...content.visualization,
                                    instrumentData: filteredInstrumentData,
                                    instrumentGroupData: instrumentGroupData,
                                    instrument: instrument,
                                    instrumentGroup: instrumentGroup,
                                    instrumentPart: instrumentPart,
                                    setInstrumentPart: setInstrumentPart,
                                    instrumentVideos: instrumentVideos,
                                    getThreatLevel: getSpeciesSignThreat,
                                    imageLinks: imageLinks,
                                    dummyImageLinks: dummyImageLinks,
                                    threatType: threatType,
                                    setInstrument: setInstrument,
                                    setInstrumentGroup: setInstrumentGroup,
                                    speciesTimelineData:
                                      visibleSpeciesTimelineData,
                                    setTimeFrame: setTimeFrame,
                                    timeFrame: timeFrame,
                                    domainYears: domainYears,
                                    showThreatDonuts:
                                      content.visualization.showThreatDonuts !==
                                      undefined
                                        ? content.visualization.showThreatDonuts
                                        : showThreatDonuts,
                                    kingdomData: filteredKingdomData,
                                    treeMapFilter: treeMapFilter,
                                    setTreeMapFilter: setTreeMapFilter,
                                    caption: content.visualization.caption
                                  }
                                : null
                            }
                          />
                        </ContentWrapper>
                      );
                    })}
                  <ContentWrapper>
                    <Content
                      type={"restart"}
                      height={"25vh"}
                      alignment={alignment}
                    />
                  </ContentWrapper>
                </ContentPanel>
              </div>
            </div>
            <Overlay
              open={overlayContent !== null}
              onClose={() => {
                setOverlayContent(null);
              }}
            >
              {overlayContent}
            </Overlay>
          </OverlayProvider>
        </TooltipProvider>
      </HoverProvider>
    </>
  );
}

import {
  faDroplet,
  faMountainSun,
  faFence
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as turf from "@turf/turf";
import colorsys from "colorsys";
import * as d3Scale from "d3-scale";
import { nanoid } from "nanoid";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import DiversityScale from "./DiversityScale";

import ReactMapGL, {
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source
} from "react-map-gl";

import { useContext } from "react";
import { TooltipContext } from "./TooltipProvider";

import { bgciAssessment } from "../utils/timelineUtils";
import mapboxAccessToken from "../config/mapbox";

const blueIconColor = "rgba(45, 45, 255, 0.8)";

const Map = forwardRef((props, ref) => {
  const {
    width: newWidth,
    height: newHeight,
    speciesCountries = {},
    speciesEcos = {},
    speciesHexas = {},
    colorBlind = false,
    getSpeciesThreatLevel = () => {
      return "DD";
    },
    threatType = "economically",
    setSelectedCountry = () => {},
    activeMapLayer,
    projection = "equalEarth",
    showThreatDonuts = true,
    showCountries = true,
    extraPolygon = null,
    keepAspectRatio: i_keepAspectRatio = false,
    getPopulationTrend,
    categoryFilter,
    setCategoryFilter,
    timeFrame,
    isStory = false,
    formMapMode,
    setFormMapMode,
    countriesDictionary,
    orchestrasToISO3,
    setEcoRegionSearchOptions,
    setMarineEcoRegionSearchOptions
  } = props;

  const [divScale, setDivScale] = useState({ scale: [], type: "countries" });
  const [showLegend, setShowLegend] = useState(false);
  const legendRef = useRef(null);
  const [isTerrestial, setTerrestial] = useState(true);
  const { setTooltip } = useContext(TooltipContext);

  const setDivScaleWithType = useCallback((scaleAndType) => {
    /* console.log("set", scaleAndType); */
    /*  const tmpDivScale = { ...divScale };
      tmpDivScale[scaleAndType.type] = scaleAndType.scale; */
    setDivScale({ type: scaleAndType.type, scale: scaleAndType.scale });
  }, []);

  const { mapMode, interactiveLayerIds, mapStyle, polygonFill } =
    useMemo(() => {
      let mapStyle = "mapbox://styles/mapbox/light-v11?optimize=true";
      let mapMode = "countries";
      let polygonFill = true;
      let interactiveLayerIds = ["countriesSpecies"];
      if (activeMapLayer != null) {
        switch (activeMapLayer.type) {
          case "countries":
            mapMode = "countries";
            interactiveLayerIds = ["countriesSpecies", "extraPolygonLineLayer"];
            break;
          case "ecoregions":
            mapMode = "ecoregions";
            interactiveLayerIds = ["ecoRegions"];
            break;
          case "hexagons":
            mapMode = "hexagons";
            interactiveLayerIds = ["hexagons"];
            break;
          case "orchestras":
            mapMode = "orchestras";
            interactiveLayerIds = [];
            break;
          default:
        }

        switch (activeMapLayer.mapStyle) {
          case "dark":
            mapStyle = "mapbox://styles/mapbox/dark-v11?optimize=true";
            break;
          case "light":
            mapStyle = "mapbox://styles/mapbox/light-v11?optimize=true";
            break;
          case "satellite":
            mapStyle = "mapbox://styles/mapbox/satellite-v9?optimize=true";
            break;
          case "outdoors":
            mapStyle = "mapbox://styles/mapbox/outdoors-v12";
            break;
          case "streets":
            mapStyle = "mapbox://styles/mapbox/streets-v12";
            break;
          default:
            mapStyle = "mapbox://styles/mapbox/light-v11?optimize=true";
            break;
        }

        switch (activeMapLayer.polygonFill) {
          case false:
            polygonFill = false;
            break;
          case true:
            polygonFill = true;
            break;
          default:
            break;
        }
      } else {
        mapMode = formMapMode;
      }

      return {
        mapMode: mapMode,
        interactiveLayerIds: interactiveLayerIds,
        mapStyle: mapStyle,
        polygonFill: polygonFill
      };
    }, [activeMapLayer, formMapMode]);

  const [countriesGeoJson, setCountriesGeoJson] = useState(null);
  const [countriesGeoJsonTest, setCountriesGeoJsonTest] = useState(null);
  const [ecoRegionsGeoJson, setEcoRegionsGeoJson] = useState(null);
  const [marineEcoRegionsGeoJson, setMarineEcoRegionsGeoJson] = useState(null);
  const [ecoRegionsGeoJsonTest, setEcoRegionsGeoJsonTest] = useState(null);
  const [orchestraGeoJson, setOrchestraGeoJson] = useState(null);
  const [capitalsGeoJSON, setCapitalsGeoJSON] = useState(null);
  const [hexagonGeoJSON, setHexagonGeoJSON] = useState(null);
  const [hexagonGeoJSONTest, setHexagonGeoJSONTest] = useState(null);
  const [capitalsToISO, setCapitalsToISO] = useState(null);
  const [orchestraHeatMap, setOrchestraHeatMap] = useState(null);
  const [orchestraHeatMapMax, setOrchestraHeatMapMax] = useState(null);
  const [capitalThreatMarkers, setCapitalThreatMarkers] = useState(null);
  const [ecoThreatMarkersCache, setEcoThreatMarkersCache] = useState({});
  const [capitalMarkerCache, setCapitalMarkerCache] = useState({});
  const [ecoThreatMarkers, setEcoThreatMarkers] = useState(null);
  const [centroidsOfEcoregions, setCentroidsOfEcoregions] = useState(null);
  const [centroidsOfMarineEcoregions, setCentroidsOfMarineEcoregions] =
    useState(null);
  const [ecoregionHeatMap, setEcoregionHeatMap] = useState(null);
  const [ecoregionHeatMapMax, setEcoregionHeatMapMax] = useState(null);
  const [marineEcoregionHeatMapMax, setMarineEcoregionHeatMapMax] =
    useState(null);
  const [marineEcoregionHeatMap, setMarineEcoregionHeatMap] = useState(null);
  const [countriesHeatMap, setCountriesHeatMap] = useState(null);
  const [countriesHeatMapMax, setCountriesHeatMapMax] = useState(null);
  const [hexagonHeatMap, setHexagonHeatMap] = useState(null);
  const [hexagonHeatMapMax, setHexagonHeatMapMax] = useState(null);
  const [isoToCountryID, setIsoToCountryID] = useState(null);
  const [ecosToMyIDs, setEcosToMyIDs] = useState(null);
  const [extraPolygonGeoJSON, setExtraPolygonGeoJSON] = useState(null);
  const [keepAspectRatio] = useState(i_keepAspectRatio);

  const [highlightLinesGeoJSON, setHighlightLinesGeoJSON] = useState(null);
  const [ecoRegionsHighlightLinesIndex, setEcoRegionsHighlightLinesIndex] =
    useState(null);
  const [countriesHighlightLinesIndex, setCountriesHighlightLinesIndex] =
    useState(null);

  useEffect(() => {
    let max = 0;

    switch (mapMode) {
      case "countries":
        max = countriesHeatMapMax;
        break;
      case "ecoregions":
        max = ecoregionHeatMapMax;
        break;
      case "hexagons":
        max = hexagonHeatMapMax;
        break;
      case "orchestras":
        max = orchestraHeatMapMax;
        break;
      default:
        max = 0;
        break;
    }

    let scale = [];
    const test = d3Scale
      .scaleLinear()
      .domain([0, max])
      .ticks(Math.min(15, max));

    scale.push({
      scaleColor: colorsys.stringify({
        ...colorsys.hsvToRgb(240, 0, 100),
        a: 0.8
      }),
      scaleValue: 0
    });

    for (let val of test.slice(1, test.length)) {
      let scaleOpacity = val / max;
      let scaleColor = colorsys.stringify({
        ...colorsys.hsvToRgb(240, scaleOpacity * 100, 100),
        a: 0.8
      });

      scale.push({ scaleColor, scaleValue: val });
    }

    setDivScaleWithType({ scale, type: mapMode });
  }, [
    mapMode,
    orchestraHeatMapMax,
    hexagonHeatMapMax,
    ecoregionHeatMapMax,
    countriesHeatMapMax
  ]);

  useEffect(() => {
    fetch("/UN_Worldmap-2.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setCountriesGeoJson(geojson);
      });

    fetch("/UN_Worldmap-2_lines.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpCountriesLinesIndex = {};
        for (const country of geojson.features) {
          country.properties.myID = country.id.toString() + "COUNTRY";
          tmpCountriesLinesIndex[country.properties.myID] = country;
        }
        setCountriesHighlightLinesIndex(tmpCountriesLinesIndex);
      });

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then(function (geojson) {
        const tmpCentroids = [];
        const newFeatures = [];
        const newEcoRegionSearchOptions = [];
        for (const ecoRegion of geojson.features) {
          if (ecoRegion.geometry != null) {
            let centroid = turf.centroid(ecoRegion);
            centroid.properties = ecoRegion.properties;
            tmpCentroids.push(centroid);
          }
          ecoRegion.properties.myID = ecoRegion.id.toString() + "EcoRegion";
          newFeatures.push(ecoRegion);
          newEcoRegionSearchOptions.push({
            title: ecoRegion.properties.ECO_NAME,
            type: "ecoregion",
            value: ecoRegion.properties.ECO_ID
          });
        }
        setEcoRegionsGeoJson({
          features: newFeatures,
          type: "FeatureCollection"
        });
        setCentroidsOfEcoregions({
          type: "FeatureCollection",
          features: tmpCentroids
        });
        setEcoRegionSearchOptions(newEcoRegionSearchOptions);
      });

    fetch("/Marine_ecoregions.json")
      .then((res) => res.json())
      .then(function (geojson) {
        const tmpCentroids = [];
        const newFeatures = [];
        const newEcoRegionSearchOptions = [];
        for (const ecoRegion of geojson.features) {
          if (ecoRegion.geometry != null) {
            let centroid = turf.centroid(ecoRegion);
            centroid.properties = ecoRegion.properties;
            tmpCentroids.push(centroid);
          }
          ecoRegion.properties.myID = ecoRegion.id.toString() + "EcoRegion";
          newFeatures.push(ecoRegion);
          newEcoRegionSearchOptions.push({
            title: ecoRegion.properties.ECO_NAME,
            type: "ecoregion",
            value: ecoRegion.properties.ECO_ID
          });
        }
        setMarineEcoRegionsGeoJson({
          features: newFeatures,
          type: "FeatureCollection"
        });
        setCentroidsOfMarineEcoregions({
          type: "FeatureCollection",
          features: tmpCentroids
        });
        setMarineEcoRegionSearchOptions(newEcoRegionSearchOptions);
      });

    fetch("/WWF_Terrestrial_Ecoregions2017-3-5_lines.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpEcoRegionLinesIndex = {};
        for (const ecoRegion of geojson.features) {
          ecoRegion.properties.myID = ecoRegion.id.toString() + "EcoRegion";
          tmpEcoRegionLinesIndex[ecoRegion.properties.myID] = ecoRegion;
        }
        setEcoRegionsHighlightLinesIndex(tmpEcoRegionLinesIndex);
      });

    fetch("/POPP_capitals_FeaturesToJSON.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpCapToISO = {};
        for (let cap of geojson.features) {
          tmpCapToISO[cap["id"].toString()] = cap["properties"]["ISO3CD"];
        }
        setCapitalsToISO(tmpCapToISO);
        setCapitalsGeoJSON(geojson);
      });

    fetch("/Orchestras_worldwide.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setOrchestraGeoJson(geojson);
      });

    fetch("/hexagon_2_Project.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setHexagonGeoJSON(geojson);
      });
  }, []);

  useEffect(() => {
    if (orchestraGeoJson && orchestrasToISO3 && countriesGeoJson) {
      let tmpOrchestraHeatMap = {};
      let tmpOrchestraHeatMapMax = 0;

      for (let orchestra of orchestraGeoJson.features) {
        let iso = orchestrasToISO3[orchestra.properties.Country];
        if (tmpOrchestraHeatMap.hasOwnProperty(iso)) {
          tmpOrchestraHeatMap[iso] = tmpOrchestraHeatMap[iso] + 1;
        } else {
          tmpOrchestraHeatMap[iso] = 1;
        }

        if (tmpOrchestraHeatMap[iso] > tmpOrchestraHeatMapMax) {
          tmpOrchestraHeatMapMax = tmpOrchestraHeatMap[iso];
        }
      }

      for (let country of countriesGeoJson.features) {
        country.properties.orchestraCount =
          tmpOrchestraHeatMap[country.properties["ISO3CD"]] != null
            ? tmpOrchestraHeatMap[country.properties["ISO3CD"]]
            : 0;
      }

      /*  let scale = [];
      const test = d3Scale
        .scaleLinear()
        .domain([0, tmpOrchestraHeatMapMax])
        .ticks(Math.min(15, tmpOrchestraHeatMapMax));

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: 0 });

      for (let val of test.slice(1, test.length)) {
        let scaleOpacity = 1 - val / tmpOrchestraHeatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      setDivScaleWithType({ scale, type: "orchestras" }); */

      setOrchestraHeatMap(tmpOrchestraHeatMap);
      setOrchestraHeatMapMax(tmpOrchestraHeatMapMax);
      setCountriesGeoJson(countriesGeoJson);
    }
  }, [orchestraGeoJson, orchestrasToISO3, countriesGeoJson]);

  const [countriesToSpecies, setCountriesToSpecies] = useState(null);

  const [extraPolygonPaint, setExtraPolygonPaint] = useState(null);

  useEffect(() => {
    let tmpExtraPolygonPaint = null;

    if (extraPolygon) {
      fetch("/" + extraPolygon.name + ".json")
        .then((res) => res.json())
        .then(function (geojson) {
          let tmpExtraPolygon = [];

          for (let feat of geojson.features) {
            tmpExtraPolygon.push(structuredClone(feat));
          }

          if (extraPolygon.fill) {
            tmpExtraPolygonPaint = {
              "fill-color": extraPolygon.fill
            };
          } else {
            tmpExtraPolygonPaint = {
              "line-color": "rgba(246,249,146,1)",
              "line-width": 2
            };
          }

          setExtraPolygonGeoJSON({
            features: [...tmpExtraPolygon],
            type: "FeatureCollection"
          });

          setExtraPolygonPaint(tmpExtraPolygonPaint);
        });
    }

    /* return { extraPolygonPaint: tmpExtraPolygonPaint }; */
  }, [extraPolygon]);

  useEffect(() => {
    const tmpIsoToSpecies = {};
    let tmpCountriesHeatMap = {};
    let tmpCountriesHeatMapMax = 0;

    console.log(
      "speciesCountries",
      Object.values(speciesCountries).filter((e) => e.length > 0).length
    );

    for (let species of Object.keys(speciesCountries)) {
      const countries = speciesCountries[species];
      /* console.log(species, countries); */
      for (let speciesCountry of countries) {
        /* if (tmpIsoToSpecies.hasOwnProperty(speciesCountry)) {
          tmpIsoToSpecies[speciesCountry].push(species);
        } else {
          tmpIsoToSpecies[speciesCountry] = [species];
        } */
        if (countriesDictionary) {
          for (let country of Object.values(countriesDictionary)) {
            if (Object.values(country).includes(speciesCountry)) {
              if (tmpIsoToSpecies.hasOwnProperty(country.ISO3)) {
                tmpIsoToSpecies[country.ISO3].push(species);
              } else {
                tmpIsoToSpecies[country.ISO3] = [species];
              }
            }
          }
        }
      }
    }

    const tmpIsoToCountryID = {};
    const tmpCountriesGeoJson = { ...countriesGeoJson, features: [] };
    if (countriesGeoJson) {
      for (let country of countriesGeoJson.features) {
        const tmpCountry = {
          ...country,
          properties: { ...country.properties }
        };
        tmpCountry.properties.myID = tmpCountry.id.toString() + "COUNTRY";

        tmpCountry.properties.speciesCount =
          tmpIsoToSpecies[tmpCountry.properties["ISO3CD"]] != null
            ? tmpIsoToSpecies[tmpCountry.properties["ISO3CD"]].length
            : 0;

        tmpIsoToCountryID[tmpCountry.properties["ISO3CD"]] =
          tmpCountry.properties.myID;

        if (tmpCountry.properties.speciesCount > tmpCountriesHeatMapMax) {
          tmpCountriesHeatMapMax = tmpCountry.properties.speciesCount;
        }

        tmpCountriesGeoJson.features.push(tmpCountry);
      }
    }

    /*   let scale = [];
    let test = d3Scale
      .scaleLinear()
      .domain([0, tmpCountriesHeatMapMax])
      .ticks(Math.min(15, tmpCountriesHeatMapMax));

    let scaleColor = colorsys.hsvToHex(210, 100, 100);
    scale.push({ scaleColor, scaleValue: 0 });

    for (let val of test.slice(1, test.length)) {
      let scaleOpacity = 1 - val / tmpCountriesHeatMapMax;
      let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

      scale.push({ scaleColor, scaleValue: val });
    }

    setDivScaleWithType({ scale, type: "countries" }); */

    setCountriesToSpecies(tmpIsoToSpecies);
    setIsoToCountryID(tmpIsoToCountryID);
    setCountriesHeatMap(tmpCountriesHeatMap);
    setCountriesHeatMapMax(tmpCountriesHeatMapMax);
    setCountriesGeoJsonTest({ ...tmpCountriesGeoJson });
  }, [speciesCountries, countriesDictionary, countriesGeoJson]);

  /* useEffect(() => {
    console.log(
      "speciesCountries has changed",
      JSON.stringify(speciesCountries)
    );
  }, [speciesCountries]);
  useEffect(() => {
    console.log("countriesDictionary has changed", countriesDictionary);
  }, [countriesDictionary]);
  useEffect(() => {
    console.log("countriesGeoJson has changed", countriesGeoJson);
  }, [countriesGeoJson]);
  useEffect(() => {
    console.log("setDivScale has changed", setDivScale);
  }, [setDivScale]); */

  const [ecosToSpecies, setEcosToSpecies] = useState(null);

  useEffect(() => {
    console.log(
      "speciesEcos",

      Object.values(speciesEcos).filter((e) => {
        if (Array.isArray(e)) {
          return false;
        } else {
          return isTerrestial
            ? e["terrestrial"].length > 0
            : e["marine"].length > 0;
        }
      })
    );

    const tmpEcoToSpecies = {};
    for (let species of Object.keys(speciesEcos)) {
      const ecos = speciesEcos[species];
      if (ecos == null || ecos.length === 0) {
        continue;
      }

      for (let speciesEco of isTerrestial ? ecos["terrestrial"] : ecos["marine"]) {
        if (tmpEcoToSpecies.hasOwnProperty(speciesEco)) {
          tmpEcoToSpecies[speciesEco].push(species);
        } else {
          tmpEcoToSpecies[speciesEco] = [species];
        }
      }
    }

    let tmpEcoregionHeatMap = {};
    let tmpEcosToMyIDs = {};
    let tmpEcoregionHeatMapMax = 0;
    let tmpEcoRegionsGeoJson = { type: "FeatureCollection", features: [] };
    if (
      (ecoRegionsGeoJson && isTerrestial) ||
      (!isTerrestial && marineEcoRegionsGeoJson)
    ) {
      // const idKey = isTerrestial ? "ECO_ID" : "ECO_CODE";
      // for (let ecoregion of [
      //   ...marineEcoRegionsGeoJson.features,
      //   ...ecoRegionsGeoJson.features
      // ]) {
      for (let ecoregion of isTerrestial ? ecoRegionsGeoJson.features :marineEcoRegionsGeoJson.features) {
        let tmpEco = { ...ecoregion, properties: { ...ecoregion.properties } };

        for (const idKey of ["ECO_ID", "ECO_CODE"]) {
          if (tmpEco.properties.hasOwnProperty(idKey)) {
            tmpEco.properties.speciesCount =
              tmpEcoToSpecies[tmpEco.properties[idKey].toString()] != null
                ? tmpEcoToSpecies[tmpEco.properties[idKey].toString()].length
                : 0;

            tmpEcoregionHeatMap[tmpEco.properties[idKey].toString()] =
              tmpEco.properties.speciesCount;

            tmpEcosToMyIDs[tmpEco.properties[idKey].toString()] =
              tmpEco.properties.myID;
          }
        }

        if (tmpEco.properties.speciesCount > tmpEcoregionHeatMapMax) {
          tmpEcoregionHeatMapMax = tmpEco.properties.speciesCount;
        }

        tmpEcoRegionsGeoJson.features.push(tmpEco);
      }
    }

    /*   let scale = [];
    let test = d3Scale
      .scaleLinear()
      .domain([0, tmpEcoregionHeatMapMax])
      .ticks(Math.min(15, tmpEcoregionHeatMapMax));

    let scaleColor = colorsys.hsvToHex(210, 100, 100);
    scale.push({ scaleColor, scaleValue: 0 });

    for (let val of test.slice(1, test.length)) {
      let scaleOpacity = 1 - val / tmpEcoregionHeatMapMax;
      let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

      scale.push({ scaleColor, scaleValue: val });
    }

    setDivScaleWithType({ scale, type: "ecoregions" }); */

    setEcosToSpecies(tmpEcoToSpecies);
    setEcoRegionsGeoJsonTest(tmpEcoRegionsGeoJson);
    setEcoregionHeatMapMax(tmpEcoregionHeatMapMax);
    setEcoregionHeatMap(tmpEcoregionHeatMap);
    setEcosToMyIDs(tmpEcosToMyIDs);
  }, [speciesEcos, ecoRegionsGeoJson, isTerrestial]);

  useEffect(() => {
    const tmpHexasToSpecies = {};
    for (let species of Object.keys(speciesHexas)) {
      const hexas = speciesHexas[species];
      if (hexas == null || hexas.length === 0) {
        continue;
      }

      for (let speciesHex of isTerrestial ? hexas.terrestrial : hexas.marine) {
        if (tmpHexasToSpecies.hasOwnProperty(speciesHex)) {
          tmpHexasToSpecies[speciesHex.toString()].push(species);
        } else {
          tmpHexasToSpecies[speciesHex.toString()] = [species];
        }
      }
    }

    let tmpHexagonHeatMap = {};
    let tmpHexagonHeatMapMax = 0;
    let tmpHexagonGeoJSON = { type: "FeatureCollection", features: [] };
    if (hexagonGeoJSON) {
      for (let hexagon of hexagonGeoJSON.features) {
        let tmpHexagon = { ...hexagon, properties: { ...hexagon.properties } };
        tmpHexagon.properties.speciesCount =
          tmpHexasToSpecies[tmpHexagon.properties["HexagonID"].toString()] !=
          null
            ? tmpHexasToSpecies[tmpHexagon.properties["HexagonID"].toString()]
                .length
            : 0;

        if (tmpHexagon.properties.speciesCount > tmpHexagonHeatMapMax) {
          tmpHexagonHeatMapMax = tmpHexagon.properties.speciesCount;
        }
        if (tmpHexagon.properties.speciesCount > 0) {
          tmpHexagonGeoJSON.features.push(tmpHexagon);
        }
      }
    }

    /*   let scale = [];
    let test = d3Scale
      .scaleLinear()
      .domain([0, tmpHexagonHeatMapMax])
      .ticks(Math.min(15, tmpHexagonHeatMapMax));

    let scaleColor = colorsys.hsvToHex(210, 100, 100);
    scale.push({ scaleColor, scaleValue: 0 });

    for (let val of test.slice(1, test.length)) {
      let scaleOpacity = 1 - val / tmpHexagonHeatMapMax;
      let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

      scale.push({ scaleColor, scaleValue: val });
    }

    setDivScaleWithType({ scale, type: "hexagons" }); */

    setHexagonGeoJSONTest(tmpHexagonGeoJSON);
    setHexagonHeatMapMax(tmpHexagonHeatMapMax);
    setHexagonHeatMap(tmpHexagonHeatMap);
  }, [hexagonGeoJSON, speciesHexas, isTerrestial]);

  const colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

  const scaleColors = useMemo(() => {
    return divScale.scale.flatMap((e) => {
      return [e.scaleValue, e.scaleColor];
    });
  }, [divScale.scale]);

  async function calcEcoStatistics() {
    const ecoStatistics = [];
    const ecoStats = {};

    const features =
      ref.current != null
        ? ref.current.querySourceFeatures("ecoregionsource")
        : [];

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of features) {
      const trends = [];
      if (ecosToSpecies[feature.properties.ECO_ID.toString()] === undefined) {
        continue;
      }
      let data = Object.fromEntries(
        ecosToSpecies[feature.properties.ECO_ID.toString()].map((spec) => {
          trends.push({ name: spec, trend: getPopulationTrend(spec) });
          return [spec, getSpeciesThreatLevel(spec, threatType)];
        })
      );

      const grouped = groupBy(Object.values(data), "numvalue");
      const groupedTrends = groupBy(trends, "trend");
      const translated = {};
      const translatedTrends = {};
      for (let key of Object.keys(grouped)) {
        translated[grouped[key][0].abbreviation] =
          grouped[key.toString()].length;
      }
      for (let key of Object.keys(groupedTrends)) {
        translatedTrends["TREND_" + key] = groupedTrends[key].length;
      }

      ecoStats[feature.properties.ECO_ID.toString()] = {
        ECO_ID: feature.properties.ECO_ID,
        ECO_NAME: feature.properties.ECO_NAME,
        SPECIES_COUNT: Object.keys(data).length,
        ...translatedTrends,
        ...translated
      };
    }

    let file = new Blob([JSON.stringify(Object.values(ecoStats), null, 4)], {
      type: "application/json"
    });
    let filename = "ecoregionStatistics.json";
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      let a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  useEffect(() => {
    updateMarkers();
    updateEcoregions();
  }, [timeFrame]);

  function updateEcoregions() {
    const newMarkers = [];
    const tmpEcoThreatMarkersCache = ecoThreatMarkersCache;
    const features =
      ref.current != null
        ? ref.current.querySourceFeatures("ecoregionsourceCentroid")
        : [];

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      if (!props.cluster) {
        props.ecos = props.ECO_ID.toString();
      }
      //const id = props.cluster_id;
      let ecosArray = [];

      let data = Object.fromEntries(
        [
          ...new Set(
            props.ecos
              .trim()
              .split(" ")
              .flatMap((e) => {
                ecosArray.push(e);
                return ecosToSpecies[e];
              })
              .filter((element) => {
                return element != null;
              })
          )
        ].map((spec) => {
          return [spec, getSpeciesThreatLevel(spec, threatType)];
        })
      );

      if (Object.keys(data).length === 0) {
        continue;
      }

      props.data = data;

      const threatNumvalues = Object.values(data).map((threat) => {
        return threat.numvalue;
      });

      const markerKey = `${threatNumvalues
        .sort()
        .join()}${threatType}${colorBlind}EcoMarker${JSON.stringify(
        timeFrame
      )}`;

      let markerElement = ecoThreatMarkersCache[markerKey];
      if (!markerElement) {
        markerElement = createDonutChart(props);
        tmpEcoThreatMarkersCache[markerKey] = markerElement;
      }
      newMarkers.push({
        element: markerElement,
        lng: coords[0],
        lat: coords[1],
        ecosArray: ecosArray
      });
    }
    setEcoThreatMarkers(newMarkers);
    setEcoThreatMarkersCache(tmpEcoThreatMarkersCache);
  }

  function highlight(array) {
    if (isoToCountryID && Object.keys(isoToCountryID).length > 0) {
      setHoveredStateIds([
        ...hoveredStateIds,
        ...array.map((e) => isoToCountryID[e])
      ]);
    }
  }

  function highlightEcosUnderDonut(array) {
    if (ecosToMyIDs && Object.keys(ecosToMyIDs).length > 0) {
      setHoveredStateIds([
        ...hoveredStateIds,
        ...array.map((e) => ecosToMyIDs[e])
      ]);
    }
  }

  function updateMarkers() {
    const newMarkers = [];
    const tmpCapitalMarkerCache = capitalMarkerCache;
    //const features = ref.current.querySourceFeatures("capitalssource");
    const features =
      ref.current != null
        ? ref.current.querySourceFeatures("threatCapitalsSource")
        : [];

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      if (!props.cluster) {
        props.countries = props.ISO3CD;
      }
      //const id = props.cluster_id;

      const countriesArray = [];

      let data = Object.fromEntries(
        [
          ...new Set(
            props.countries
              .match(/.{1,3}/g)
              .flatMap((e) => {
                countriesArray.push(e);
                return countriesToSpecies[e];
              })
              .filter((element) => {
                return element != null;
              })
          )
        ].map((spec) => {
          return [spec, getSpeciesThreatLevel(spec, threatType)];
        })
      );

      if (Object.keys(data).length === 0) {
        continue;
      }

      props.data = data;
      props.countriesArray = countriesArray;

      const threatNumvalues = Object.values(data).map((threat) => {
        return threat.numvalue;
      });
      const markerKey = `${threatNumvalues
        .sort()
        .join()}${threatType}${colorBlind}${JSON.stringify(timeFrame)}`;

      let markerElement = tmpCapitalMarkerCache[markerKey];
      if (!markerElement) {
        markerElement = createDonutChart(props);
        tmpCapitalMarkerCache[markerKey] = markerElement;
      }
      newMarkers.push({
        element: markerElement,
        lng: coords[0],
        lat: coords[1],
        countriesArray: countriesArray
      });
    }
    setCapitalThreatMarkers(newMarkers);
    setCapitalMarkerCache(tmpCapitalMarkerCache);
  }

  function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  function createDonutChart(props) {
    const offsets = [];

    // const counts = [props.mag1, props.mag2, props.mag3, props.mag4, props.mag5];
    const data = props.data;

    const grouped = groupBy(Object.values(data), "numvalue");

    const sortedGroupedKeys = Object.keys(grouped).sort().reverse();

    let total = 0;
    for (const group of sortedGroupedKeys) {
      offsets.push(total);
      total += grouped[group].length;
    }

    const fontSize =
      total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
    const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;

    return (
      <svg
        width={`${w}`}
        height={`${w}`}
        viewBox={`0 0 ${w} ${w}`}
        textAnchor="middle"
      >
        <circle
          cx={r}
          cy={r}
          r={r}
          fill="white"
          stroke={showThreatDonuts === "white" ? "gray" : "none"}
        ></circle>
        {showThreatDonuts && showThreatDonuts !== "white" && (
          <g transform={"translate(1, 1)"}>
            {sortedGroupedKeys.map((item, index) => {
              return donutSegment(
                offsets[index] / total,
                (offsets[index] + grouped[item].length) / total,
                r - 1,
                r0 - 1,
                grouped[item][0].getColor(colorBlind),
                `donut-segment-${index}-${nanoid()}`
              );
            })}
          </g>
        )}
        <text dominantBaseline="central" transform={`translate(${r}, ${r})`}>
          {total.toLocaleString()}
        </text>
      </svg>
    );
  }

  function donutSegment(start, end, r, r0, color, key) {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
      y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
      y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return (
      <path
        key={key}
        d={`M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
          r + r * y0
        } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
          r + r0 * x1
        } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
          r + r0 * y0
        }`}
        fill={`${color}`}
      />
    );
  }

  const [hoveredStateIds, setHoveredStateIds] = useState([]);

  useEffect(() => {
    let tmpHighlightLines = hoveredStateIds
      .map((e) => {
        if (
          ecoRegionsHighlightLinesIndex &&
          ecoRegionsHighlightLinesIndex.hasOwnProperty(e)
        ) {
          return ecoRegionsHighlightLinesIndex[e];
        } else if (
          countriesHighlightLinesIndex &&
          countriesHighlightLinesIndex.hasOwnProperty(e)
        ) {
          return countriesHighlightLinesIndex[e];
        } else {
          return null;
        }
      })
      .filter((e) => e != null);
    setHighlightLinesGeoJSON({
      type: "FeatureCollection",
      features: tmpHighlightLines
    });
  }, [
    hoveredStateIds,
    ecoRegionsHighlightLinesIndex,
    countriesHighlightLinesIndex,
    ref
  ]);

  /* const { newWidth, newHeight } = useMemo(() => {
    let tmpWidth = width;
    let tmpHeight = height;

    if (keepAspectRatio) {
      if (height <= width) {
        tmpHeight = width / (16 / 9);
      } else {
        tmpWidth = (16 / 9) * height;
      }
    }

    if (activeMapLayer == null) {
      tmpHeight = tmpHeight - 40;
    }

    return { newWidth: tmpWidth, newHeight: tmpHeight };
  }, [width, height, activeMapLayer, keepAspectRatio]); */

  const onPolygonHover = useCallback(
    (event) => {
      if (event.features.length > 0) {
        const feat = event.features && event.features[0];

        let hoverIds = [];
        switch (mapMode) {
          case "countries":
            const iso = feat.properties.ISO3CD;
            hoverIds = [isoToCountryID[iso]];
            break;
          case "ecoregions":
            const ecoID = feat.properties.ECO_ID;
            hoverIds = [ecosToMyIDs[ecoID]];
            break;
          case "hexagons":
            break;
          default:
            break;
        }

        setHoveredStateIds([hoverIds]);
      } else {
        setHoveredStateIds([]);
      }
      /*  setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      countyName: county && county.properties.COUNTY
    }); */
    },
    [mapMode, isoToCountryID, ecosToMyIDs]
  );

  /*  if (ref.current && ref.current.getStyle().layers.includes("state-label")) {
      return "state-label";
    } else {
      return null;
    } */

  const hexagonPaint = useMemo(() => {
    if (polygonFill) {
      return {
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "speciesCount"],
            ...scaleColors
          ]
        },
        type: "fill"
      };
    } else {
      return {
        paint: {
          "line-color": "rgba(249,249,249,1)",
          "line-width": 2
        },
        type: "line"
      };
    }
  }, [polygonFill, scaleColors]);

  const setFocusOnLegend = useCallback(() => {
    legendRef.current?.focus();
  }, [legendRef]);

  const layers = useMemo(() => {
    if (ref && ref.current) {
      return ref.current.getStyle().layers.map((e) => e.id);
    } else {
      return [];
    }
  }, [ref]);

  return (
    <div
      className="grid grid-cols-1 grid-rows-[min-content_1fr]"
      style={{
        border: keepAspectRatio ? "1px solid black" : "",
        width: `${newWidth}px`,
        height: `${newHeight}px`
      }}
    >
      {
        isStory === false && (
          <div
            style={{
              height: "50px",
              display: "grid",
              gridTemplateColumns: "100%",
              marginRight: "5px",
              gap: "5px"
              // paddingLeft: "2px"
            }}
          >
            <div className="diversityScaleWrapper">
              <DiversityScale
                className="diversityScale"
                scales={divScale}
                mapMode={mapMode}
                setMapMode={setFormMapMode}
                colorBlind={colorBlind}
              />
            </div>
            {/* <div className="diversityScaleWrapper">
              <DiversityScale
                className="diversityScale"
                scales={divScale}
                mapMode={mapMode}
              />
            </div> */}
          </div>
        )
        /*         <div style={{ height: "20px", display: "flex" }}>
          <form
            onChange={(e) => {
              setFormMapMode(e.target.value);
            }}
          >
            <input
              type="radio"
              id="countries"
              name="map_mode"
              value="countries"
              defaultChecked={mapMode === "countries"}
            />
            <label htmlFor="html">Countries</label>
            <input
              type="radio"
              id="ecoregions"
              name="map_mode"
              value="ecoregions"
            />
            <label htmlFor="css">Ecoregions</label>
            <input
              type="radio"
              id="hexagons"
              name="map_mode"
              value="hexagons"
            />
            <label htmlFor="javascript">Hexagons</label>
            <input
              type="radio"
              id="orchestras"
              name="map_mode"
              value="orchestras"
            />
            <label htmlFor="javascript">Orchestras</label>
            <input
              type="radio"
              id="protection"
              name="map_mode"
              value="protection"
            />
            <label htmlFor="javascript">Protection Potential</label>
          </form>
          {mapMode === "ecoregions" && (
            <button onClick={calcEcoStatistics}>Stats</button>
          )}
        </div> */
        /* <div
        className="mapLegend"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center"
        }}
      >
        <div
          className="mapLegendHoverHandle"
          onClick={() => {
            setShowLegend(!showLegend);
            setFocusOnLegend();
          }}
          onMouseEnter={() => {
            console.log("Mouse Enter");
            setShowLegend(!showLegend);
            setFocusOnLegend();
          }}
        >
          Legend
        </div>
        <div
          className="mapLegendWrapper"
          ref={legendRef}
          tabIndex={-1}
          onBlur={(event) => {
            setShowLegend(false);
          }}
        >
          {showLegend && (
            <>
              {showThreatDonuts && (
                <div className="mapLegendThreatWrapper">
                  <Legend
                    type={threatType}
                    threatType={threatType}
                    colorBlind={colorBlind}
                    setCategoryFilter={setCategoryFilter}
                    categoryFilter={categoryFilter}
                  />
                </div>
              )}
              <div className="diversityScaleWrapper">
                <DiversityScale
                  className="diversityScale"
                  scales={divScale}
                  mapMode={mapMode}
                />
              </div>
            </>
          )}
        </div> 
      </div> */
      }
      <ReactMapGL
        ref={ref}
        /* reuseMaps={false} */
        mapStyle={mapStyle}
        key={`thatIsMyMap`}
        //initialViewState={mapViewport}
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 1
        }}
        style={{ width: "100%", height: "100%", position: "relative" }}
        //mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        //mapStyle="https://demotiles.maplibre.org/style.json"
        //mapStyle="mapbox://styles/mapbox/streets-v11"
        //mapStyle="mapbox://styles/jakobkusnick/clhqglu2h01we01qu8b085mkm"
        onRender={() => {
          if (capitalsGeoJSON && mapMode === "countries") {
            updateMarkers();
          }

          if (
            ecoRegionsGeoJson &&
            ["hexagons", "ecoregions", "protection"].includes(mapMode)
          ) {
            updateEcoregions();
          }
        }}
        fog={{
          range: [0.8, 8],
          color: "rgb(48,77,106)",
          "horizon-blend": 0.2,
          "high-color": "#245bde",
          "space-color": "#000000",
          "star-intensity": 0.15
        }}
        projection={projection}
        //projection="equalEarth"
        //mapLib={maplibregl}
        mapboxAccessToken={mapboxAccessToken}
        /* interactiveLayerIds={[
          "countriesSpecies",
          "ecoRegions",
          "ecoRegionsProtection"
        ]} */
        interactiveLayerIds={interactiveLayerIds}
        /* onMouseMove={(event) => {
          if (event.features.length > 0) {
            let id = event.features[0].properties.myID;
            if (hoveredStateIds != null && !hoveredStateIds.includes(id)) {
              setHoveredStateIds([id]);
            }
          }
        }} */
        onMouseMove={onPolygonHover}
        onMouseDown={(e) => {
          if (e.originalEvent.altKey && e.originalEvent.which === 1) {
            alert(
              `Mouse and Alt was pressed. Here is your location: [${e.lngLat.lng}, ${e.lngLat.lat}]`
            );
          }
        }}
        onMouseLeave={(event) => {
          setHoveredStateIds([]);
        }}
        onClick={(event) => {
          console.log(
            "CLICK EVENT",
            event,
            event.features[0].properties,
            countriesToSpecies
          );

          if (event.features.length > 0) {
            if (event.features[0].properties.hasOwnProperty("ROMNAM")) {
              setSelectedCountry(event.features[0].properties.ROMNAM);
            }
          }
        }}
      >
        {keepAspectRatio !== true && (
          <>
            <NavigationControl />
            <ScaleControl />
          </>
        )}
        {countriesHeatMapMax && countriesHeatMap && showCountries && (
          <Source
            type="geojson"
            id="countriesSource"
            data={countriesGeoJsonTest}
          >
            <Layer
              key={`countriesFillLayer`}
              beforeId={
                mapStyle.includes("light") ||
                layers.includes("state-label") != null
                  ? "state-label"
                  : null
              }
              {...{
                id: "countriesSpecies",
                type: "fill",
                source: "countriesSource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speciesCount"],
                    ...scaleColors
                  ]
                },
                layout: {
                  visibility: mapMode === "countries" ? "visible" : "none"
                }
              }}
            />
            {/*  <Layer
              key={`countriesLineLayer${hoveredStateIds.join("")}`}
              {...{
                id: "countriesSpeciesLines",
                type: "line",
                source: "countriesSource",
                paint: {
                  "line-color": "purple",
                  "line-width": 2
                },
                filter: tester,
                layout: {
                  visibility: mapMode === "countries" ? "visible" : "none"
                }
              }}
            /> */}
          </Source>
        )}
        {ecoregionHeatMap && ecoregionHeatMapMax && (
          <Source
            type="geojson"
            id="ecoregionsource"
            data={ecoRegionsGeoJsonTest}
          >
            <Layer
              key={`ecoregionFillLayer`}
              {...{
                id: "ecoRegions",
                type: "fill",
                source: "ecoregionsource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speciesCount"],
                    ...scaleColors
                  ]
                  /*  "fill-outline-color": [
                    "case",
                    ["boolean", tester, false],
                    "purple",
                    "transparent"
                  ] */
                },
                layout: {
                  visibility: mapMode === "ecoregions" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        {/* {marineEcoregionHeatMap && marineEcoregionHeatMapMax && (
          <Source
            type="geojson"
            id="ecoregionsource"
            data={marineEcoRegionsGeoJson}
          >
            <Layer
              key={`ecoregionFillLayer`}
              {...{
                id: "ecoRegions",
                type: "fill",
                source: "ecoregionsource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speciesCount"],
                    ...scaleColors
                  ]
                },
                layout: {
                  visibility:
                    mapMode === "ecoregions" && isTerrestial === false
                      ? "visible"
                      : "none"
                }
              }}
            />
          </Source>
        )} */}
        <Source
          type="geojson"
          id="ecoregionProtectionsource"
          data={ecoRegionsGeoJson}
        >
          <Layer
            {...{
              id: "ecoRegionsProtection",
              type: "fill",
              source: "ecoregionProtectionsource",
              paint: {
                "fill-color": [
                  "case",
                  ["==", ["get", "NNH"], 0],
                  bgciAssessment.get("DD").getColor(colorBlind),
                  ["==", ["get", "NNH"], 1],
                  bgciAssessment.get("nT").getColor(colorBlind),
                  ["==", ["get", "NNH"], 2],
                  bgciAssessment.get("PT").getColor(colorBlind),
                  ["==", ["get", "NNH"], 3],
                  bgciAssessment.get("TH").getColor(colorBlind),
                  ["==", ["get", "NNH"], 4],
                  bgciAssessment.get("EX").getColor(colorBlind),
                  "white"
                ],
                "fill-outline-color": "white"
              },
              layout: {
                visibility: mapMode === "protection" ? "visible" : "none"
              }
            }}
          />
        </Source>
        <Source
          type="geojson"
          id="ecoregionsourceCentroid"
          data={centroidsOfEcoregions}
          cluster={true}
          key={`${threatType}${colorBlind}Centroids`}
          clusterRadius={50}
          clusterProperties={{
            ecos: ["concat", ["concat", " ", ["get", "ECO_ID"]]]
          }}
        >
          <Layer
            {...{
              id: "ecoregionCentroidClusters",
              source: "ecoregionsourceCentroid",
              type: "circle",
              paint: {
                "circle-color": "transparent",
                "circle-radius": 0
              },
              layout: {
                visibility: ["hexagons", "ecoregions", "protection"].includes(
                  mapMode
                )
                  ? "visible"
                  : "none"
              }
            }}
          />
        </Source>
        {orchestraHeatMap && orchestraHeatMapMax && (
          <Source
            id="countriesOrchestraSource"
            type="geojson"
            data={countriesGeoJsonTest}
          >
            <Layer
              beforeId={
                mapStyle.includes("light") || layers.includes("state-label")
                  ? "state-label"
                  : null
              }
              key="countriesOrchestrasLayer"
              {...{
                id: "countriesOrchestras",
                type: "fill",
                source: "countriesOrchestraSource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "orchestraCount"],
                    ...scaleColors
                  ]
                },
                layout: {
                  visibility: mapMode === "orchestras" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        {orchestraHeatMap && orchestraHeatMapMax && (
          <Source
            type="geojson"
            id="orchestrassource"
            data={orchestraGeoJson}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={70}
          >
            <Layer
              {...{
                id: "orchestras",
                type: "circle",
                source: "orchestrassource",
                filter: ["has", "point_count"],
                paint: {
                  "circle-color": "purple",
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#FFF",
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    10,
                    25,
                    20,
                    100,
                    30,
                    750,
                    35
                  ]
                },
                layout: {
                  visibility: mapMode === "orchestras" ? "visible" : "none"
                }
              }}
            />

            <Layer
              {...{
                id: "orchestrasCount",
                type: "symbol",
                source: "orchestrassource",
                filter: ["has", "point_count"],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-size": 12,
                  visibility: mapMode === "orchestras" ? "visible" : "none"
                },
                paint: {
                  "text-color": "white"
                }
              }}
            />

            <Layer
              {...{
                id: "unclustered-orchestras",
                type: "circle",
                source: "orchestrassource",
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": "purple",
                  "circle-radius": 4,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff"
                },
                layout: {
                  visibility: mapMode === "orchestras" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        {isoToCountryID && Object.keys(isoToCountryID).length > 0 && (
          <Source
            type="geojson"
            id="threatCapitalsSource"
            data={capitalsGeoJSON}
            cluster={true}
            key={`${threatType}${colorBlind}${mapMode}`}
            clusterRadius={50}
            clusterProperties={{
              countries: ["concat", ["get", "ISO3CD"]]
            }}
          >
            <Layer
              {...{
                id: "threatCapitals",
                source: "threatCapitalsSource",
                type: "circle",
                filter: ["!=", "cluster", true],
                paint: {
                  "circle-color": colors[2],
                  "circle-radius": 0,
                  "circle-opacity": 0.8
                },
                layout: {
                  visibility: mapMode === "countries" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        {capitalThreatMarkers &&
          mapMode === "countries" &&
          showThreatDonuts &&
          capitalThreatMarkers.map((element, index) => {
            return (
              <Marker
                key={`marker-${index}${threatType}${colorBlind}${mapMode}`}
                longitude={element.lng}
                latitude={element.lat}
                anchor="center"
              >
                <div
                  className={"threatIconOnMap"}
                  onMouseMove={(event) => {
                    highlight(element.countriesArray);
                    event.stopPropagation();
                  }}
                  onMouseLeave={(event) => {
                    setHoveredStateIds([]);
                  }}
                >
                  {element.element}
                </div>
              </Marker>
            );
          })}
        {/* {ecoThreatMarkers &&
          showThreatDonuts &&
          ["hexagons", "ecoregions", "protection"].includes(mapMode) &&
          ecoThreatMarkers.map((element, index) => {
            return (
              <Marker
                key={`ecoMarker-${index}${threatType}${colorBlind}`}
                longitude={element.lng}
                latitude={element.lat}
                anchor="center"
              >
                <div
                  className={"threatIconOnMap"}
                  onMouseMove={(event) => {
                    highlightEcosUnderDonut(element.ecosArray);
                    event.stopPropagation();
                  }}
                  onMouseLeave={(event) => {
                    setHoveredStateIds([]);
                  }}
                >
                  {element.element}
                </div>
              </Marker>
            );
          })} */}
        {extraPolygonGeoJSON && extraPolygon && (
          <Source
            type="geojson"
            data={extraPolygonGeoJSON}
            id="extraPolygonSource"
          >
            {extraPolygon.fill === null && (
              <Layer
                key={`extraPolygonLineLayer`}
                {...{
                  id: "extraPolygonLine",
                  source: "extraPolygonSource",
                  type: "line",
                  paint: { ...extraPolygonPaint }
                }}
              />
            )}
            {extraPolygon.fill && (
              <Layer
                key={`extraPolygonFillLayer`}
                {...{
                  id: "extraPolygonFill",
                  source: "extraPolygonSource",
                  type: "fill",
                  paint: { ...extraPolygonPaint }
                }}
              />
            )}
          </Source>
        )}
        {hexagonHeatMap && hexagonHeatMapMax && polygonFill && (
          <Source type="geojson" id="hexagonsource" data={hexagonGeoJSONTest}>
            <Layer
              {...{
                beforeId: "state-label",
                id: "hexagons",
                source: "hexagonsource",
                ...hexagonPaint,
                layout: {
                  visibility: mapMode === "hexagons" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        {hexagonHeatMap && hexagonHeatMapMax && !polygonFill && (
          <Source type="geojson" id="hexagonsource" data={hexagonGeoJSONTest}>
            <Layer
              {...{
                id: "hexagons",
                source: "hexagonsource",
                ...hexagonPaint,
                layout: {
                  visibility: mapMode === "hexagons" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}
        <Source
          type="geojson"
          id="highlightLinesSource"
          data={highlightLinesGeoJSON}
        >
          <Layer
            //key={`ecoregionLineLayer${hoveredStateIds.join("")}`}
            {...{
              id: "highlightLines",
              type: "line",
              source: "highlightLinesSource",
              paint: {
                "line-color": "purple",
                "line-width": 2
              }
            }}
          />
        </Source>
        {(mapMode === "ecoregions" || mapMode === "hexagons") && (
          <div
            className="mapboxgl-ctrl mapboxgl-ctrl-group"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              borderRadius: "4px",
              backgroundColor: "white",
              width: "60px",
              height: "29px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer"
            }}
            type="button"
            onClick={(e) => {
              setTerrestial(!isTerrestial);
            }}
          >
            <div className="tools-box w-full h-full">
              <div className="grid grid-cols-2 w-[60px] justify-items-center h-full">
                <div
                  className={`border-r border-[#e5e7eb] rounded-[4px_0px_0px_4px] w-full h-full flex justify-center items-center delay-150 duration-500 ease-in-out transition-colors ${
                    isTerrestial ? "bg-transparent" : "bg-[#f3f3f4]"
                  } hover:bg-[rgba(45,45,255,0.2)]`}
                  onMouseEnter={(e) => {
                    setTooltip({
                      tooltipText: "Terrestrial",
                      tooltipMode: "text"
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip(null);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMountainSun}
                    color={isTerrestial ? blueIconColor : "gray"}
                    className="delay-150 duration-1000 ease-in-out transition-colors"
                    size="lg"
                  />
                </div>
                <div
                  className={`flex items-center justify-center size-full delay-150 duration-500 ease-in-out transition-colors rounded-[0px_4px_4px_0px] ${
                    isTerrestial ? "#f3f3f4" : "transparent"
                  } hover:bg-[rgba(45,45,255,0.2)]`}
                  onMouseEnter={(e) => {
                    setTooltip({
                      tooltipText: "Marine",
                      tooltipMode: "text"
                    });
                  }}
                  onMouseLeave={() => {
                    setTooltip(null);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDroplet}
                    color={isTerrestial ? "gray" : blueIconColor}
                    className="delay-150 duration-1000 ease-in-out transition-colors"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </ReactMapGL>
    </div>
  );
});

export default Map;

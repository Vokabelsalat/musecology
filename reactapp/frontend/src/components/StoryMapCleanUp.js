import * as turf from "@turf/turf";
import { layerGroup } from "leaflet";
import {
  useEffect,
  useRef,
  useMemo,
  useState,
  forwardRef,
  useCallback
} from "react";

import ReactMapGL, {
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source
} from "react-map-gl";

import { bgciAssessment } from "../utils/timelineUtils";

const StoryMap = forwardRef((props, ref) => {
  const {
    width,
    height,
    speciesCountries = {},
    speciesEcos = {},
    speciesHexas = {},
    colorBlind = false,
    getSpeciesThreatLevel = () => {
      return "DD";
    },
    threatType = "economically",
    setSelectedCountry = () => {},
    showCountries = true,
    activeMapLayer
    //mode = "light"
  } = props;

  const colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

  const [countriesGeoJson, setCountriesGeoJson] = useState(null);
  const [ecoRegionsGeoJson, setEcoRegionsGeoJson] = useState(null);
  const [orchestraGeoJson, setOrchestraGeoJson] = useState(null);
  const [capitalsGeoJSON, setCapitalsGeoJSON] = useState(null);
  const [hexagonGeoJSON, setHexagonGeoJSON] = useState(null);
  const [capitalsToISO, setCapitalsToISO] = useState(null);
  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const [orchestrasToISO3, setOrchestrasToISO3] = useState(null);
  const [capitalThreatMarkers, setCapitalThreatMarkers] = useState(null);
  const [ecoThreatMarkersCache, setEcoThreatMarkersCache] = useState({});
  const [capitalMarkerCache, setCapitalMarkerCache] = useState({});
  const [ecoThreatMarkers, setEcoThreatMarkers] = useState(null);
  //const [mapMode, setMapMode] = useState("countries");
  const [centroidsOfEcoregions, setCentroidsOfEcoregions] = useState(null);
  //const [interactiveLayerIds, setInteractiveLayerIds] = useState([]);

  const [highlightLinesGeoJSON, setHighlightLinesGeoJSON] = useState(null);
  const [ecoRegionsHighlightLinesIndex, setEcoRegionsHighlightLinesIndex] =
    useState(null);
  const [countriesHighlightLinesIndex, setCountriesHighlightLinesIndex] =
    useState(null);

  /* useEffect(() => {
    if (activeMapLayer != null && mapMode !== activeMapLayer.type) {
      setMapMode(activeMapLayer.type);
    }
  }, [activeMapLayer]); */

  const { mapMode, interactiveLayerIds, mapStyle, polygonFill } =
    useMemo(() => {
      console.log("activeMapLayer", activeMapLayer);
      let mapStyle = "mapbox://styles/mapbox/light-v11?optimize=true";
      let mapMode = "countries";
      let polygonFill = true;
      let interactiveLayerIds = ["countriesSpecies"];
      if (activeMapLayer != null) {
        switch (activeMapLayer.type) {
          case "countries":
            mapMode = "countries";
            interactiveLayerIds = ["countriesSpecies"];
            break;
          case "ecoregions":
            mapMode = "ecoregions";
            interactiveLayerIds = ["ecoRegions"];
            break;
          case "hexagons":
            mapMode = "hexagons";
            interactiveLayerIds = [];
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
          default:
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
      }

      return {
        mapMode: mapMode,
        interactiveLayerIds: interactiveLayerIds,
        mapStyle: mapStyle,
        polygonFill: polygonFill
      };
    }, [activeMapLayer]);

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

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then(function (geojson) {
        const tmpCentroids = [];
        const newFeatures = [];
        for (const ecoRegion of geojson.features) {
          if (ecoRegion.geometry != null) {
            let centroid = turf.centroid(ecoRegion);
            centroid.properties = ecoRegion.properties;
            tmpCentroids.push(centroid);
          }
          ecoRegion.properties.myID = ecoRegion.id.toString() + "EcoRegion";
          newFeatures.push(ecoRegion);
        }
        setEcoRegionsGeoJson({
          features: newFeatures,
          type: "FeatureCollection"
        });
        setCentroidsOfEcoregions({
          type: "FeatureCollection",
          features: tmpCentroids
        });
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

  const { orchestraHeatMap, orchestraHeatMapMax } = useMemo(() => {
    let tmpOrchestraHeatMap = {};
    let tmpOrchestraHeatMapMax = 0;
    if (orchestraGeoJson && orchestrasToISO3 && countriesGeoJson) {
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
    }
    return {
      orchestraHeatMap: tmpOrchestraHeatMap,
      orchestraHeatMapMax: tmpOrchestraHeatMapMax
    };
  }, [orchestraGeoJson, orchestrasToISO3, countriesGeoJson]);

  const {
    countriesToSpecies,
    isoToCountryID,
    countriesHeatMap,
    countriesHeatMapMax,
    filteredCountriesGeoJSON
  } = useMemo(() => {
    const tmpIsoToSpecies = {};
    let tmpCountriesHeatMap = {};
    let tmpCountriesHeatMapMax = 0;
    for (let species of Object.keys(speciesCountries)) {
      const countries = speciesCountries[species];
      if (countriesDictionary != null) {
        for (let speciesCountry of countries) {
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
    const tmpFilteredCountriesGeoJSON = {
      type: "FeatureCollection",
      features: []
    };
    if (countriesGeoJson) {
      for (let country of countriesGeoJson.features) {
        country.properties.myID = country.id.toString() + "COUNTRY";

        if (tmpIsoToSpecies[country.properties["ISO3CD"]] != null) {
          country.properties.speciesCount =
            tmpIsoToSpecies[country.properties["ISO3CD"]].length;
          tmpFilteredCountriesGeoJSON.features.push(country);
          /* country.properties.speciesCount =
          tmpIsoToSpecies[country.properties["ISO3CD"]] != null
          ? tmpIsoToSpecies[country.properties["ISO3CD"]].length
            : 0; */

          tmpIsoToCountryID[country.properties["ISO3CD"]] =
            country.properties.myID;

          if (country.properties.speciesCount > tmpCountriesHeatMapMax) {
            tmpCountriesHeatMapMax = country.properties.speciesCount;
          }
        }
      }
    }

    return {
      countriesToSpecies: tmpIsoToSpecies,
      isoToCountryID: tmpIsoToCountryID,
      countriesHeatMap: tmpCountriesHeatMap,
      countriesHeatMapMax: tmpCountriesHeatMapMax,
      filteredCountriesGeoJSON: tmpFilteredCountriesGeoJSON
    };
  }, [speciesCountries, countriesDictionary, countriesGeoJson]);

  const {
    ecosToSpecies,
    ecosToMyIDs,
    ecoregionHeatMap,
    ecoregionHeatMapMax,
    filteredEcoRegionsGeoJson
  } = useMemo(() => {
    const tmpEcoToSpecies = {};
    for (let species of Object.keys(speciesEcos)) {
      const ecos = speciesEcos[species];
      if (ecos != null) {
        for (let speciesEco of ecos) {
          if (tmpEcoToSpecies.hasOwnProperty(speciesEco)) {
            tmpEcoToSpecies[speciesEco].push(species);
          } else {
            tmpEcoToSpecies[speciesEco] = [species];
          }
        }
      }
    }

    let tmpEcoregionHeatMap = {};
    let tmpEcosToMyIDs = {};
    let tmpEcoregionHeatMapMax = 0;
    const filteredEcoRegionsGeoJson = {
      type: "FeatureCollection",
      features: []
    };
    if (ecoRegionsGeoJson) {
      for (let ecoregion of ecoRegionsGeoJson.features) {
        if (
          tmpEcoToSpecies[ecoregion.properties["ECO_ID"].toString()] != null
        ) {
          ecoregion.properties.speciesCount =
            tmpEcoToSpecies[ecoregion.properties["ECO_ID"].toString()].length;

          filteredEcoRegionsGeoJson.features.push(ecoregion);

          tmpEcoregionHeatMap[ecoregion.properties["ECO_ID"].toString()] =
            ecoregion.properties.speciesCount;

          tmpEcosToMyIDs[ecoregion.properties["ECO_ID"].toString()] =
            ecoregion.properties.myID;

          if (ecoregion.properties.speciesCount > tmpEcoregionHeatMapMax) {
            tmpEcoregionHeatMapMax = ecoregion.properties.speciesCount;
          }
        }
      }
    }

    return {
      ecosToSpecies: tmpEcoToSpecies,
      ecosToMyIDs: tmpEcosToMyIDs,
      ecoregionHeatMap: tmpEcoregionHeatMap,
      ecoregionHeatMapMax: tmpEcoregionHeatMapMax,
      filteredEcoRegionsGeoJson: filteredEcoRegionsGeoJson
    };
    /* setEcosToSpecies(tmpEcoToSpecies);
    setEcoregionHeatMapMax(tmpEcoregionHeatMapMax);
    setEcoregionHeatMap(tmpEcoregionHeatMap);
    setEcosToMyIDs(tmpEcosToMyIDs); */
  }, [speciesEcos, ecoRegionsGeoJson]);

  const { hexagonHeatMap, hexagonHeatMapMax, filteredHexagonGeoJSON } =
    useMemo(() => {
      const tmpHexasToSpecies = {};
      for (let species of Object.keys(speciesHexas)) {
        const hexas = speciesHexas[species];
        if (hexas != null) {
          for (let speciesHex of hexas) {
            if (tmpHexasToSpecies.hasOwnProperty(speciesHex)) {
              tmpHexasToSpecies[speciesHex.toString()].push(species);
            } else {
              tmpHexasToSpecies[speciesHex.toString()] = [species];
            }
          }
        }
      }

      let tmpHexagonHeatMap = {};
      let tmpHexagonHeatMapMax = 0;
      const filteredHexagonGeoJSON = {
        type: "FeatureCollection",
        features: []
      };
      if (hexagonGeoJSON) {
        for (let hexagon of hexagonGeoJSON.features) {
          if (
            tmpHexasToSpecies[hexagon.properties["HexagonID"].toString()] !=
            null
          ) {
            hexagon.properties.speciesCount =
              tmpHexasToSpecies[
                hexagon.properties["HexagonID"].toString()
              ].length;

            if (hexagon.properties.speciesCount > tmpHexagonHeatMapMax) {
              tmpHexagonHeatMapMax = hexagon.properties.speciesCount;
            }

            filteredHexagonGeoJSON.features.push(hexagon);
          }
        }
      }

      return {
        hexagonHeatMap: tmpHexagonHeatMap,
        hexagonHeatMapMax: tmpHexagonHeatMapMax,
        filteredHexagonGeoJSON: filteredHexagonGeoJSON
      };
    }, [hexagonGeoJSON, speciesHexas]);

  function updateEcoregions() {
    const newMarkers = [];
    const tmpEcoThreatMarkersCache = ecoThreatMarkersCache;
    const features = ref.current.querySourceFeatures("ecoregionsourceCentroid");

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
        .join()}${threatType}${colorBlind}EcoMarker`;

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
    const features = ref.current.querySourceFeatures("threatCapitalsSource");

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
        .join()}${threatType}${colorBlind}`;

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

    let total = 0;
    for (const groupedValue of Object.values(grouped)) {
      offsets.push(total);
      total += groupedValue.length;
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
        <circle cx={r} cy={r} r={r} fill="white"></circle>
        <g transform={"translate(1, 1)"}>
          {Object.keys(grouped).map((item, index) => {
            return donutSegment(
              offsets[index] / total,
              (offsets[index] + grouped[item].length) / total,
              r - 1,
              r0 - 1,
              grouped[item][0].getColor(colorBlind)
            );
          })}
        </g>
        <text dominantBaseline="central" transform={`translate(${r}, ${r})`}>
          {total.toLocaleString()}
        </text>
      </svg>
    );
  }

  function donutSegment(start, end, r, r0, color) {
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
  /*   const tester = useMemo(
    () => ["in", ["get", "myID"], ["literal", hoveredStateIds]],
    [hoveredStateIds]
  ); */

  useEffect(() => {
    let tmpHighlightLines = hoveredStateIds
      .map((e) => {
        if (ecoRegionsHighlightLinesIndex.hasOwnProperty(e)) {
          return ecoRegionsHighlightLinesIndex[e];
        } else if (countriesHighlightLinesIndex.hasOwnProperty(e)) {
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
    countriesHighlightLinesIndex
  ]);

  /* const filterCountries = useMemo(() => ['in', 'COUNTY', selectedCounty], [selectedCounty]); */
  const filterHexas = useMemo(() => [
    "in",
    "id",
    [
      "20442",
      "20594",
      "20744",
      "20897",
      "21048",
      "21049",
      "21050",
      "21052",
      "21053",
      "21202",
      "21203",
      "21204",
      "21205",
      "21206",
      "21207",
      "21356",
      "21357",
      "21358",
      "21510",
      "21661",
      "21662",
      "21664",
      "21813",
      "21814",
      "21815",
      "21816",
      "21965",
      "21966"
    ],
    [
      "20442",
      "20594",
      "20744",
      "20897",
      "21048",
      "21049",
      "21050",
      "21052",
      "21053",
      "21202",
      "21203",
      "21204",
      "21205",
      "21206",
      "21207",
      "21356",
      "21357",
      "21358",
      "21510",
      "21661",
      "21662",
      "21664",
      "21813",
      "21814",
      "21815",
      "21816",
      "21965",
      "21966"
    ]
  ]);

  const onPolygonHover = useCallback(
    (event) => {
      console.log(event);
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

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      {/*  <div>
        <form
          onChange={(e) => {
            setMapMode(e.target.value);
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
          <input type="radio" id="hexagons" name="map_mode" value="hexagons" />
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
      </div> */}
      <ReactMapGL
        ref={ref}
        /* reuseMaps={false} */
        key={`thatIsMyMap`}
        //initialViewState={mapViewport}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        // mapStyle={"mapbox://styles/mapbox/light-v11?optimize=true"}
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
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 1
        }}
        //projection="globe"
        projection="equalEarth"
        //mapLib={maplibregl}
        mapboxAccessToken="pk.eyJ1IjoiamFrb2JrdXNuaWNrIiwiYSI6ImNsYTAzYjQ2NjBrdnQzcWx0d2EyajFzbHQifQ.LQN-NvTn6PbHEbXHJO0CTw"
        interactiveLayerIds={interactiveLayerIds}
        // onMouseMove={(event) => {
        //   /* let cluster = ref.current.queryRenderedFeatures(event.point, {
        //     layers: ["threatCapitalsClusters"]
        //   }); */
        //   if (event.features.length > 0) {
        //     let id = event.features[0].properties.myID;
        //     if (!hoveredStateIds.includes(id)) {
        //       setHoveredStateIds([id]);
        //     }
        //   }
        // }}
        // onMouseLeave={(event) => {
        //   setHoveredStateIds([]);
        // }}
        // onClick={(event) => {
        //   if (event.features.length > 0) {
        //     if (event.features[0].properties.hasOwnProperty("ROMNAM")) {
        //       setSelectedCountry(event.features[0].properties.ROMNAM);
        //     }
        //   }
        // }}
        onMouseMove={onPolygonHover}
      >
        <NavigationControl />
        <ScaleControl />

        {mapMode === "countries" && countriesHeatMapMax && countriesHeatMap && (
          <Source
            type="geojson"
            id="countriesSource"
            data={filteredCountriesGeoJSON}
          >
            <Layer
              key={`countriesFillLayer`}
              {...{
                id: "countriesSpecies",
                type: "fill",
                source: "countriesSource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speciesCount"],
                    0,
                    "rgba(0,0,0,0)",
                    countriesHeatMapMax,
                    "rgba(0,0,255,1)"
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

        {mapMode === "ecoregions" &&
          ecoregionHeatMap &&
          ecoregionHeatMapMax && (
            <Source
              type="geojson"
              id="ecoregionsource"
              data={filteredEcoRegionsGeoJson}
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
                      0,
                      "rgba(0,0,0,0)",
                      ecoregionHeatMapMax,
                      "rgba(0,0,255,1)"
                    ]
                  },
                  layout: {
                    visibility: mapMode === "ecoregions" ? "visible" : "none"
                  }
                }}
              />
            </Source>
          )}

        {mapMode === "protection" && (
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
        )}

        {["hexagons", "ecoregions", "protection"].includes(mapMode) && (
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
        )}

        {mapMode === "orchestras" &&
          showCountries &&
          orchestraHeatMap &&
          orchestraHeatMapMax && (
            <Source
              id="countriesOrchestraSource"
              type="geojson"
              data={countriesGeoJson}
            >
              <Layer
                {...{
                  id: "countriesOrchestras",
                  type: "fill",
                  source: "countriesOrchestraSource",
                  paint: {
                    "fill-color": [
                      "interpolate",
                      ["linear"],
                      ["get", "orchestraCount"],
                      0,
                      "rgba(0,0,0,0)",
                      orchestraHeatMapMax,
                      "rgba(0,0,255,1.0)"
                    ]
                  },
                  layout: {
                    visibility:
                      mapMode === "orchestras" && showCountries
                        ? "visible"
                        : "none"
                  }
                }}
              />
            </Source>
          )}

        {mapMode === "orchestras" &&
          orchestraHeatMap &&
          orchestraHeatMapMax && (
            <Source
              type="geojson"
              id="orchestrassource"
              data={orchestraGeoJson}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={35}
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
                    "circle-stroke-color": "#fff",
                    "circle-radius": [
                      "step",
                      ["get", "point_count"],
                      5,
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

        {ecoThreatMarkers &&
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
          })}

        {mapMode === "hexagons" && hexagonHeatMap && hexagonHeatMapMax && (
          <Source
            type="geojson"
            id="hexagonsource"
            data={filteredHexagonGeoJSON ?? {}}
          >
            <Layer
              {...{
                id: "hexagons",
                type: "fill",
                source: "hexagonsource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "speciesCount"],
                    0,
                    "rgba(0,0,0,0)",
                    hexagonHeatMapMax,
                    polygonFill === true ? "rgba(0,0,255,1)" : "rgba(0,0,0,0)"
                  ],
                  "fill-outline-color": "rgba(240,240,240,1)"
                },
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
      </ReactMapGL>
    </div>
  );
});

StoryMap.displayName = "StoryMap";

export default StoryMap;

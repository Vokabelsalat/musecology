import { replaceSpecialCharacters } from "../utils/utils";
import PieChartNew from "./PieChartNew";
import { useEffect, useState, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Rectangle,
  Polygon,
  Popup,
  GeoJSON,
  LayersControl
} from "react-leaflet";

import ReactMapGL, {
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  Marker
} from "react-map-gl";
import { count } from "d3";

import { bgciAssessment } from "../utils/timelineUtils";

export default function Map(props) {
  const {
    width,
    height,
    speciesCountries,
    speciesEcos,
    speciesHexas,
    colorBlind,
    getSpeciesThreatLevel,
    threatType
  } = props;

  const [countriesGeoJson, setCountriesGeoJson] = useState(null);
  const [ecoRegionsGeoJson, setEcoRegionsGeoJson] = useState(null);
  const [orchestraGeoJson, setOrchestraGeoJson] = useState(null);
  const [capitalsGeoJSON, setCapitalsGeoJSON] = useState(null);
  const [hexagonGeoJSON, setHexagonGeoJSON] = useState(null);
  const [capitalsToISO, setCapitalsToISO] = useState(null);
  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const [orchestrasToISO3, setOrchestrasToISO3] = useState(null);
  const [orchestraHeatMap, setOrchestraHeatMap] = useState(null);
  const [orchestraHeatMapMax, setOrchestraHeatMapMax] = useState(null);
  const [capitalThreatMarkers, setCapitalThreatMarkers] = useState(null);
  const [ecoThreatMarkersCache, setEcoThreatMarkersCache] = useState({});
  const [capitalMarkerCache, setCapitalMarkerCache] = useState({});
  const [ecoThreatMarkers, setEcoThreatMarkers] = useState(null);
  const [mapMode, setMapMode] = useState("countries");
  const [centroidsOfEcoregions, setCentroidsOfEcoregions] = useState(null);
  const [ecoregionHeatMap, setEcoregionHeatMap] = useState(null);
  const [ecoregionHeatMapMax, setEcoregionHeatMapMax] = useState(null);
  const [countriesHeatMap, setCountriesHeatMap] = useState(null);
  const [countriesHeatMapMax, setCountriesHeatMapMax] = useState(null);
  const [hexagonHeatMap, setHexagonHeatMap] = useState(null);
  const [hexagonHeatMapMax, setHexagonHeatMapMax] = useState(null);
  const [isoToCountryID, setIsoToCountryID] = useState(null);
  const [ecoRegionsGeoJsonLines, setEcoRegionsGeoJsonLines] = useState(null);
  const [ecoRegionsGeoJsonLinesFiltered, setEcoRegionsGeoJsonLinesFiltered] =
    useState(null);
  const [ecoToFeature, setEcoToFeature] = useState(null);

  useEffect(() => {
    /*  fetch("/UN_Worldmap-2.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setCountriesGeoJson(geojson);
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
      }); */

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then(function (geojson) {
        const tmpCentroids = [];
        for (const ecoRegion of geojson.features) {
          if (ecoRegion.geometry != null) {
            let centroid = turf.centroid(ecoRegion);
            centroid.properties = ecoRegion.properties;
            tmpCentroids.push(centroid);
          }
        }
        setEcoRegionsGeoJson(geojson);
        setCentroidsOfEcoregions({
          type: "FeatureCollection",
          features: tmpCentroids
        });
      });

    fetch("/WWF_Terrestrial_Ecoregions2017-3-5_lines.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpEcoLines = {};
        for (const ecoRegion of geojson.features) {
          tmpEcoLines[ecoRegion["id"]] = ecoRegion;
        }
        setEcoRegionsGeoJsonLines(geojson);
        setEcoToFeature(tmpEcoLines);
      });

    /*  fetch("/POPP_capitals_FeaturesToJSON.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpCapToISO = {};
        for (let cap of geojson.features) {
          tmpCapToISO[cap["id"].toString()] = cap["properties"]["ISO3CD"];
        }
        setCapitalsToISO(tmpCapToISO);
        setCapitalsGeoJSON(geojson);
      }); */

    /*  fetch("/Orchestras_worldwide.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setOrchestraGeoJson(geojson);
      });

    fetch("/hexagon_2_Project.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setHexagonGeoJSON(geojson);
      }); */
  }, []);

  /* useEffect(() => {
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

      setOrchestraHeatMap(tmpOrchestraHeatMap);
      setOrchestraHeatMapMax(tmpOrchestraHeatMapMax);
      setCountriesGeoJson(countriesGeoJson);
    }
  }, [orchestraGeoJson, orchestrasToISO3, countriesGeoJson]); */

  const [countriesToSpecies, setCountriesToSpecies] = useState(null);

  /* useEffect(() => {
    const tmpIsoToSpecies = {};
    let tmpCountriesHeatMap = {};
    let tmpCountriesHeatMapMax = 0;
    for (let species of Object.keys(speciesCountries)) {
      const countries = speciesCountries[species];
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

    const tmpIsoToCountryID = {};
    if (countriesGeoJson) {
      for (let country of countriesGeoJson.features) {
        country.properties.speciesCount =
          tmpIsoToSpecies[country.properties["ISO3CD"]] != null
            ? tmpIsoToSpecies[country.properties["ISO3CD"]].length
            : 0;

        tmpIsoToCountryID[country.properties["ISO3CD"]] = country.id;

        if (country.properties.speciesCount > tmpCountriesHeatMapMax) {
          tmpCountriesHeatMapMax = country.properties.speciesCount;
        }
      }
    }

    setCountriesToSpecies(tmpIsoToSpecies);
    setIsoToCountryID(tmpIsoToCountryID);
    setCountriesHeatMap(tmpCountriesHeatMap);
    setCountriesHeatMapMax(tmpCountriesHeatMapMax);
    setCountriesGeoJson(countriesGeoJson);
  }, [speciesCountries, countriesDictionary, countriesGeoJson]); */

  const [ecosToSpecies, setEcosToSpecies] = useState(null);

  useEffect(() => {
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
    let tmpEcoregionHeatMapMax = 0;
    if (ecoRegionsGeoJson) {
      for (let ecoregion of ecoRegionsGeoJson.features) {
        ecoregion.properties.speciesCount =
          tmpEcoToSpecies[ecoregion.properties["ECO_ID"].toString()] != null
            ? tmpEcoToSpecies[ecoregion.properties["ECO_ID"].toString()].length
            : 0;

        tmpEcoregionHeatMap[ecoregion.properties["ECO_ID"].toString()] =
          ecoregion.properties.speciesCount;
        if (ecoregion.properties.speciesCount > tmpEcoregionHeatMapMax) {
          tmpEcoregionHeatMapMax = ecoregion.properties.speciesCount;
        }
      }
    }

    setEcosToSpecies(tmpEcoToSpecies);
    setEcoRegionsGeoJson(ecoRegionsGeoJson);
    setEcoregionHeatMapMax(tmpEcoregionHeatMapMax);
    setEcoregionHeatMap(tmpEcoregionHeatMap);
  }, [speciesEcos, ecoRegionsGeoJson]);

  /* useEffect(() => {
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
    if (hexagonGeoJSON) {
      for (let hexagon of hexagonGeoJSON.features) {
        hexagon.properties.speciesCount =
          tmpHexasToSpecies[hexagon.properties["HexagonID"].toString()] != null
            ? tmpHexasToSpecies[hexagon.properties["HexagonID"].toString()]
                .length
            : 0;

        if (hexagon.properties.speciesCount > tmpHexagonHeatMapMax) {
          tmpHexagonHeatMapMax = hexagon.properties.speciesCount;
        }
      }
    }

    setHexagonGeoJSON(hexagonGeoJSON);
    setHexagonHeatMapMax(tmpHexagonHeatMapMax);
    setHexagonHeatMap(tmpHexagonHeatMap);
  }, [hexagonGeoJSON, speciesHexas]); */

  const mapRef = useRef(null);

  const mag1 = ["<", ["get", "FID"], 50];
  const mag2 = ["all", [">=", ["get", "FID"], 50], ["<", ["get", "FID"], 100]];
  const mag3 = ["all", [">=", ["get", "FID"], 100], ["<", ["get", "FID"], 150]];
  const mag4 = ["all", [">=", ["get", "FID"], 150], ["<", ["get", "FID"], 200]];
  const mag5 = [">=", ["get", "FID"], 200];

  const colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

  function updateEcoregions() {
    const newMarkers = [];
    const tmpEcoThreatMarkersCache = ecoThreatMarkersCache;
    const features = mapRef.current.querySourceFeatures(
      "ecoregionsourceCentroid"
    );

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      if (!props.cluster) {
        props.ecos = props.ECO_ID.toString();
      }
      //const id = props.cluster_id;

      let data = Object.fromEntries(
        [
          ...new Set(
            props.ecos
              .split(" ")
              .flatMap((e) => {
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
        lat: coords[1]
      });
    }
    setEcoThreatMarkers(newMarkers);
    setEcoThreatMarkersCache(tmpEcoThreatMarkersCache);
  }

  function highlight(array) {
    /* if (isoToCountryID && Object.keys(isoToCountryID).length > 0) {
      setHoveredStateIds([
        ...hoveredStateIds,
        ...array.map((e) => isoToCountryID[e])
      ]);
    } */
  }

  function highlightEcosUnderDonut(array) {
    if (isoToCountryID && Object.keys(isoToCountryID).length > 0) {
      setHoveredStateIds([
        ...hoveredStateIds,
        ...array.map((e) => isoToCountryID[e])
      ]);
    }
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

  const [hoveredStateIds, setHoveredStateIds] = useState(null);
  const tester = useMemo(
    () => ["==", ["id"], hoveredStateIds],
    [hoveredStateIds]
  );

  /* useEffect((

  )=>{},[hoveredStateIds]) */

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      <div>
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
      </div>
      <ReactMapGL
        ref={mapRef}
        /* reuseMaps={false} */
        key={`thatIsMyMap`}
        //initialViewState={mapViewport}
        style={{ width: "100%", height: "100%" }}
        //mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        //mapStyle="https://demotiles.maplibre.org/style.json"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onRender={() => {
          if (
            ecoRegionsGeoJson &&
            ["hexagons", "ecoregions", "protection"].includes(mapMode)
          ) {
            updateEcoregions();
          }
        }}
        //projection="globe"
        projection="equalEarth"
        //mapLib={maplibregl}
        mapboxAccessToken="pk.eyJ1IjoiamFrb2JrdXNuaWNrIiwiYSI6ImNsYTAzYjQ2NjBrdnQzcWx0d2EyajFzbHQifQ.LQN-NvTn6PbHEbXHJO0CTw"
        interactiveLayerIds={["ecoRegions"]}
        onMouseMove={(event) => {
          /* let cluster = mapRef.current.queryRenderedFeatures(event.point, {
            layers: ["threatCapitalsClusters"]
          }); */
          if (event.features.length > 0) {
            let id = event.features[0].id;
            if (hoveredStateIds !== id) {
              setEcoRegionsGeoJsonLinesFiltered({
                type: "FeatureCollection",
                features: [ecoToFeature[id]]
              });
              //setHoveredStateIds(id);
            }
          }
        }}
        onMouseLeave={(event) => {
          //setHoveredStateIds(null);
        }}
      >
        <NavigationControl />
        <ScaleControl />

        {ecoregionHeatMap && ecoregionHeatMapMax && (
          <Source type="geojson" id="ecoregionsource" data={ecoRegionsGeoJson}>
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
            {/* <Layer
              key={`ecoregionLineLayer${hoveredStateIds}`}
              {...{
                id: "ecoRegionsLines",
                type: "line",
                source: "ecoregionsource",
                paint: {
                  "line-color": [
                    "case",
                    ["boolean", tester, false],
                    "purple",
                    "transparent"
                  ],
                  "line-width": 2
                },
                layout: {
                  visibility: mapMode === "ecoregions" ? "visible" : "none"
                }
              }}
            /> */}
          </Source>
        )}

        {/* {ecoregionHeatMap && ecoregionHeatMapMax && (
          <Source
            type="geojson"
            id="ecoregionsourceLines"
            data={ecoRegionsGeoJsonLines}
          >
            <Layer
              key={`ecoregionLineLayer${hoveredStateIds}`}
              {...{
                id: "ecoRegionsLines",
                type: "line",
                source: "ecoregionsourceLines",
                paint: {
                  "line-color": [
                    "case",
                    ["boolean", tester, false],
                    "purple",
                    "transparent"
                  ],
                  "line-width": 2
                },
                layout: {
                  visibility: mapMode === "ecoregions" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )} */}

        {ecoregionHeatMap && ecoregionHeatMapMax && (
          <Source
            type="geojson"
            id="ecoregionsourceLines"
            data={ecoRegionsGeoJsonLinesFiltered}
          >
            <Layer
              key={`ecoregionLineLayer${hoveredStateIds}`}
              {...{
                id: "ecoRegionsLines",
                type: "line",
                source: "ecoregionsourceLines",
                paint: {
                  "line-color": "purple",
                  "line-width": 2
                },
                layout: {
                  visibility: mapMode === "ecoregions" ? "visible" : "none"
                }
              }}
            />
          </Source>
        )}

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
                  onMouseMove={(event) => {
                    highlightEcosUnderDonut(element.ecos);
                    event.stopPropagation();
                  }}
                  onMouseLeave={(event) => {
                    setHoveredStateIds(null);
                  }}
                >
                  {element.element}
                </div>
              </Marker>
            );
          })}
      </ReactMapGL>
    </div>
  );
}

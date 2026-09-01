import { useMemo } from "react";

export function useFilterSpecies(
  kingdomData,
  filterTreeMap,
  instrumentData,
  speciesCountries,
  timelineData,
  intersectedSpecies,
  speciesEcos,
  speciesHexas
) {
  return useMemo(() => {
    let filteredTreeMap = kingdomData;
    const filtSpecies = intersectedSpecies;
    const filteredSpeciesSet = new Set(filtSpecies);
    let visibleSpeciesTimelineData = {};
    let tmpVisibleSpeciesCountries = {};
    let tmpVisibleSpeciesEcos = {};
    let tmpVisibleSpeciesHexas = {};

    for (let speciesName of filtSpecies) {
      let specCountries = speciesCountries[speciesName];
      tmpVisibleSpeciesCountries[speciesName] =
        specCountries != null ? specCountries : [];

      let specEcos = speciesEcos[speciesName];
      tmpVisibleSpeciesEcos[speciesName] = specEcos != null ? specEcos : [];

      visibleSpeciesTimelineData[speciesName] = timelineData[speciesName];

      let specHexas = speciesHexas[speciesName];
      tmpVisibleSpeciesHexas[speciesName] = specHexas != null ? specHexas : [];
    }

    let filteredInstrumentData = {};

    for (let inst of Object.keys(instrumentData)) {
      filteredInstrumentData[inst] = Object.fromEntries(
        Object.keys(instrumentData[inst]).map((e) => [
          e,
          instrumentData[inst][e].filter((value) =>
            filteredSpeciesSet.has(value)
          )
        ])
      );
    }

    filteredTreeMap = filterTreeMap(
      structuredClone(kingdomData),
      filtSpecies,
      4
    );

    return {
      filteredKingdomData: filteredTreeMap,
      filteredInstrumentData: filteredInstrumentData,
      visibleSpeciesTimelineData: visibleSpeciesTimelineData,
      visibleSpeciesCountries: tmpVisibleSpeciesCountries,
      visibleSpeciesEcos: tmpVisibleSpeciesEcos,
      visibleSpeciesHexas: tmpVisibleSpeciesHexas
    };
  }, [
    kingdomData,
    filterTreeMap,
    instrumentData,
    speciesCountries,
    timelineData,
    intersectedSpecies,
    speciesEcos,
    speciesHexas
  ]);
}

import { useMemo } from "react";

export function useTreeMapFilter(
  treeMapFilter,
  filterTreeMap,
  getSpeciesFromTreeMap,
  kingdomData,
  species
) {
  return useMemo(() => {
    let filtSpecies = Object.keys(species);
    let filteredTreeMap = kingdomData;

    if (treeMapFilter.species != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.species],
          4
        )
      );
    } else if (treeMapFilter.genus != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.genus],
          3
        )
      );
    } else if (treeMapFilter.family != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.family],
          2
        )
      );
    } else if (treeMapFilter.kingdom != null) {
      filtSpecies = getSpeciesFromTreeMap(
        filterTreeMap(
          structuredClone(filteredTreeMap),
          [treeMapFilter.kingdom],
          1
        )
      );
    }

    return filtSpecies;
  }, [
    treeMapFilter,
    filterTreeMap,
    getSpeciesFromTreeMap,
    kingdomData,
    species
  ]);
}

import { useMemo } from "react";

export function useTimelineFilter(
  categoryFilter,
  species,
  getSpeciesSignThreat
) {
  return useMemo(() => {
    if (categoryFilter === null) {
      return Object.keys(species);
    }

    let filtSpecies = [];
    const catType =
      categoryFilter.type === "cites" ? "economically" : "ecological";

    for (let speciesName of Object.keys(species)) {
      const signThreat = getSpeciesSignThreat(speciesName, catType);
      if (
        signThreat.abbreviation === categoryFilter.value &&
        signThreat.assessmentType === categoryFilter.type.toUpperCase()
      ) {
        filtSpecies.push(speciesName);
      }
    }

    return filtSpecies;
  }, [categoryFilter, species, getSpeciesSignThreat]);
}

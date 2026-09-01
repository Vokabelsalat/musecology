import { useMemo } from "react";

export function useOrchestraFilter(
  species,
  instrument,
  instrumentData,
  instrumentGroup,
  instrumentGroupData,
  instrumentPart
) {
  return useMemo(() => {
    let filtSpecies = Object.keys(species);
    if (instrumentGroup) {
      let filtInstruments = instrumentGroupData[instrumentGroup];
      if (instrument) {
        filtInstruments = [instrument];
      }

      if (instrumentPart && instrumentData.hasOwnProperty(instrument)) {
        const selectedParts = Array.isArray(instrumentPart)
          ? instrumentPart
          : [instrumentPart];

        filtSpecies = selectedParts.flatMap(
          (part) => instrumentData[instrument][part] ?? []
        );
      } else if (filtInstruments != null) {
        filtSpecies = filtInstruments
          .filter((key) => key in instrumentData)
          .reduce((filteredSpecies, key) => {
            filteredSpecies.push(
              ...Object.values(instrumentData[key]).flatMap((entry) => {
                return entry;
              })
            );
            return filteredSpecies;
          }, []);
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
  ]);
}

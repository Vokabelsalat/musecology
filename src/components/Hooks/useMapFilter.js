import { useMemo } from "react";

export function useMapFilter(species, speciesCountries, selectedCountry) {
  //United States of America
  return useMemo(() => {
    let filtSpecies = [];

    for (let speciesName of Object.keys(species)) {
      let specCountries = speciesCountries[speciesName];

      /* if (specCountries == null || specCountries.length === 0) {
        // console.log(speciesName, "doesn't have any countries");
        continue;
      } */

      if (selectedCountry != null && specCountries != null) {
        if (!specCountries.includes(selectedCountry)) {
          continue;
        }
      }

      filtSpecies.push(speciesName);
    }

    return filtSpecies;
  }, [species, speciesCountries, selectedCountry]);
}

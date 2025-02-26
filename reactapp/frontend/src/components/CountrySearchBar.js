import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { isEmojiSupported } from "is-emoji-supported";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { ReactCountryFlag } from "react-country-flag";
// import { getFlagEmoji, langUnicode } from "./Tooltip";

export default function CountrySearchBar(props) {
  const {
    speciesData: data,
    mapSearchMode,
    countriesDictionary,
    ecoRegionSearchOptions,
    setSelectedCountry,
    selectedCountry,
    setSelectedEcoregion
  } = props;

  const [value, setValue] = useState();

  const [countryOptions, ecoRegionOptions] = useMemo(() => {
    let tmpCountryOptions = [];
    let tmpEcoRegionOptions = [];
    if (countriesDictionary != null) {
      tmpCountryOptions = Object.keys(countriesDictionary)
        .filter((key) => {
          return (
            countriesDictionary[key].BGCI !== "" &&
            countriesDictionary[key].BGCI !== "replaceME"
          );
        })
        .map((e) => {
          return {
            title: countriesDictionary[e].BGCI,
            value: countriesDictionary[e].ROMNAM,
            iso: countriesDictionary[e].ISO2,
            type: "country"
          };
        })
        .sort((a, b) => {
          return (a.title > b.title) - (a.title < b.title);
        });
    }

    if (ecoRegionSearchOptions != null) {
      tmpEcoRegionOptions = ecoRegionSearchOptions.sort((a, b) => {
        return (a.title > b.title) - (a.title < b.title);
      });
    }
    return [tmpCountryOptions, tmpEcoRegionOptions];
    // const tmpSpeciesPerCountry = {};
    /* for (let key of Object.keys(data)) {
      // for()
    } */
  }, [data, countriesDictionary, ecoRegionSearchOptions]);

  const label = useMemo(() => {
    switch (mapSearchMode) {
      case "ecoregions":
      case "hexagons":
      case "protection":
        return "Ecoregion Search";
      case "countries":
      default:
        return "Country Search";
    }
  }, [mapSearchMode]);

  return (
    <Autocomplete
      value={value != null ? value : null}
      onChange={(event, newValue) => {
        if (mapSearchMode === "countries") {
          setSelectedCountry(newValue != null ? newValue.value : null);
        } else if (mapSearchMode === "ecoregions") {
          setSelectedEcoregion(newValue.value);
        }
        setValue(newValue);
      }}
      id="country-search-input"
      filterOptions={(options, params) => {
        const { inputValue } = params;

        const filtered = options.filter((entry) => {
          if (entry.title.toLowerCase().includes(inputValue.toLowerCase())) {
            entry.found = null;
            return true;
          } else if (
            entry.all != null &&
            entry.all.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            entry.found = [];
            if (
              entry.en != null &&
              entry.en.toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("en");
            }

            if (
              entry.fr != null &&
              entry.fr.toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("fr");
            }

            if (
              entry.es != null &&
              entry.es.toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("es");
            }

            if (
              entry.de != null &&
              entry.de.toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("de");
            }
            return true;
          } else {
            entry.found = null;
            return false;
          }
        });

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={
        mapSearchMode === "countries" ? countryOptions : ecoRegionOptions
      }
      getOptionLabel={(option) => {
        if (option.iso != null) {
          return `${option.title}`;
        }

        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }

        // Regular option
        return option.title;
      }}
      renderOption={(props, option) => {
        if (option.iso != null) {
          return (
            <li {...props}>
              <ReactCountryFlag
                style={{
                  fontSize: "1.5em",
                  lineHeight: "1.5em"
                }}
                countryCode={option.iso}
                svg={!isEmojiSupported("🇬🇧")}
              />
              &nbsp;
              {option.title}
            </li>
          );
        } else {
          return <li {...props}>{option.title}</li>;
        }
      }}
      sx={{ width: 250 }}
      freeSolo
      renderInput={(params) => {
        return (
          <div className="relative">
            {value != null && (
              <ReactCountryFlag
                className="absolute h-[1.6em] z-40 left-2"
                style={{
                  fontSize: "1.6em",
                  lineHeight: "1.6em",
                  height: "1.6em"
                }}
                countryCode={value.iso}
                svg={!isEmojiSupported("🇬🇧")}
              />
            )}
            <TextField
              {...params}
              className={value ? "filterUsed" : ""}
              size="small"
              variant="outlined"
              // InputLabelProps={{ shrink: value != null ? true : false }}
              label="Country Search"
            />
          </div>
        );
      }}
      style={{ display: "table-cell", verticalAlign: "middle" }}
    />
  );
}

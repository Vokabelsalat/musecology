import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { isEmojiSupported } from "is-emoji-supported";
import { useMemo } from "react";
import { ReactCountryFlag } from "react-country-flag";
import { replaceSpecialCharacters } from "../utils/utils";
import { langUnicode } from "./Tooltip";

export default function SearchBar(props) {
  const {
    id,
    setFilter,
    treeMapFilter,
    setTreeMapFilter,
    speciesData: data
  } = props;

  const value = useMemo(() => {
    return treeMapFilter.species
      ? {
          title: treeMapFilter.species,
          type: "species",
          kingdom: treeMapFilter.kingdom,
          family: treeMapFilter.familia,
          genus: treeMapFilter.genus,
          species: treeMapFilter.species
        }
      : treeMapFilter.genus
      ? {
          title: treeMapFilter.genus,
          type: "genus",
          kingdom: treeMapFilter.kingdom,
          family: treeMapFilter.familia,
          genus: treeMapFilter.genus,
          species: null
        }
      : null;
  }, [treeMapFilter]);

  //  const [value, setValue] = useState(treeMapFilter.species);

  /* const select = (val) => {
    setFilter({
      searchBarSpecies: val != null ? val.title : null,
      kingdom: val != null ? [val.kingdom] : null,
      familia: val != null ? [val.family] : null,
      genus: val != null ? [val.genus] : null,
      species: val != null ? (val.species ? [val.species] : null) : null
    });
    setValue(val);
  }; */

  let options = [];

  if (data) {
    let genus = {};
    for (let key of Object.keys(data).sort()) {
      let keyGenus = data[key].Genus.trim();
      if (!Object.keys(genus).includes(keyGenus)) {
        genus[keyGenus] = [key];
        options.push({
          title: keyGenus,
          type: "genus",
          kingdom: data[key].Kingdom.trim(),
          family: data[key].Family.trim(),
          genus: data[key].Genus.trim(),
          species: null
        });
      } else {
        genus[keyGenus].push(key);
      }

      options.push({
        title: key,
        type: "species",
        kingdom: data[key].Kingdom.trim(),
        family: data[key].Family.trim(),
        genus: data[key].Genus.trim(),
        species: key,
        en: data[key]["fixedCommonNames"]["en"],
        de: data[key]["fixedCommonNames"]["de"],
        es: data[key]["fixedCommonNames"]["es"],
        fr: data[key]["fixedCommonNames"]["fr"],
        all: Object.values(data[key]["fixedCommonNames"]).join(" ")
      });
    }

    options = options.filter((opt) => {
      if (opt["type"] === "genus" && genus[opt["genus"]].length === 1) {
        return false;
      }
      return true;
    });
  }

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        setTreeMapFilter({
          genus: newValue && newValue["genus"] ? newValue["genus"] : null,
          species: newValue && newValue["species"] ? newValue["species"] : null,
          family: newValue && newValue["family"] ? newValue["family"] : null,
          kingdom: newValue && newValue["kingdom"] ? newValue["kingdom"] : null
        });
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        /* const filtered = filter(options, params); */
        /* console.log(filtered, options, params); */

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
              entry.en.join().toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("en");
            }

            if (
              entry.fr != null &&
              entry.fr.join().toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("fr");
            }

            if (
              entry.es != null &&
              entry.es.join().toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("es");
            }

            if (
              entry.de != null &&
              entry.de.join().toLowerCase().includes(inputValue.toLowerCase())
            ) {
              entry.found.push("de");
            }
            return true;
          } else {
            entry.found = null;
            return false;
          }
        });

        /* const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.title
        ); */
        /*  if (inputValue !== "" && !isExisting) {
        filtered.push({
          inputValue,
          title: `Add "${inputValue}"`
        });
      } */

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={options}
      getOptionLabel={(option) => {
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
        return (
          <li {...props}>
            {option.type === "genus" ? (
              <span>
                <b>
                  <i>{option.title}</i>
                </b>{" "}
                (Genus)
              </span>
            ) : (
              <div>
                <i>{option.title}</i>
                {option.found && (
                  <div style={{ fontSize: "smaller" }}>
                    {option.found.map((language) => {
                      if (option[language] == null) {
                        return <></>;
                      } else {
                        let str = option[language];
                        str = Array.isArray(str) ? str.join(", ") : str;
                        return (
                          <div
                            key={`searchOption${replaceSpecialCharacters(str)}`}
                          >
                            {/* <ReactCountryFlag
                              style={{
                                fontSize: "1.5em",
                                lineHeight: "1.5em"
                              }}
                              countryCode={langUnicode[language]}
                              svg={!isEmojiSupported("🇬🇧")}
                            />{" "} */}
                            {str.charAt(0).toUpperCase() + str.slice(1)}
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      }}
      sx={{ width: 250 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          className={value ? "filterUsed" : ""}
          label="Species Search"
          size="small"
        />
      )}
      style={{ display: "table-cell", verticalAlign: "middle" }}
    />
  );
}

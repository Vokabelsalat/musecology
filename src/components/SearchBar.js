import { tickStep } from "d3";
import React, { Component } from "react";
import {
  iucnColors,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import { dangerColorMap } from "../utils/utils";

import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions();

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "SearchBar",
      data: this.props.data,
      kingdom: this.props.kingdom,
      familia: this.props.familia,
      species: this.props.species,
      genus: this.props.genus,
      setFilter: this.props.setFilter
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.setState({ data: this.props.data });
    }
    if (
      JSON.stringify(prevProps.kingdom) !== JSON.stringify(this.props.kingdom)
    ) {
      this.setState({ kingdom: this.props.kingdom });
    }
    if (
      JSON.stringify(prevProps.familia) !== JSON.stringify(this.props.familia)
    ) {
      this.setState({ familia: this.props.familia });
    }
    if (JSON.stringify(prevProps.genus) !== JSON.stringify(this.props.genus)) {
      this.setState({ genus: this.props.genus });
    }
    if (
      JSON.stringify(prevProps.species) !== JSON.stringify(this.props.species)
    ) {
      this.setState({ species: this.props.species });
    }
  }

  setValue(val) {
    this.state.setFilter({
      searchBarSpecies: val ? val.title : null,
      kingdom: val ? [val.kingdom] : null,
      familia: val ? [val.family] : null,
      genus: val ? [val.genus] : null,
      species: val ? (val.species ? [val.species] : null) : null
    });
    this.setState({ value: val });
  }

  render() {
    let value = this.state.species
      ? {
          title: this.state.species,
          type: "species",
          kingdom: this.state.kingdom,
          family: this.state.familia,
          genus: this.state.genus,
          species: this.state.species
        }
      : this.state.genus
      ? {
          title: this.state.genus,
          type: "genus",
          kingdom: this.state.kingdom,
          family: this.state.familia,
          genus: this.state.genus,
          species: null
        }
      : null;

    let setValue = this.setValue.bind(this);
    let data = this.state.data;
    let options = [];

    if (data) {
      let genus = [];
      for (let key of Object.keys(data)) {
        let keyGenus = data[key].Genus.trim();
        if (!genus.includes(keyGenus)) {
          genus.push(keyGenus);
          options.push({
            title: keyGenus,
            type: "genus",
            kingdom: data[key].Kingdom.trim(),
            family: data[key].Family.trim(),
            genus: data[key].Genus.trim(),
            species: null
          });
        }
        options.push({
          title: key,
          type: "species",
          kingdom: data[key].Kingdom.trim(),
          family: data[key].Family.trim(),
          genus: data[key].Genus.trim(),
          species: key
        });
      }
    }

    return (
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some(
            (option) => inputValue === option.title
          );
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
        renderOption={(props, option) => (
          <li {...props}>
            {option.type === "genus" ? (
              <span>
                <b>{option.title}</b> (Genus)
              </span>
            ) : (
              option.title
            )}
          </li>
        )}
        sx={{ width: 300 }}
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
}

export default SearchBar;

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

class MapSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "MapSearchBar",
      data: this.props.data,
      setFilter: this.props.setFilter,
      mode: this.props.mapSearchMode,
      searchBarData: this.props.mapSearchBarData,
      currentValue: this.props.value
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.setState({ data: this.props.data });
    }

    if (
      JSON.stringify(prevProps.mapSearchMode) !==
      JSON.stringify(this.props.mapSearchMode)
    ) {
      this.setState({ mode: this.props.mapSearchMode });
    }

    if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
      this.setState({ currentValue: this.props.value });
    }

    if (
      JSON.stringify(prevProps.mapSearchBarData) !==
      JSON.stringify(this.props.mapSearchBarData)
    ) {
      this.setState({ searchBarData: this.props.mapSearchBarData });
    }
  }

  setValue(val) {
    const filter = {};
    if (val) {
      if (val.type === "biom") {
        filter[this.state.mode] = [
          {
            value: val.title,
            ecoArray: val.value,
            title: val.title
          }
        ];
      } else {
        filter[this.state.mode] = [{ value: val.value, title: val.title }];
      }
    } else {
      filter[this.state.mode] = null;
    }
    this.state.setFilter(filter);
  }

  getLabel(mode) {
    console.log(mode);
    switch (mode) {
      case "country":
        return "Country Search";
      case "hexagon":
        return "Hexagon Search";
      case "eco":
        return "Ecoregion Search";
      default:
        break;
    }
  }

  render() {
    let currentValue = this.state.currentValue;
    let setValue = this.setValue.bind(this);
    const mode = this.state.mode;
    let data = this.state.searchBarData[mode];
    let options = [];

    if (data) {
      for (let entry of data) {
        if (entry.title.trim() !== "")
          options.push({ ...entry, key: entry.title });
      }
    }

    let biomOptions = options
      .filter((e) => e.type === "biom")
      .sort((a, b) => a.title.localeCompare(b.title));

    let restOfOptions = options
      .filter((e) => e.type !== "biom")
      .sort((a, b) => a.title.localeCompare(b.title));

    options = [...biomOptions, ...restOfOptions];

    /* options = options.sort((a, b) => {

      return b.type === "biom" ? 1 : -1;
    }); */

    let label = this.getLabel(mode);

    return (
      <Autocomplete
        value={currentValue}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) =>
            option.title.includes(inputValue)
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
          return option.title;
        }}
        renderOption={(props, option) => (
          <li {...props}>
            {option.type === "biom" ? (
              <span>
                <b> {option.title}</b> (Biome)
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
            className={currentValue ? "filterUsed" : ""}
            label={`${label}`}
            size="small"
          />
        )}
        style={{ display: "table-cell", verticalAlign: "middle" }}
      />
    );
  }
}

export default MapSearchBar;

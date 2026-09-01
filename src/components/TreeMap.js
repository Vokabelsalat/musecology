import React, { Component } from "react";
import "../utils/utils";
//import TreeMapHelper from "./TreeMapHelper";
import TreeMapHelper from "./TreeMapHelper";

class TreeMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      data: this.props.data,
      selected: null,
      filter: this.props.filter,
      setFilter: this.props.setFilter
    };
  }

  componentDidMount() {
    TreeMapHelper.draw({
      id: "woodTreeMap",
      data: this.state.data,
      setSelected: this.setSelected.bind(this),
      selected: this.state.selected,
      filter: this.state.filter,
      setFilter: this.props.setFilter,
      kingdom: this.props.kingdom,
      genus: this.props.genus,
      species: this.props.species,
      familia: this.props.familia,
      colorBlind: this.props.colorBlind,
      getPlantIcon: this.props.getPlantIcon,
      getAnimalIcon: this.props.getAnimalIcon
    });
  }

  setSelected(sel) {
    this.setState({ selected: sel });
  }

  componentDidUpdate(newProps) {
    if (
      this.props.kingdom !== newProps.kingdom ||
      this.props.familia !== newProps.familia ||
      this.props.genus !== newProps.genus ||
      this.props.species !== newProps.species ||
      this.props.colorBlind !== newProps.colorBlind ||
      JSON.stringify(this.props.data) !== JSON.stringify(newProps.data)
    ) {
      TreeMapHelper.draw({
        id: "woodTreeMap",
        data: this.props.data,
        setSelected: this.setSelected.bind(this),
        selected: this.state.selected,
        filter: newProps.filter,
        setFilter: this.props.setFilter,
        kingdom: this.props.kingdom,
        genus: this.props.genus,
        species: this.props.species,
        familia: this.props.familia,
        colorBlind: this.props.colorBlind,
        getPlantIcon: this.props.getPlantIcon,
        getAnimalIcon: this.props.getAnimalIcon
      });
    }
  }

  setNodeAsFilter(node) {
    let filter = {};
    switch (node.key) {
      case "Kingdom":
        filter["kingdom"] = [node.value];
        filter["familia"] = null;
        filter["genus"] = null;
        filter["species"] = null;
        break;
      case "Family":
        filter["familia"] = [node.value];
        filter["genus"] = null;
        filter["species"] = null;
        break;
      case "Genus":
        filter["genus"] = [node.value];
        filter["species"] = null;
        break;
      case "Species":
        filter["species"] = [node.value];
        break;
    }

    this.state.setFilter(filter);
  }

  render() {
    /* let border = "1px solid gray";
    if (
      this.props.kingdom ||
      this.props.genus ||
      this.props.species ||
      this.props.familia
    ) {
      border = "3px solid var(--highlightpurple)";
    } */

    return (
      <div
        id={this.state.id}
        style={{
          display: "inline-block",
          border: "none",
          marginLeft: "0px",
          marginRight: "0px"
        }}
      >
        {this.props.kingdom ? (
          <div
            className="treeMapHeader"
            style={{
              width: "100%",
              height: "auto",
              display: "grid",
              columnGap: "5px",
              rowGap: "5px",
              gridTemplateColumns:
                "min-content min-content min-content min-content min-content",
              padding: "3px",
              gridTemplateRows: "15px 20px"
            }}
          >
            <div
              id="treeMapBackButtonWrapper"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 1,
                gridRowStart: 1,
                gridRowEnd: "span 2",
                alignSelf: "center",
                justifySelf: "center"
              }}
            >
              <svg height="25" width="55"></svg>
            </div>
            {[
              { key: "Kingdom", value: this.props.kingdom },
              { key: "Family", value: this.props.familia },
              { key: "Genus", value: this.props.genus },
              { key: "Species", value: this.props.species }
            ]
              .filter((e) => (e.value ? true : false))
              .map((e, i) => {
                return (
                  <div
                    key={"treeMapHeadlineElement" + i}
                    className="treeMapHeadlineElement"
                    style={{
                      gridColumnStart: i + 2,
                      gridColumnEnd: i + 2,
                      gridRowStart: 1,
                      gridRowEnd: "span 2",
                      borderLeft: "2px solid gray",
                      padding: "0 5px",
                      cursor: "pointer"
                    }}
                    onClick={(cE) => {
                      this.setNodeAsFilter(e);
                    }}
                  >
                    <div key={e.key}>{e.key}</div>
                    <div
                      style={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        fontStyle: "italic"
                      }}
                    >
                      {e.value}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          []
        )}
        <div id={"woodTreeMap"} style={{ display: "inline-block" }}></div>
      </div>
    );
  }
}

export default TreeMap;

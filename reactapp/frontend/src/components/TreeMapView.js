import React, { Component } from "react";
import TreeMap from "./TreeMap";
import { getThreatColor } from "../utils/utils";
import { getCitesColor, getIucnColor } from "../utils/timelineUtils";

class TreeMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      data: this.props.data
    };

    console.log("INIT TREEMAP", this.state.id);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data)) {
      this.setState({ data: this.props.data });
    }
  }

  render() {
    /* let maxValue = 0;
        for (let cat of Object.values(this.state.data)) {
            maxValue = Math.max(maxValue, ...cat.map(e => e.hasOwnProperty("group") ? e.sum : e.value));
        } */

    /* let showIcons = this.state.showIcons; */

    return (
      <div id={this.state.id} style={{ display: "inline-block" }}>
        <TreeMap
          id="woodTreeMap"
          data={this.state.data}
          filter={this.props.filter}
          setFilter={this.props.setFilter}
        ></TreeMap>
      </div>
    );
  }
}

export default TreeMapView;

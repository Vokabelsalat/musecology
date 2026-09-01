import { tickStep } from "d3";
import React, { Component } from "react";
import {
  iucnColors,
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";
import { dangerColorMap } from "../utils/utils";
import PieChartHelper from "./PieChartHelper";

class CenterPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "CenterPieChartVis",
      data: this.props.data,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      treeThreatType: this.props.treeThreatType,
      lastSpeciesSigns: this.props.lastSpeciesSigns
    };
  }

  componentDidMount() {
    PieChartHelper.draw({
      id: this.state.id,
      data: this.props.data,
      getTreeThreatLevel: this.props.getTreeThreatLevel,
      treeThreatType: this.props.treeThreatType,
      colorBlind: this.props.colorBlind,
      lastSpeciesSigns: this.props.lastSpeciesSigns
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.treeThreatType !== prevProps.treeThreatType ||
      this.props.colorBlind !== prevProps.colorBlind ||
      JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data) ||
      JSON.stringify(this.props.lastSpeciesSigns) !==
        JSON.stringify(prevProps.lastSpeciesSigns)
    ) {
      PieChartHelper.draw({
        id: this.state.id,
        data: this.props.data,
        getTreeThreatLevel: this.props.getTreeThreatLevel,
        treeThreatType: this.props.treeThreatType,
        colorBlind: this.props.colorBlind,
        lastSpeciesSigns: this.props.lastSpeciesSigns
      });
    }
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div id={this.state.id} />
      </div>
    );
  }
}

export default CenterPieChart;

import React, { Component } from "react";
import * as d3 from "d3";

import {
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";

import Switch from "@mui/material/Switch";

class Legend extends Component {
  constructor(props) {
    super(props);

    this.setFilter = props.setFilter;

    this.state = {
      categoryFilter: null
    };
  }

  componentDidMount() {}

  onChange() {
    this.props.setTreeThreatType(!this.props.treeThreatType);
  }

  tooltipMove(event) {
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("left", event.pageX + 25 + "px")
      .style("top", event.pageY + 25 + "px");
  }

  getTooltip(element) {
    let text = "";
    switch (element.dataset.info) {
      case "CITES":
        text = citesAssessment.get(element.dataset.key).getName();
        break;
      case "IUCN":
        text = iucnAssessment.get(element.dataset.key).getName();
        break;
      case "BGCI":
        text = bgciAssessment.get(element.dataset.key).getName();
        break;
      default:
        break;
    }

    return text;
  }

  tooltip(event, highlight) {
    let tooltip = d3.select(".tooltip");

    if (highlight) {
      tooltip
        .html(this.getTooltip(event.target))
        .style("display", "block")
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY + 25 + "px");
    } else {
      tooltip.style("display", "none");
    }
  }

  setCategoryFilter(type, cat) {
    if (
      this.state.categoryFilter &&
      this.state.categoryFilter.type === type &&
      this.state.categoryFilter.cat === cat
    ) {
      this.setFilter({ category: null });
      this.setState({ categoryFilter: null });
    } else {
      this.setFilter({ category: { type, cat } });
      this.setState({ categoryFilter: { type, cat } });
    }
  }

  render() {
    let setTreeThreatType = this.props.setTreeThreatType.bind(this);
    let treeThreatType = this.props.treeThreatType;
    let onChange = this.onChange.bind(this);
    let categoryFilter = this.state.categoryFilter;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            height: "fit-content",
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            gridTemplateRows: "auto auto",
            gap: "5px"
          }}
        >
          <div
            style={{
              gridColumnStart: 1,
              gridColumnEnd: 1,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              alignSelf: "center",
              justifySelf: "center",
              opacity: !treeThreatType ? 0.5 : 1.0
            }}
          >
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              CITES
              <a
                href="https://cites.org/eng/app/index.php"
                target="_blank"
                style={{ textDecoration: "none" }}
                rel="noreferrer"
              >
                <div className="infoI">i</div>
              </a>
            </div>
            {citesAssessment.getSortedLevels().map((e) => {
              let style = {
                display: "inline-block",
                minWidth: "40px",
                height: "15px",
                lineHeight: "15px",
                fontSize: "smaller",
                border:
                  categoryFilter &&
                  categoryFilter.type === "cites" &&
                  categoryFilter.cat === e
                    ? "2px solid var(--highlightpurple)"
                    : "none",
                cursor: treeThreatType ? "pointer" : "default",
                backgroundColor: citesAssessment
                  .get(e)
                  .getColor(this.props.colorBlind),
                color: citesAssessment
                  .get(e)
                  .getForegroundColor(this.props.colorBlind),
                textAlign: "center"
              };
              return (
                <div
                  key={e}
                  style={style}
                  data-info="CITES"
                  data-key={e}
                  onClick={(event) => {
                    if (treeThreatType) {
                      this.setCategoryFilter("cites", e);
                    }
                  }}
                  onMouseEnter={(e) => this.tooltip(e, true)}
                  onMouseLeave={(e) => this.tooltip(e, false)}
                  onMouseMove={(e) => this.tooltipMove(e)}
                >
                  {e}
                </div>
              );
            })}
          </div>
          <div
            style={{
              gridColumnStart: 2,
              gridColumnEnd: 2,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              alignSelf: "center",
              justifySelf: "center",
              fontWeight: treeThreatType ? "bold" : "normal",
              fontSize: "larger",
              opacity: !treeThreatType ? 0.5 : 1.0
            }}
          >
            Trade
          </div>
          <div
            style={{
              gridColumnStart: 3,
              gridColumnEnd: 3,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              alignSelf: "center",
              justifySelf: "center"
            }}
          >
            <div className="switchWrapper">
              <Switch
                onChange={onChange}
                checked={!treeThreatType}
                color="secondary"
              />
            </div>
          </div>
          <div
            style={{
              gridColumnStart: 4,
              gridColumnEnd: 4,
              gridRowStart: 1,
              gridRowEnd: "span 2",
              alignSelf: "center",
              justifySelf: "center",
              fontWeight: !treeThreatType ? "bold" : "normal",
              fontSize: "larger",
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            Threat
          </div>
          <div
            style={{
              gridColumnStart: 5,
              gridColumnEnd: 5,
              gridRowStart: 1,
              gridRowEnd: 1,
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              IUCN Red List
              <a
                href="https://www.iucnredlist.org/about/regional"
                target="_blank"
                style={{ textDecoration: "none" }}
                rel="noreferrer"
              >
                <div className="infoI">i</div>
              </a>
            </div>
            <div>
              {iucnAssessment.getSortedLevels().map((e, i) => {
                let width;
                if (["LR/cd"].includes(e)) {
                  width = "50px";
                } else {
                  width = "35px";
                }

                let style = {
                  display: "inline-block",
                  minWidth: width,
                  height: "15px",
                  lineHeight: "15px",
                  fontSize: "smaller",
                  cursor: treeThreatType ? "default" : "pointer",
                  border:
                    categoryFilter &&
                    categoryFilter.type === "iucn" &&
                    categoryFilter.cat === e
                      ? "2px solid var(--highlightpurple)"
                      : "none",
                  backgroundColor: iucnAssessment
                    .get(e)
                    .getColor(this.props.colorBlind),
                  color: iucnAssessment
                    .get(e)
                    .getForegroundColor(this.props.colorBlind),
                  textAlign: "center"
                };
                return (
                  <div
                    key={e}
                    style={style}
                    data-info="IUCN"
                    data-key={e}
                    onClick={(event) => {
                      if (!treeThreatType) {
                        this.setCategoryFilter("iucn", e);
                      }
                    }}
                    onMouseEnter={(e) => this.tooltip(e, true)}
                    onMouseLeave={(e) => this.tooltip(e, false)}
                    onMouseMove={(e) => this.tooltipMove(e)}
                  >
                    {e}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              gridColumnStart: 5,
              gridColumnEnd: 5,
              gridRowStart: 2,
              gridRowEnd: 2,
              opacity: treeThreatType ? 0.5 : 1.0
            }}
          >
            {bgciAssessment.getSortedLevels().map((e) => {
              let width;
              if (["EX"].includes(e)) {
                width = "105px";
              } else if (["TH"].includes(e)) {
                width = "175px";
              } else if (["PT"].includes(e)) {
                width = "85px";
              } else {
                width = "35px";
              }

              let style = {
                display: "inline-block",
                minWidth: width,
                height: "15px",
                lineHeight: "15px",
                fontSize: "smaller",
                cursor: treeThreatType ? "default" : "pointer",
                border:
                  categoryFilter &&
                  categoryFilter.type === "bgci" &&
                  categoryFilter.cat === e
                    ? "2px solid var(--highlightpurple)"
                    : "none",
                backgroundColor: bgciAssessment
                  .get(e)
                  .getColor(this.props.colorBlind),
                color: bgciAssessment
                  .get(e)
                  .getForegroundColor(this.props.colorBlind),
                textAlign: "center"
              };
              return (
                <div
                  key={e}
                  style={style}
                  data-info="BGCI"
                  data-key={e}
                  onClick={(event) => {
                    if (!treeThreatType) {
                      this.setCategoryFilter("bgci", e);
                    }
                  }}
                  onMouseEnter={(e) => this.tooltip(e, true)}
                  onMouseLeave={(e) => this.tooltip(e, false)}
                  onMouseMove={(e) => this.tooltipMove(e)}
                >
                  {e}
                </div>
              );
            })}
            <div style={{ textAlign: "center", lineHeight: "1.7em" }}>
              BGCI ThreatSearch
              <a
                href="https://www.bgci.org/resources/bgci-databases/threatsearch/"
                target="_blank"
                style={{ textDecoration: "none" }}
                rel="noreferrer"
              >
                <div className="infoI">i</div>
              </a>
            </div>
          </div>
        </div>

        {/* < div > {this.props.zoomLevel + 1} / {this.props.maxZoomLevel + 1}</div >
                <button onClick={this.props.onZoomOut}>-</button>
                <button onClick={this.props.onZoom}>+</button> */}
        {/* <select
                    value={this.props.pieStyle}
                    onChange={(event) => {
                        this.props.onPieStyle(event.target.value);
                    }}>
                    <option value="pie">Pies</option>
                    <option value="bar">Bars</option>
                    <option value="ver">Vertical Bars</option>
                </select>
                <button style={{
                    "marginLeft": "10px"
                }} onClick={(event) => {
                    this.props.onGroupSame(!this.props.groupSame);
                }}>
                    {this.props.groupSame ? "Group Same" : "Not"}
                </button>
                <select
                    value={this.props.sortGrouped}
                    onChange={(event) => {
                        this.props.onSortGrouped(event.target.value);
                    }}
                    style={{
                        "marginLeft": "10px"
                    }}>
                    <option value="trend">Trend</option>
                    <option value="avg">Average</option>
                    <option value="quant">Quantity</option>
                </select>
                <select
                    value={this.props.heatStyle}
                    onChange={(event) => {
                        this.props.onHeatStyle(event.target.value);
                    }}
                    style={{
                        "marginLeft": "10px"
                    }}>
                    <option value="dom">Dominant</option>
                    <option value="avg">Average</option>
                    <option value="max">Max</option>
                </select> */}
      </div>
    );
  }
}

export default Legend;

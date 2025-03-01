import React, { Component } from "react";
import "../utils/utils";
import { sliderBottom, sliderTop } from "d3-simple-slider";
import * as d3 from "d3";

class TimelineScaleD3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      width: this.props.width,
      domainYears: this.props.domainYears,
      x: this.props.x,
      timeFrame: this.props.timeFrame ? this.props.timeFrame : [],
      setTimeFrame: this.props.setTimeFrame,
      bottom: this.props.bottom ? this.props.bottom : false
    };
  }

  drawTimelineScale() {
    const dataTime = d3.range(
      this.props.domainYears.minYear,
      this.props.domainYears.maxYear + 1
    );

    let year2year = d3
      .scaleLinear()
      .domain([this.props.domainYears.minYear, this.props.domainYears.maxYear])
      .range([
        0,
        this.props.x(this.props.domainYears.maxYear) -
          this.props.x(this.props.domainYears.minYear)
      ]);

    let ticks = this.props.domainYears.maxYear - this.props.domainYears.minYear;

    let sliderTime;

    if (this.props.bottom) {
      sliderTime = sliderBottom(year2year)
        .step(1)
        .tickFormat((x) => x.toString())
        .tickValues(dataTime)
        .default(
          this.props.timeFrame[1]
            ? this.props.timeFrame[1]
            : this.props.domainYears.maxYear
        )
        .on("onchange", (val) => {
          this.props.setTimeFrame([this.props.domainYears.minYear, val]);
        });
    } else {
      sliderTime = sliderTop(year2year)
        .step(1)
        .tickFormat((x) => x.toString())
        .tickValues(dataTime)
        .default(
          this.props.timeFrame[1]
            ? this.props.timeFrame[1]
            : this.props.domainYears.maxYear
        )
        .on("onchange", (val) => {
          this.props.setTimeFrame([this.props.domainYears.minYear, val]);
        });
    }

    //x(parseInt(year)) - x.bandwidth() / 2

    const sliderGroup = d3.select(`#${this.props.id}SliderGroup`);
    sliderGroup.selectAll("*").remove();

    sliderGroup.call(sliderTime);

    if (this.props.width > 0) {
      while (
        this.props.width <
        sliderGroup.selectAll(".tick > text").size() * 25
      ) {
        sliderGroup
          .selectAll(".tick > text")
          .select(function (e, i) {
            return i % 2 !== 0 ? this : null;
          })
          .remove();
      }
    }

    sliderGroup.select(".slider > .parameter-value > text").attr("y", "-16");

    /*  useEffect(() => {
      // Delete every second tick text
      while (width < sliderGroup.selectAll(".tick > text").size() * 25) {
        sliderGroup
          .selectAll(".tick > text")
          .select(function (e, i) {
            return i % 2 !== 0 ? this : null;
          })
          .remove();
      }
    }, [domainYears, width, ticks, sliderGroup]); */
  }

  componentDidMount() {
    this.drawTimelineScale();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width) {
      this.drawTimelineScale();
    }

    if (
      JSON.stringify(prevProps.domainYears) !==
      JSON.stringify(this.props.domainYears)
    ) {
      this.drawTimelineScale();
    }
  }

  render() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "145px auto",
          gridTemplateRows: "auto auto",
          width: "100%"
        }}
      >
        <div></div>
        <svg
          className={
            this.props.bottom
              ? "scaleBottom overflow-visible"
              : "overflow-visible"
          }
          id={this.state.id}
          width={this.props.width}
          height={"50px"}
        >
          <g
            id={`${this.props.id}SliderGroup`}
            transform={`translate(${this.props.x(
              this.props.domainYears.minYear /*  */
            )} ${this.props.bottom ? 0 : 40})`}
          ></g>
        </svg>
      </div>
    );
  }
}

export default TimelineScaleD3;

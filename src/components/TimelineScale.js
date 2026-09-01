import * as d3 from "d3";
import { sliderBottom, sliderTop } from "d3-simple-slider";
import { useEffect } from "react";

export default function TimelineScale(props) {
  const {
    id,
    width,
    domainYears,
    x,
    timeFrame = [],
    setTimeFrame,
    bottom = false
  } = props;

  const dataTime = d3.range(domainYears.minYear, domainYears.maxYear + 1);

  let year2year = d3
    .scaleLinear()
    .domain([domainYears.minYear, domainYears.maxYear])
    .range([0, x(domainYears.maxYear) - x(domainYears.minYear)]);

  let ticks = domainYears.maxYear - domainYears.minYear;

  let sliderTime;

  if (bottom) {
    sliderTime = sliderBottom(year2year)
      .step(1)
      .tickFormat((x) => x.toString())
      .tickValues(dataTime)
      .default(timeFrame[1] ? timeFrame[1] : domainYears.maxYear)
      .on("onchange", (val) => {
        setTimeFrame([domainYears.minYear, val]);
      });
  } else {
    sliderTime = sliderTop(year2year)
      .step(1)
      .tickFormat((x) => x.toString())
      .tickValues(dataTime)
      .default(timeFrame[1] ? timeFrame[1] : domainYears.maxYear)
      .on("onchange", (val) => {
        setTimeFrame([domainYears.minYear, val]);
      });
  }

  //x(parseInt(year)) - x.bandwidth() / 2

  const sliderGroup = d3.select(`#${id}SliderGroup`);

  sliderGroup.call(sliderTime);

  

  useEffect(() => {
    // Delete every second tick text
    while (width < sliderGroup.selectAll(".tick > text").size() * 25) {
      sliderGroup
        .selectAll(".tick > text")
        .select(function (e, i) {
          return i % 2 !== 0 ? this : null;
        })
        .remove();
    }
  }, [domainYears, width, ticks, sliderGroup]);

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
      <svg id={id} width={width} height={"50px"}>
        <g
          id={`${id}SliderGroup`}
          transform={`translate(${x(domainYears.minYear) + x.bandwidth() / 2} ${
            bottom ? 0 : 40
          })`}
        ></g>
      </svg>
    </div>
  );
}

/* var dataTime = d3.range(this.domainYears.minYear, this.domainYears.maxYear + 1);

let year2year = d3
  .scaleLinear()
  .domain([this.domainYears.minYear, this.domainYears.maxYear])
  .range([
    0,
    this.x(this.domainYears.maxYear) - this.x(this.domainYears.minYear)
  ]);

var sliderTime;

let top = -7;

this.ticks = this.domainYears.maxYear - this.domainYears.minYear;

if (this.speciesName === "scaleTop") {
  top = 40;
  sliderTime = sliderTop(year2year)
    .step(1)
    .tickFormat((x) => x.toString())
    .tickValues(dataTime)
    .default(this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear)
    .on("onchange", (val) => {
      this.setTimeFrame([this.domainYears.minYear, val]);
    });
} else {
  sliderTime = sliderBottom(year2year)
    .step(1)
    .tickFormat((x) => x.toString())
    .tickValues(dataTime)
    .default(this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear);
}

const sliderGroup = this.wrapper
  .append("svg")
  .attr(
    "width",
    this.speciesName === "scaleBottom" ? this.initWidth - 10 : this.initWidth
  )
  .attr("height", 50)
  .append("g")
  .attr(
    "transform",
    "translate(" +
      (this.margin.left +
        this.x(this.domainYears.minYear) +
        this.x.bandwidth() / 2) +
      "," +
      top +
      ")"
  );

sliderGroup.call(sliderTime);

if (this.speciesName === "scaleBottom") {
  sliderGroup.select(".slider").remove();
}

sliderGroup.select(".slider > .parameter-value > text").remove();

sliderGroup
  .select(".slider > .parameter-value > path")
  .attr("transform", "rotate(180) translate(-1, 0) scale(1.8)")
  .style("opacity", 0.0);

sliderGroup
  .select(".slider > .parameter-value > path")
  .clone()
  .attr("transform", "rotate(180) translate(-1, 0) scale(1.1)")
  .style("opacity", 1.0);

sliderGroup
  .select(".slider > .parameter-value")
  .on("mouseover", () => sliderGroup.select(".handle").style("opacity", 0.05))
  .on("mouseout", () => sliderGroup.select(".handle").style("opacity", 0.0));

// Delete every second tick text
let contentWidth = this.width;
while (contentWidth < this.ticks * 25) {
  sliderGroup
    .selectAll(".tick > text")
    .select(function (e, i) {
      return i % 2 !== 0 ? this : null;
    })
    .remove();
  this.ticks = this.ticks / 2;
}
 */

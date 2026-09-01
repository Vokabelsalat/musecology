import * as d3 from "d3";
import { sliderBottom, sliderTop } from "d3-simple-slider";

export default function TimelineScale(props) {
  const { width, domainYears, x, timeFrame = [], setTimeFrame } = props;

  const dataTime = d3.range(domainYears.minYear, domainYears.maxYear + 1);

  let year2year = d3
    .scaleLinear()
    .domain([domainYears.minYear, domainYears.maxYear])
    .range([0, x(domainYears.maxYear) - x(domainYears.minYear)]);

  let ticks = domainYears.maxYear - domainYears.minYear;

  let sliderTime = sliderTop(year2year)
    .step(1)
    .tickFormat((x) => x.toString())
    .tickValues(dataTime)
    .default(timeFrame[1] ? timeFrame[1] : domainYears.maxYear)
    .on("onchange", (val) => {
      console.log("VAL", val);
      /* this.setTimeFrame([this.domainYears.minYear, val]); */
    });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "145px auto",
        gridTemplateRows: "auto auto",
        width: "100%",
        backgroundColor: "lime"
      }}
    >
      <div></div>
      <div
        style={{
          width: "100%"
        }}
      >
        <input
          style={{
            width: "100%"
          }}
          type="range"
          min={domainYears.minYear}
          max={domainYears.maxYear}
          class="slider"
          onChange={(event) => {
            console.log("VAL", event, event.target.value);
            setTimeFrame([domainYears.minYear, parseInt(event.target.value)]);
          }}
        />
      </div>
      <div></div>
      {
        <svg width={width} height={"30px"}>
          {dataTime
            .filter((element, index) => {
              return index % 6 === 0;
            })
            .map((year) => {
              return (
                <g
                  transform={`translate(${
                    x(parseInt(year)) - x.bandwidth() / 2
                  } 20)`}
                >
                  <text>{year}</text>
                </g>
              );
            })}
        </svg>
      }
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

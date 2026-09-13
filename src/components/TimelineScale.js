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

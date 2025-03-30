import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";
import TimelineScaleD3 from "./TimelineScaleD3";
import TimelineNew from "./Timeline";

import { useState, useEffect, useRef } from "react";

import { replaceSpecialCharacters } from "../utils/utils";

import * as d3 from "d3";

export default function TimelineViewNew(props) {
  const {
    data,
    width,
    timeFrame,
    setTimeFrame,
    domainYears,
    imageLinks,
    dummyImageLinks,
    colorBlind,
    getTreeThreatLevel,
    filteredSpecies,
    setTreeMapFilter
  } = props;

  //const [x, setX] = useState(null);
  //const [timescaleWidth, setTimescaleWidth] = useState(0);

  let x = (val) => 6;

  let timescaleWidth = Math.max(width, 160) - 160;
  if (
    Number.isInteger(domainYears.minYear) &&
    Number.isInteger(domainYears.maxYear)
  ) {
    let yearDiff = domainYears.maxYear - domainYears.minYear;

    let xDomain = Array(yearDiff + 1)
      .fill()
      .map((_, i) => domainYears.minYear - 1 + i + 1);

    x = d3.scaleBand().domain(xDomain).rangeRound([0, timescaleWidth]);
  }

  const sortedKeys =
    data != null
      ? Object.keys(data)
          .filter((e) => data[e] != null)
          .sort()
      : [];
  const id = "timelineView";

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        gridTemplateColumns: "auto",
        gridTemplateRows: `min-content 1fr min-content`
      }}
    >
      {
        <TimelineScaleD3
          id={`${id}scaleTop`}
          key={`scaleToptimeline${JSON.stringify(domainYears)}`}
          data={null}
          speciesName={"scaleTop"}
          domainYears={domainYears}
          setTimeFrame={setTimeFrame}
          timeFrame={timeFrame}
          x={x}
          width={timescaleWidth}
        />
      }
      {
        <div
          style={{
            overflowY: "scroll",
            width: "fit-content",
            position: "relative",
            marginLeft: "3px"
          }}
        >
          <div
            style={{
              position: "relative"
            }}
          >
            {sortedKeys.map((e) => {
              return (
                <TimelineNew
                  id={replaceSpecialCharacters(e) + "TimelineVis"}
                  key={replaceSpecialCharacters(e) + "timeline"}
                  data={data[e]}
                  species={{
                    kingdomName: data[e]["kingdom"],
                    familyName: data[e]["family"],
                    genusName: data[e]["genus"],
                    speciesName: data[e]["species"]
                  }}
                  domainYears={domainYears}
                  getTreeThreatLevel={getTreeThreatLevel}
                  colorBlind={colorBlind}
                  timeFrame={timeFrame}
                  x={x}
                  width={timescaleWidth}
                  populationTrend={data[e].populationTrend}
                  imageLink={imageLinks[e]}
                  dummyImageLink={dummyImageLinks[e]}
                  isAnimal={data[e].isAnimal}
                  setTreeMapFilter={setTreeMapFilter}
                />
              );
            })}
            {timeFrame[1] !== undefined &&
              timeFrame[1] !== domainYears.maxYear && (
                <div
                  style={{
                    position: "absolute",
                    left: 140 + x(timeFrame[1]),
                    top: 0,
                    width: timescaleWidth - x(timeFrame[1]),
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderLeft: "2px solid var(--highlightpurple)"
                  }}
                />
              )}
          </div>
        </div>
      }
      {
        <TimelineScaleD3
          id={`${id}scaleBottom`}
          key={`scaleBottomtimeline${JSON.stringify(domainYears)}`}
          data={null}
          domainYears={domainYears}
          setTimeFrame={setTimeFrame}
          timeFrame={timeFrame}
          x={x}
          width={timescaleWidth}
          bottom={true}
        />
      }
    </div>
  );
}

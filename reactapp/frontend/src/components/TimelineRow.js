import { PatternRect } from "leaflet";
import { useEffect, useRef, useState, cloneElement } from "react";
import {
  citesAssessment,
  bgciAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import { pushOrCreate } from "../utils/utils";
import TimelineMarker from "./TimelineMarker";

export default function TimelineRow(props) {
  const { type, data, x, width, colorBlind, populationTrend } = props;

  const rowHeight = 20;

  let populationTrendColor = "transparent";
  let populationTrendIcon = "";

  switch (populationTrend) {
    case "Decreasing":
      populationTrendColor = iucnAssessment.get("EX").getColor(colorBlind);
      populationTrendIcon = "\u21D8";
      break;
    case "Increasing":
      populationTrendColor = iucnAssessment.get("LC").getColor(colorBlind);
      populationTrendIcon = "\u21D7";
      break;
    case "Stable":
      populationTrendColor = iucnAssessment.get("NT").getColor(colorBlind);
      populationTrendIcon = "\u21D2";
      break;
    case null:
      populationTrendColor = "transparent";
      populationTrendIcon = "";
      break;
    case "Unknown":
      populationTrendColor = "transparent";
      populationTrendIcon = "";
      break;
    default:
      break;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: "5px"
        }}
      >
        {type.toUpperCase()}
      </div>
      <svg height={`${rowHeight}`} width={width}>
        {data
          .sort((a, b) => {
            return parseInt(a.element.year) - parseInt(b.element.year);
          })
          .map((assessmentAndElement, index) => {
            let xVal = x(parseInt(assessmentAndElement.element.year));
            if (xVal < 0) {
              return;
            }

            return (
              <g
                key={`${assessmentAndElement.element.year}${assessmentAndElement.element.type}${assessmentAndElement.element.text}${assessmentAndElement.element.sciName}${colorBlind}`}
                transform={`translate(${xVal}, 0)`}
              >
                <TimelineMarker
                  iconWidth={Math.min(width, x.bandwidth())}
                  width={width}
                  height={rowHeight}
                  assessmentAndElement={assessmentAndElement}
                  colorBlind={colorBlind}
                />
              </g>
            );
          })}
      </svg>
      <div>
        {type === "iucn" && populationTrend !== null && (
          <>
            <div
              style={{
                height: "100%",
                width: "15px",
                display: "flex",
                backgroundColor: populationTrendColor,
                justifyContent: "center",
                fontSize: populationTrend !== "Stable" ? "17px" : "13px"
              }}
            >
              {populationTrendIcon}
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { PatternRect } from "leaflet";
import {
  useEffect,
  useRef,
  useState,
  cloneElement,
  useMemo,
  useContext
} from "react";
import {
  citesAssessment,
  bgciAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import { pushOrCreate } from "../utils/utils";
import TimelineMarker from "./TimelineMarker";
import { TooltipContext } from "./TooltipProvider";

export default function TimelineRow(props) {
  const { type, data, x, width, colorBlind, populationTrend, species, author } =
    props;

  const rowHeight = 20;

  const { setTooltip } = useContext(TooltipContext);
  const sortedData = useMemo(
    () =>
      [...data].sort((a, b) => {
        return parseInt(a.element.year) - parseInt(b.element.year);
      }),
    [data]
  );

  const [populationTrendColor, populationTrendIcon, populationTrendText] =
    useMemo(() => {
      let populationTrendColor = "transparent";
      let populationTrendIcon = "";
      let populationTrendText = "";

      switch (populationTrend) {
        case 1:
          populationTrendColor = iucnAssessment.get("EX").getColor(colorBlind);
          populationTrendIcon = "\u21D8";
          populationTrendText = "Decreasing";
          break;
        case 0:
          populationTrendColor = iucnAssessment.get("LC").getColor(colorBlind);
          populationTrendIcon = "\u21D7";
          populationTrendText = "Increasing";
          break;
        case 2:
          populationTrendColor = iucnAssessment.get("NT").getColor(colorBlind);
          populationTrendIcon = "\u21D2";
          populationTrendText = "Stable";
          break;
        case null:
          populationTrendColor = "transparent";
          populationTrendIcon = "";
          populationTrendText = "Unknown";
          break;
        case 0:
          populationTrendColor = "transparent";
          populationTrendIcon = "";
          populationTrendText = "Unknown";
          break;
        default:
          break;
      }
      return [populationTrendColor, populationTrendIcon, populationTrendText];
    }, [iucnAssessment, colorBlind, populationTrend]);

  const onMouseEnter = (event) => {
    setTooltip({
      tooltipText: `Population Trend: ${populationTrendText}`,
      tooltipMode: "text"
    });
    event.stopPropagation();
    event.preventDefault();
    // setHover(true);
  };

  const onMouseLeave = (event) => {
    setTooltip(null);
  };

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
        {sortedData.map((assessmentAndElement, index) => {
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
                  height={rowHeight - 2}
                  assessmentAndElement={assessmentAndElement}
                  colorBlind={colorBlind}
                  species={species}
                  author={author}
                />
              </g>
            );
          })}
      </svg>
      <div className={`h-[${rowHeight}px]`}>
        {type === "iucn" && populationTrend !== null && (
          <>
            <div
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{
                cursor: "default",
                height: "100%",
                width: "15px",
                display: "flex",
                backgroundColor: populationTrendColor,
                justifyContent: "center",
                alignItems: "center",
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

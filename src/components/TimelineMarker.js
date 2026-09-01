import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { OverlayContext } from "./OverlayProvider";
import { TooltipContext } from "./TooltipProvider";
import { ThreatLevel } from "../utils/timelineUtils";

function formatDate(dateString) {
  if (dateString == null) {
    return "2025";
  }
  const [year, month, day] = dateString.split("-"); // Split by "-"
  return `${day}/${month}/${year}`; // Rearrange in DD/MM/YYYY format
}

export default function TimelineMarker(props) {
  const {
    assessmentAndElement,
    colorBlind,
    width,
    height,
    iconWidth,
    species,
    author
  } = props;

  const [hover, setHover] = useState(false);

  const assessment = ThreatLevel.revive(assessmentAndElement.assessment);

  const change = assessmentAndElement.element["reasonOfChange"] ?? null;

  let year = assessmentAndElement.element.year;

  let color = assessment.getColor(colorBlind);

  const [overlay, setOverlay] = useContext(OverlayContext);
  const { setTooltip } = useContext(TooltipContext);

  const citation = useMemo(() => {
    let date = "";
    switch (assessment.assessmentType) {
      case "CITES":
        date = assessmentAndElement.element.accessDate;
        return (
          <div>{`UNEP (${
            date != null ? date.substring(0, 4) : "2025"
          }). The Species+ Website. Nairobi, Kenya. Compiled by UNEP-WCMC, Cambridge, UK. Available at: www.speciesplus.net. Accessed on ${formatDate(
            date
          )}.`}</div>
        );
      case "BGCI":
        date = assessmentAndElement.element.accessDate;
        return (
          <div>{`BGCI. ${
            date != null ? date.substring(0, 4) : "2025"
          }. ThreatSearch online database. Botanic Gardens Conservation International. Richmond, UK. Available at https://tools.bgci.org/threat_search.php. Accessed on ${formatDate(
            date
          )}.`}</div>
        );
      case "IUCN":
        return (
          <div>
            {`${assessmentAndElement.element.cite} `}
            <a target="_blank" href={assessmentAndElement.element.url}>
              {assessmentAndElement.element.url}
            </a>
          </div>
        );
      default:
        break;
    }
  }, [assessmentAndElement, assessment]);

  const marker = useMemo(() => {
    if (assessment.assessmentType === "IUCN") {
      if (change != null) {
        if (change === "N" || change === "E") {
          return (
            <ellipse
              cx={iconWidth / 2}
              cy={height / 2 + 0.5}
              rx={iconWidth / 2}
              ry={height / 2}
              stroke={hover ? "black" : color}
              strokeWidth={"2"}
              fill={change === "N" ? color : "white"}
            />
          );
        }
      } else {
        return (
          <rect
            height={height + 1}
            width={4}
            x={0}
            y={0}
            fill={color}
            stroke={hover ? "black" : null}
          />
        );
      }
    }
    return (
      <path
        d={`M 0 0 L ${iconWidth} ${height / 2} L 0 ${height} z`}
        fill={color}
        stroke={hover ? "black" : null}
      />
    );
  }, [hover, change, assessment, color, height, iconWidth]);

  return (
    <g
      onClick={(e) => {
        setOverlay(
          <div className="max-w-[80vw]">
            <pre className="w-full text-wrap">
              {JSON.stringify(assessmentAndElement.element, null, 2)}
            </pre>
            {citation}
          </div>
        );
      }}
      onMouseEnter={(event) => {
        setHover(true);
        setTooltip({
          tooltipText: {
            ...assessmentAndElement,
            species: species,
            author: author
          },
          tooltipMode: "assessment"
        });
        event.stopPropagation();
        event.preventDefault();
      }}
      onMouseLeave={(event) => {
        setHover(false);
        setTooltip("", { x: event.pageX + 15, y: event.pageY + 15 });
      }}
      style={{ cursor: "zoom-in" }}
    >
      <rect
        height={4}
        width={width}
        x={0}
        y={height / 2 - 2}
        fill={color}
        stroke={hover ? "black" : null}
      />
      {marker}
    </g>
  );
}

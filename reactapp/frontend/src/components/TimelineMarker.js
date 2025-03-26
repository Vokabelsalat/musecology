import { useCallback, useContext, useMemo, useState } from "react";
import { OverlayContext } from "./OverlayProvider";
import { TooltipContext } from "./TooltipProvider";
import { ThreatLevel } from "../utils/timelineUtils";

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
          <pre>{JSON.stringify(assessmentAndElement.element, null, 2)}</pre>
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

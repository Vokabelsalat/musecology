import { useEffect, useRef, useState } from "react";
import {
  calculatePath,
  describeArc,
  calcMidPointOfArc
} from "../utils/orchestraUtils";
import InstrumentGroupIcon from "./InstrumentGroupIcon";
import OrchestraThreatPieChart from "./OrchestraThreatPieChart";
import InstrumentThreatPieChart from "./InstrumentThreatPieChart";
import { replaceSpecialCharacters } from "../utils/utils";

const positioning = {
  Strings: {
    textOffset: "50%",
    threatOffset: -0.5,
    threatVerticalOffset: 8,
    textVerticalOffset: 7,
    textAlign: "middle"
  },
  Woodwinds: { textOffset: "23%", threatOffset: 0.14, textAlign: "start" },
  Percussion: { textOffset: "40%", threatOffset: 0.3, textAlign: "start" },
  Brasses: { textOffset: "25%", threatOffset: 0.15, textAlign: "start" },
  Plucked: { textOffset: "35%", threatOffset: 0.25, textAlign: "start" },
  Keyboard: { textOffset: "30%", threatOffset: 0.2, textAlign: "start" }
};

export default function OrchestraInstrumentSlice(props) {
  const {
    id,
    position,
    arcOptions,
    width,
    groupName,
    instrument,
    angle,
    instruments,
    species,
    getThreatLevel,
    threatType,
    colorBlind,
    setInstrument,
    isSelected = false,
    showThreatDonuts = true
  } = props;

  const pathString = calculatePath(position.x, position.y, arcOptions);

  const [hightlight, setHighlight] = useState(false);

  const textPathString = describeArc(
    position.x,
    position.y,
    width +
      (positioning[groupName].textVerticalOffset
        ? positioning[groupName].textVerticalOffset
        : 0),
    arcOptions.start,
    arcOptions.end,
    1,
    false
  );

  const pointForThreatPie = calcMidPointOfArc(
    position.x,
    position.y,
    width -
      (positioning[groupName].threatVerticalOffset
        ? positioning[groupName].threatVerticalOffset
        : 0),
    arcOptions.start,
    arcOptions.end,
    positioning[groupName].threatOffset
  );

  return (
    <g
      onMouseEnter={() => {
        setHighlight(true);
      }}
      onMouseLeave={() => {
        setHighlight(false);
      }}
      onClick={(e) => {
        setInstrument(instrument);
        e.stopPropagation();
      }}
    >
      <path
        key={`instrumentArc${instrument}`}
        fill="transparent"
        stroke={hightlight || isSelected ? "purple" : "transparent"}
        strokeWidth={"1px"}
        d={pathString}
      />
      <path
        id={`pathForInstrumentText${id}${instrument}`}
        key={`pathForInstrumentText${id}${instrument}`}
        fill="none"
        d={textPathString}
      ></path>
      <text
        width={arcOptions.width}
        id={`${id}${instrument}text`}
        key={`${id}${instrument}text`}
        className="text"
        style={{ opacity: 1 }}
      >
        <textPath
          className="textonpath noselect"
          href={`#pathForInstrumentText${id}${instrument}`}
          fontSize="7"
          textAnchor={positioning[groupName].textAlign}
          startOffset={positioning[groupName].textOffset}
          id={`textPath${id}${instrument}`}
          key={`textPath${id}${instrument}`}
          style={{ dominantBaseline: "central" }}
        >
          {instrument === "Horn, trumpet, trombone, bass tuba" ? (
            <>
              <tspan key="HornTrumpetText" dy="-0.5em">
                Horn, trumpet,
              </tspan>
              <tspan key="TrombineBassTubaText" x="0" dy="1.5em">
                trombone, bass tuba
              </tspan>
            </>
          ) : (
            <>{instrument}</>
          )}
        </textPath>
      </text>

      {showThreatDonuts && (
        <InstrumentThreatPieChart
          key={`instrumentThreatPie${id}${replaceSpecialCharacters(
            instrument
          )}`}
          id={`instrumentThreatPie${id}${replaceSpecialCharacters(instrument)}`}
          instrument={instrument}
          angle={angle}
          instruments={instruments}
          species={species}
          getThreatLevel={getThreatLevel}
          threatType={threatType}
          colorBlind={colorBlind}
          style={{ pointerEvents: "none" }}
          position={pointForThreatPie}
          showThreatDonuts={showThreatDonuts}
        />
      )}
    </g>
  );
}

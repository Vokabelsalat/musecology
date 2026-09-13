import { useState } from "react";
import {
  calcMidPointOfArc,
  calculatePath,
  describeArc
} from "../utils/orchestraUtils";
import { replaceSpecialCharacters } from "../utils/utils";
import InstrumentThreatPieChart from "./InstrumentThreatPieChart";

const positioning = {
  Strings: {
    textOffset: "50%",
    threatVerticalOffset: 8,
    textVerticalOffset: 7,
    threatOffset: -0.5,
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
    groupSpecies,
    getThreatLevel,
    threatType,
    colorBlind,
    setInstrument,
    setInstrumentGroup,
    setInstrumentPart,
    setHoveredSpecies,
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
        setHoveredSpecies?.(species[instrument] ?? []);
      }}
      onMouseLeave={() => {
        setHighlight(false);
        setHoveredSpecies?.(groupSpecies);
      }}
      onClick={(e) => {
        setInstrumentGroup?.(groupName);
        setInstrument(instrument);
        setInstrumentPart?.(null);
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
          {instrument ===
          "Violin bow| Viola bow| Cello bow| Double bass bow" ? (
            <>
              <tspan key="HornTrumpetText" dy="-0.5em">
                String instrument bow
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

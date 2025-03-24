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
import OrchestraInstrumentSlice from "./OrchestraInstrumentSlice";

const positioning = {
  Strings: { textOffset: "50%", threatOffset: 0.5, textAlign: "middle" },
  Woodwinds: { textOffset: "23%", threatOffset: 0.14, textAlign: "start" },
  Percussion: { textOffset: "40%", threatOffset: 0.3, textAlign: "start" },
  Brasses: { textOffset: "25%", threatOffset: 0.15, textAlign: "start" },
  Plucked: { textOffset: "35%", threatOffset: 0.25, textAlign: "start" },
  Keyboard: { textOffset: "30%", threatOffset: 0.2, textAlign: "start" }
};

export default function OrchestraInstruments(props) {
  const {
    id,
    groupName,
    position,
    getThreatLevel,
    colorBlind,
    instruments,
    species,
    acrOptions,
    setInstrument,
    isSelected = false,
    selectedInstrument = null,
    showThreatDonuts = true
  } = props;

  const [hightlight, setHighlight] = useState(false);

  const angle =
    (acrOptions.start + (acrOptions.end - acrOptions.start) / 2 - 360) % 180;

  const amountOfInstruments = instruments.length + 1;
  const newStrokeWidth = acrOptions.strokeWidth / amountOfInstruments;
  const startRadius =
    acrOptions.width + acrOptions.strokeWidth / 2 - newStrokeWidth / 2;

  const pathString = calculatePath(position.x, position.y, {
    ...acrOptions,
    strokeWidth: newStrokeWidth - 1,
    width: startRadius
  });

  const textPathForHeading = describeArc(
    position.x,
    position.y,
    startRadius,
    acrOptions.start,
    acrOptions.end,
    1,
    false
  );

  return (
    <>
      <path
        id={`pathIGWrapper${id}${groupName}`}
        fill="none"
        strokeWidth="1px"
        stroke={isSelected && selectedInstrument === null ? "purple" : "gray"}
        d={pathString}
      ></path>
      <path
        id={`pathIGHeading${id}${groupName}`}
        fill="none"
        strokeWidth="1px"
        d={textPathForHeading}
      ></path>
      <text
        width={acrOptions.width}
        id={`${groupName}textHeading`}
        className="text"
        style={{ opacity: 1 }}
      >
        <textPath
          className="textonpath noselect"
          href={`#pathIGHeading${id}${groupName}`}
          fontSize="10"
          textAnchor="middle"
          startOffset="50%"
          id={`textPathHeading${id}${groupName}`}
          style={{ dominantBaseline: "central" }}
        >
          {groupName}
        </textPath>
      </text>
      {instruments.map((instrument, index) => {
        const tmpWidth = startRadius - newStrokeWidth * (index + 1);
        const tmpOptions = {
          ...acrOptions,
          strokeWidth: newStrokeWidth - 1,
          width: tmpWidth,
          start: acrOptions.start,
          end: acrOptions.end
        };

        return (
          <OrchestraInstrumentSlice
            id={replaceSpecialCharacters(
              `orchestraInstrumentSlice${id}${instrument}`
            )}
            key={replaceSpecialCharacters(
              `orchestraInstrumentSlice${id}${instrument}`
            )}
            position={position}
            arcOptions={tmpOptions}
            width={tmpWidth}
            groupName={groupName}
            instrument={instrument}
            isSelected={instrument === selectedInstrument}
            angle={angle}
            instruments={instruments}
            species={species}
            getThreatLevel={getThreatLevel}
            colorBlind={colorBlind}
            setInstrument={setInstrument}
            showThreatDonuts={showThreatDonuts}
          />
        );
      })}
    </>
  );
}

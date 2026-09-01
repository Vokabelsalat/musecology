import { useEffect, useRef, useState } from "react";
import {
  polarToCartesian,
  describeArc,
  calculatePath
} from "../utils/orchestraUtils";
import InstrumentGroupIcon from "./InstrumentGroupIcon";
import OrchestraThreatPieChart from "./OrchestraThreatPieChart";
import OrchestraGroupContent from "./OrchestraGroupContent";
import OrchestraInstruments from "./OrchestraInstruments";

const positionsToPathString = {
  0: { width: 190, strokeWidth: 130, start: 305 - 1, end: 270 },
  1: { width: 190, strokeWidth: 130, start: 340 - 1, end: 305 },
  2: { width: 190, strokeWidth: 130, start: 380, end: 340 },
  3: { width: 190, strokeWidth: 130, start: 415, end: 380 + 1 },
  4: { width: 190, strokeWidth: 130, start: 450, end: 415 + 1 },
  5: { width: 65, strokeWidth: 114, start: 90, end: 270, widthOffset: 110 }
};

export default function OrchestraGroup(props) {
  const {
    id,
    groupName,
    position,
    selected,
    setZoom,
    getThreatLevel,
    threatType,
    colorBlind,
    instruments,
    species,
    setInstrument,
    setInstrumentGroup,
    setInstrumentPart,
    positionID,
    instrument
  } = props;

  const ref = useRef(null);
  const iconTextRef = useRef(null);
  const threatTextRef = useRef(null);

  const [highlight, setHighlight] = useState(false);

  const pathString = calculatePath(
    position.x,
    position.y,
    positionsToPathString[positionID.toString()]
  );

  let acrOptions = positionsToPathString[positionID.toString()];

  useEffect(() => {
    if (ref) {
      if (ref.current && selected) {
        setZoom(ref.current.getBBox());
      }
    }
  }, [selected]);

  return (
    <>
      <g
        onClick={() => {
          /*  if (ref) {
            if (ref.current) {
              setZoom(ref.current.getBBox());
            }
          } */
          setInstrumentGroup(groupName);
          setInstrument(null);
          setInstrumentPart(null);
        }}
        onMouseEnter={() => {
          setHighlight(true);
        }}
        onMouseLeave={() => {
          setHighlight(false);
        }}
        className="orchestraGroupGroup"
      >
        <path
          ref={ref}
          fill={"white"}
          stroke={highlight ? "purple" : "gray"}
          strokeWidth={highlight ? "1px" : "1px"}
          d={pathString}
        ></path>
        {selected ? (
          <OrchestraInstruments
            {...props}
            acrOptions={acrOptions}
            isSelected={selected}
            selectedInstrument={instrument}
            id={`${id}OrchestraInstruments`}
          />
        ) : (
          <OrchestraGroupContent
            {...props}
            id={`${id}GroupContent`}
            acrOptions={acrOptions}
          />
        )}
      </g>
    </>
  );
}

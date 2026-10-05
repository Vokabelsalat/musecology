import { useEffect, useRef, useState } from "react";
import { calculatePath } from "../utils/orchestraUtils";
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
    species,
    setInstrument,
    setInstrumentGroup,
    setInstrumentPart,
    positionID,
    instrument,
    instruments,
    families = {},
    instrumentFamily = null,
    setInstrumentFamily,
    setHoveredSpecies
  } = props;
  const groupSpecies = [...new Set(Object.values(species).flat())];

  const familyNames = Object.keys(families)
    .filter((family) =>
      families[family].some((name) => instruments.includes(name))
    )
    .sort();
  const activeFamily =
    instrumentFamily ??
    (instrument
      ? familyNames.find((family) => families[family].includes(instrument))
      : null) ??
    null;

  const getFamilySpecies = (family) => [
    ...new Set(families[family].flatMap((name) => species[name] ?? []))
  ];

  let ringProps = { instruments, groupSpecies };
  if (familyNames.length > 0 && activeFamily === null) {
    ringProps = {
      instruments: familyNames,
      species: Object.fromEntries(
        familyNames.map((family) => [family, getFamilySpecies(family)])
      ),
      groupSpecies,
      selectedInstrument: null,
      onSelectItem: (family) => {
        setInstrumentFamily?.(family);
        setInstrument(null);
        setInstrumentPart(null);
      }
    };
  } else if (activeFamily !== null && families[activeFamily]) {
    ringProps = {
      instruments: families[activeFamily].filter((name) =>
        instruments.includes(name)
      ),
      groupSpecies: getFamilySpecies(activeFamily),
      heading: activeFamily,
      isSelected: selected && instrument == null
    };
  }

  const ref = useRef(null);

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
          setInstrumentFamily?.(null);
          setInstrument(null);
          setInstrumentPart(null);
        }}
        onMouseEnter={() => {
          setHighlight(true);
          setHoveredSpecies?.(groupSpecies);
        }}
        onMouseLeave={() => {
          setHighlight(false);
          setHoveredSpecies?.(null);
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
            {...ringProps}
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

import { TooltipContext } from "./TooltipProvider";

import { useState, useContext } from "react";

import ThreatIcon from "./ThreatIcon";

export default function TimelineHeader(props) {
  const { species, leftColor, rightColor, isAnimal, setTreeMapFilter } = props;

  const { speciesName, kingdomName, familyName, genusName } = species;
  const sciName = `${genusName} ${speciesName}`;

  const [hover, setHover] = useState(false);
  const { setTooltip } = useContext(TooltipContext);

  return (
    <div
      style={{
        fontSize: "14px",
        display: "grid",
        width: "max-content",
        height: "20px",
        gridTemplateColumns: "20px auto",
        gridTemplateRows: "auto"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <ThreatIcon
          leftColor={leftColor}
          rightColor={rightColor}
          isAnimal={isAnimal}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontStyle: "italic"
        }}
      >
        <span
          style={{ fontWeight: hover ? "bold" : "normal", cursor: "pointer" }}
          /* onMouseLeave={(event) => {
            setHover(false);
            setTooltip(null);
          }} */
          onClick={() => {
            setTreeMapFilter({
              kingdom: kingdomName,
              family: familyName,
              genus: genusName,
              species: sciName
            });
          }}
        >
          {sciName}
        </span>
      </div>
    </div>
  );
}

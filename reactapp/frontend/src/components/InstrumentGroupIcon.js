import { transform } from "proj4";
import { useEffect, useRef, useState } from "react";

const groupToFileName = {
  Strings: "/assets/strings2.svg",
  Plucked: "/assets/plucked2.svg",
  Percussion: "/assets/percussion2.svg",
  Keyboard: "/assets/keyboard2.svg",
  Brasses: "/assets/brasses2.svg",
  Woodwinds: "/assets/woodwinds2.svg"
};

export default function InstrumentGroupIcon(props) {
  const { group, position, angle } = props;

  const fileName = groupToFileName[group];

  let x = position.x;
  let y = position.y;
  let cx = 25 / 2;
  let cy = 25 / 2;

  const transformString =
    "translate(" +
    x +
    " " +
    y +
    ") rotate(" +
    angle +
    ") translate(" +
    -cx +
    " " +
    -cy +
    ")";

  return (
    <foreignObject transform={transformString} width={25} height={25}>
      <div
        style={{
          width: "25px",
          height: "25px"
        }}
      >
        <img
          style={{ width: "auto", height: "auto" }}
          src={`${fileName}`}
        ></img>
      </div>
    </foreignObject>
  );
}

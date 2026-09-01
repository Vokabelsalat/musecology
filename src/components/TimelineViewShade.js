import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";

export default function TimelineViewShade(props) {
  const { x, width } = props;

  return (
    <div
      style={{
        position: "absolute",
        width: "50%",
        height: "100%",
        top: 0,
        left: 140,
        backgroundColor: "rgba(255, 255, 255, 0.2)"
      }}
    ></div>
  );
}

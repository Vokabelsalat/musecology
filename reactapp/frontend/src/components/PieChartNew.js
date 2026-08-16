import { useEffect } from "react";
import PieChartHelper from "./PieChartHelper";
import { nanoid } from "nanoid";

export default function PieChartNew(props) {
  const {
    id = "centerPieChart",
    data,
    getThreatLevel,
    threatType,
    colorBlind,
    size = 70,
    showThreatDonuts = true
  } = props;

  useEffect(() => {
    PieChartHelper.draw({
      id: id,
      data: data,
      getTreeThreatLevel: getThreatLevel,
      treeThreatType: threatType,
      colorBlind: colorBlind,
      width: size,
      height: size,
      showThreatDonuts: showThreatDonuts
    });
  }, [
    id,
    data,
    getThreatLevel,
    threatType,
    colorBlind,
    size,
    showThreatDonuts
  ]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div id={id} />
    </div>
  );
}

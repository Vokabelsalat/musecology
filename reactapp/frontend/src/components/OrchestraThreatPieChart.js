import { transform } from "proj4";
import { useMemo } from "react";
import PieChartNew from "./PieChartNew";
import { replaceSpecialCharacters } from "../utils/utils";

export default function OrchestraThreatPieChart(props) {
  const {
    id,
    group,
    position,
    angle,
    instruments,
    species,
    colorBlind,
    threatType,
    getThreatLevel,
    showThreatDonuts = true
  } = props;

  const width = 75;
  const height = 75;

  const processedSpecies = useMemo(() => {
    let tmpData = {};
    for (const spec of Object.values(species).flat()) {
      tmpData[spec] = {};
    }
    return tmpData;
  }, [species]);

  let x = position.x;
  let y = position.y;
  let cx = width / 2;
  let cy = height / 2;

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
    <foreignObject transform={transformString} width={width} height={height}>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        {
          <PieChartNew
            id={`${replaceSpecialCharacters(id)}ThreatPie`}
            data={processedSpecies}
            getThreatLevel={getThreatLevel}
            threatType={threatType}
            colorBlind={colorBlind}
            size={45}
            showThreatDonuts={showThreatDonuts}
          />
        }
      </div>
    </foreignObject>
  );
}

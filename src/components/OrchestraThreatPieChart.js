import { useMemo } from "react";
import ThreatDonut from "./ThreatDonut";

export default function OrchestraThreatPieChart(props) {
  const {
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

  const width = 40;
  const height = 40;

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
  let cy = height / 1.2;

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
          <ThreatDonut
            data={processedSpecies}
            getThreatLevel={getThreatLevel}
            threatType={threatType}
            colorBlind={colorBlind}
            size={40}
            showThreatDonuts={showThreatDonuts}
          />
        }
      </div>
    </foreignObject>
  );
}

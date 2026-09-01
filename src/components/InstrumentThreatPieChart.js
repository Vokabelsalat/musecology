import { transform } from "proj4";
import { useMemo } from "react";
import PieChartNew from "./PieChartNew";
import { replaceSpecialCharacters } from "../utils/utils";

export default function InstrumentThreatPieChart(props) {
  const {
    id,
    instrument,
    angle,
    instruments,
    species,
    colorBlind,
    threatType,
    getThreatLevel,
    position,
    showThreatDonuts = true
  } = props;

  const width = 12;
  const height = 12;

  const processedSpecies = useMemo(() => {
    let tmpData = {};
    for (const spec of species[instrument]) {
      tmpData[spec] = {};
    }
    return tmpData;
  }, [instrument, species]);

  const transformString =
    "translate(" +
    position.x +
    " " +
    position.y +
    ") rotate(" +
    angle +
    ") translate(" +
    -width / 2 +
    " " +
    -height / 2 +
    ")";

  return (
    <>
      <foreignObject transform={transformString} width={width} height={height}>
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
        >
          <PieChartNew
            id={replaceSpecialCharacters(
              `${instrument}${id}${showThreatDonuts}ThreatPie`
            )}
            key={replaceSpecialCharacters(
              `${instrument}${id}${showThreatDonuts}ThreatPie`
            )}
            data={processedSpecies}
            getThreatLevel={getThreatLevel}
            threatType={threatType}
            colorBlind={colorBlind}
            size={width}
            showThreatDonuts={showThreatDonuts}
          />
        </div>
      </foreignObject>
    </>
  );
}

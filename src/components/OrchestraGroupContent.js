import { calcMidPointOfArc, describeArc } from "../utils/orchestraUtils";
import InstrumentGroupIcon from "./InstrumentGroupIcon";
import OrchestraThreatPieChart from "./OrchestraThreatPieChart";

export default function OrchestraGroupContent(props) {
  const {
    id,
    groupName,
    position,
    getThreatLevel,
    threatType,
    colorBlind,
    instruments,
    species,
    acrOptions,
    showThreatDonuts = true
  } = props;

  const angle =
    (acrOptions.start + (acrOptions.end - acrOptions.start) / 2 - 360) % 180;
  const textPathString = describeArc(
    position.x,
    position.y,
    acrOptions.width + acrOptions.strokeWidth / 2 - 18,
    acrOptions.start,
    acrOptions.end,
    1,
    false
  );

  const pointForThreatIcon = calcMidPointOfArc(
    position.x,
    position.y,
    acrOptions.width -
      10 -
      (acrOptions.widthOffset ? acrOptions.widthOffset : 0),
    acrOptions.start,
    acrOptions.end
  );

  const pointForIcon = calcMidPointOfArc(
    position.x,
    position.y,
    acrOptions.width -
      acrOptions.strokeWidth / 2 +
      22 -
      (acrOptions.widthOffset ? acrOptions.widthOffset / 2 : 0),
    acrOptions.start,
    acrOptions.end
  );

  return (
    <>
      <path id={`pathForText${id}`} fill="none" d={textPathString}></path>
      <text
        width={acrOptions.width}
        id={`${id}text`}
        className="text"
        style={{ opacity: 1 }}
      >
        <textPath
          className="textonpath noselect"
          href={`#pathForText${id}`}
          fontSize="10"
          textAnchor="middle"
          startOffset="50%"
          id={`textPath${id}`}
          style={{ dominantBaseline: "central" }}
        >
          {groupName}
        </textPath>
      </text>
      <InstrumentGroupIcon
        key={`OrchestraGroupIcon${id}`}
        id={`${id}GroupIcon`}
        group={groupName}
        position={pointForIcon}
        angle={angle}
      />
      {showThreatDonuts && (
        <OrchestraThreatPieChart
          key={`OrchestraGroupThreatPie${id}`}
          id={`${id}OrchestraThreatPieChart`}
          group={groupName}
          position={pointForThreatIcon}
          angle={angle}
          instruments={instruments}
          species={species}
          getThreatLevel={getThreatLevel}
          threatType={threatType}
          colorBlind={colorBlind}
          style={{ pointerEvents: "none" }}
          showThreatDonuts={showThreatDonuts}
        />
      )}
    </>
  );
}

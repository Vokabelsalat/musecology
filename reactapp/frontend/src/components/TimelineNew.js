import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";
import { useCallback, useContext } from "react";
import { TooltipContext } from "./TooltipProvider";

export default function TimelineNew(props) {
  const {
    species,
    data,
    x,
    width,
    colorBlind,
    populationTrend,
    getTreeThreatLevel,
    imageLink,
    dummyImageLink,
    isAnimal,
    timeFrame,
    setTreeMapFilter
  } = props;

  const { speciesName, genusName, kingdomName, familyName } = species;
  const sciName = `${genusName} ${speciesName}`;

  const tradeThreat = getTreeThreatLevel(sciName, "economically");
  const threatThreat = getTreeThreatLevel(sciName, "ecologically");

  const leftIconColor = tradeThreat.getColor(colorBlind);

  const rightIconColor = threatThreat.getColor(colorBlind);

  const { setTooltip } = useContext(TooltipContext);

  const onMouseEnter = (event) => {
    setTooltip({
      tooltipText: sciName,
      tooltipMode: "species",
      tooltipOptions: {
        imageLink: imageLink,
        dummyLink: dummyImageLink,
        isAnimal,
        bgci: data.bgci,
        iucn: data.iucn,
        cites: data.cites,
        colorBlind,
        tradeThreat,
        threatThreat
      }
    });
    event.stopPropagation();
    event.preventDefault();
    // setHover(true);
  };

  const onMouseLeave = (event) => {
    setTooltip(null);
  };

  const onClick = useCallback(() => {
    setTreeMapFilter({
      kingdom: kingdomName,
      family: familyName,
      genus: genusName,
      species: sciName
    });
  }, [familyName, genusName, kingdomName, sciName, setTreeMapFilter]);

  return (
    <div
      key={`timelineNew${sciName}`}
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "100px auto",
        gridTemplateRows: "auto auto"
      }}
    >
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: "span 2",
          gridRowStart: 1,
          gridRowEnd: 1
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <TimelineHeader
          species={species}
          getTreeThreatLevel={getTreeThreatLevel}
          colorBlind={colorBlind}
          isAnimal={isAnimal}
          leftColor={leftIconColor}
          rightColor={rightIconColor}
          setTreeMapFilter={setTreeMapFilter}
        />
      </div>
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 1,
          gridRowStart: 2,
          gridRowEnd: 2
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <TimelineFront
          speciesName={sciName}
          imageLink={imageLink}
          dummyLink={dummyImageLink}
          onClick={onClick}
        />
      </div>
      <div
        style={{
          gridColumnStart: 2,
          gridColumnEnd: 2,
          gridRowStart: 2,
          gridRowEnd: 2
        }}
      >
        {data !== null && (
          <TimelineRows
            width={width}
            data={data}
            speciesName={sciName}
            x={x}
            colorBlind={colorBlind}
            populationTrend={populationTrend}
            timeFrame={timeFrame}
          />
        )}
      </div>
    </div>
  );
}

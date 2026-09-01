import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

import TimelineHeader from "./TimelineHeader";
import TimelineFront from "./TimelineFront";
import TimelineRows from "./TimelineRows";

export default function TimelineElement(props) {
  /* id: this.state.id,
    initWidth: this.props.initWidth,
    data: this.props.data,
    sourceColorMap: this.props.sourceColorMap,
    domainYears: this.props.domainYears,
    zoomLevel: this.state.zoomLevel,
    setZoomLevel: this.setZoomLevel.bind(this),
    speciesName: this.props.speciesName,
    maxPerYear: this.props.maxPerYear,
    pieStyle: this.props.pieStyle,
    groupSame: this.props.groupSame,
    sortGrouped: this.props.sortGrouped,
    heatStyle: this.props.heatStyle,
    justTrade: this.props.justTrade,
    justGenus: this.props.justGenus,
    setSpeciesSignThreats: this.props.setSpeciesSignThreats,
    getSpeciesSignThreats: this.props.getSpeciesSignThreats,
    getTreeThreatLevel: this.props.getTreeThreatLevel,
    addSpeciesToMap: this.props.addSpeciesToMap,
    removeSpeciesFromMap: this.props.removeSpeciesFromMap,
    muted: this.props.muted !== undefined ? this.props.muted : false,
    treeImageLinks: this.props.treeImageLinks,
    dummyImageLinks: this.props.dummyImageLinks,
    setHover: this.props.setHover,
    setTimeFrame: this.props.setTimeFrame,
    timeFrame: this.props.timeFrame,
    colorBlind: this.props.colorBlind,
    setFilter: this.props.setFilter,
    species: this.props.species,
    getPlantIcon: this.props.getPlantIcon,
    getAnimalIcon: this.props.getAnimalIcon,
    lastSpeciesSigns: this.props.lastSpeciesSigns,
    lastSpeciesThreats: this.props.lastSpeciesThreats */

  const speciesName = props.speciesName;
  const data = props.data;
  const x = props.x;
  const width = props.width;
  const colorBlind = props.colorBlind;
  const populationTrend = props.populationTrend;
  const getTreeThreatLevel = props.getTreeThreatLevel;
  const imageLink = props.imageLink;
  const dummyImageLink = props.dummyImageLink;
  const isAnimal = props.isAnimal;
  const timeFrame = props.timeFrame;
  const tooltip = props.tooltip;

  const leftIconColor = getTreeThreatLevel(
    speciesName,
    "economically"
  ).getColor(colorBlind);

  const rightIconColor = getTreeThreatLevel(
    speciesName,
    "ecologically"
  ).getColor(colorBlind);

  return (
    <div
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
      >
        <TimelineHeader
          speciesName={speciesName}
          getTreeThreatLevel={getTreeThreatLevel}
          colorBlind={colorBlind}
          isAnimal={isAnimal}
          leftColor={leftIconColor}
          rightColor={rightIconColor}
        />
      </div>
      <div
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 1,
          gridRowStart: 2,
          gridRowEnd: 2
        }}
      >
        <TimelineFront
          speciesName={speciesName}
          imageLink={imageLink}
          dummyLink={dummyImageLink}
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
            speciesName={speciesName}
            x={x}
            colorBlind={colorBlind}
            populationTrend={populationTrend}
            timeFrame={timeFrame}
            tooltip={tooltip}
          />
        )}
      </div>
    </div>
  );
}

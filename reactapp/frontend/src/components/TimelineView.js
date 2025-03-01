import React, { Component } from "react";
import Timeline from "./Timeline.js";
import { TimelineDatagenerator } from "../utils/TimelineDatagenerator";
import { replaceSpecialCharacters } from "../utils/utils";
import * as d3 from "d3";
import { thresholdFreedmanDiaconis } from "d3";
import {
  citesAssessment,
  bgciAssessment,
  iucnAssessment
} from "../utils/timelineUtils";
import TimelineScaleD3 from "./TimelineScaleD3";

class TimelineView extends Component {
  constructor(props) {
    super(props);

    this.usePreGenerated = props.usePreGenerated;
    this.plantIcon = null;

    this.state = {
      zoomLevel: 0,
      maxZoomLevel: 2,
      sourceColorMap: {},
      data: {},
      maxPerYear: 0,
      domainYears: [],
      sortedKeys: [],
      speciesSignThreats: {},
      oldTimelineData: {},
      unmutedSpecies: {},
      lastSpeciesSigns: this.props.lastSpeciesSigns,
      lastSpeciesThreats: this.props.lastSpeciesThreats
    };
  }

  componentDidMount() {
    this.create();
  }

  compareObjects(objA, objB) {
    let keysA = Object.keys(objA).sort();
    let keysB = Object.keys(objB).sort();
    if (JSON.stringify(keysA) !== JSON.stringify(keysB)) {
      return false;
    } else {
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
      this.create();
    }

    /* if (
      JSON.stringify(prevProps.lastSpeciesSigns) !==
      JSON.stringify(this.props.lastSpeciesSigns)
    ) {
      this.create();
    } */

    /* if (
      JSON.stringify(prevProps.colorBlind) !==
      JSON.stringify(this.props.colorBlind)
    ) {
      this.create();
    } */

    /*  let create = false;
         for (let species of Object.keys(this.props.data)) {
             if (!prevProps.data.hasOwnProperty(species)) {
                 this.create();
                 break;
             }
             else {
                 console.log(species, this.props.data.threats !== undefined ? this.props.data.threats.length : 0);
                }
            } */
  }

  create() {
    let tmpdata;
    let domainYears;
    if (this.usePreGenerated === false) {
      let generator = new TimelineDatagenerator(this.state.oldTimelineData);
      generator.processData(this.props.data, this.props.tradeData);

      tmpdata = generator.getData();

      domainYears = generator.getDomainYears();
    } else {
      tmpdata = this.props.data;
    }

    let reducer = (accumulator, currentValue) => {
      return accumulator + currentValue.length;
    };
    let sortedKeys = Object.keys(tmpdata).sort((a, b) => {
      /*       if (!tmpdata[b].hasOwnProperty("timeIUCN")) {
        return -1;
      } else if (!tmpdata[a].hasOwnProperty("timeIUCN")) {
        return 1;
      } else {
        return (
          tmpdata[b].timeIUCN.length +
          tmpdata[b].timeListing.length +
          tmpdata[b].timeThreat.length -
          (tmpdata[a].timeIUCN.length +
            tmpdata[a].timeListing.length +
            tmpdata[a].timeThreat.length)
        );
      } */
      return a.localeCompare(b);
    });

    let maxPerYear = Math.max(
      ...Object.values(tmpdata).map((e) =>
        e.hasOwnProperty("timeThreat")
          ? e.timeThreat.length > 0
            ? e.timeThreat[0].maxPerYear
            : 0
          : 0
      )
    );

    if (this.usePreGenerated) {
      let allTimeExtends = [];
      Object.values(tmpdata).forEach((e) => {
        if (e.hasOwnProperty("timeExtent")) {
          e.timeExtent.forEach((i) => {
            if (i !== null) allTimeExtends.push(parseInt(i));
          });
        }
      });

      let maxYear = Math.max(...allTimeExtends);
      let minYear = Math.min(...allTimeExtends);

      domainYears = { minYear, maxYear: 2022 };
    }

    let tmpPreparedData = this.prepareData(tmpdata);

    this.setState({
      maxPerYear: maxPerYear,
      sortedKeys: sortedKeys,
      data: tmpdata,
      preparedData: tmpPreparedData,
      domainYears: domainYears,
      sourceColorMap: {},
      oldTimelineData: tmpdata
    });
  }

  setZoomLevel(setValue) {
    this.setState({ zoomLevel: setValue });
  }

  onZoom(add) {
    let zoomLevel = this.state.zoomLevel + add;
    zoomLevel = Math.min(zoomLevel, this.state.maxZoomLevel);
    zoomLevel = Math.max(zoomLevel, 0);

    this.setZoomLevel(zoomLevel);
  }

  setMuted(setValue) {
    this.setState({ muted: setValue });
  }

  addUnmutedSpecies(species) {
    let newUnmutedSpecies = { ...this.state.unmutedSpecies };
    newUnmutedSpecies[species] = 1;
    this.setState({ unmutedSpecies: newUnmutedSpecies });
  }

  removeUnmutedSpecies(species) {
    let newUnmutedSpecies = { ...this.state.unmutedSpecies };
    delete newUnmutedSpecies[species];
    this.setState({ unmutedSpecies: newUnmutedSpecies });
  }

  removeAllUnmutedSpecies() {
    this.setState({ unmutedSpecies: {} });
  }

  prepareData(inputData) {
    let outputData = {};
    for (const species of Object.keys(inputData)) {
      const speciesData = inputData[species];
      let tmpElement = { iucn: [], cites: [], bgci: [] };

      if (speciesData.timeIUCN.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesData.timeIUCN) {
          let year = element.year.toString();
          let assessment = iucnAssessment.get(element.code);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort > assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["iucn"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });

        this.props.setSpeciesSignThreats(
          species,
          "iucn",
          [...tmpElement["iucn"]].pop()
        );
      }

      if (speciesData.timeThreat.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesData.timeThreat) {
          let year = element.year.toString();
          let assessment = bgciAssessment.get(element.danger);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort > assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["bgci"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });

        this.props.setSpeciesSignThreats(
          species,
          "threat",
          [...tmpElement["bgci"]].pop()
        );
      }

      if (speciesData.timeListing.length > 0) {
        let assessmentPerYear = {};
        for (let element of speciesData.timeListing) {
          let year = element.year.toString();
          let assessment = citesAssessment.get(element.appendix);

          if (assessmentPerYear.hasOwnProperty(year)) {
            if (assessment.sort > assessmentPerYear[year].assessment.sort) {
              assessmentPerYear[year] = {
                assessment: assessment,
                element: element
              };
            }
          } else {
            assessmentPerYear[year] = {
              assessment: assessment,
              element: element
            };
          }
        }

        tmpElement["cites"] = Object.values(assessmentPerYear).sort((a, b) => {
          return parseInt(a.element.year) - parseInt(b.element.year);
        });

        this.props.setSpeciesSignThreats(
          species,
          "cites",
          [...tmpElement["cites"]].pop()
        );
      }

      outputData[species] = tmpElement;
    }

    return outputData;
  }

  render() {
    let renderTimelines = false;
    let timescaleWidth = Math.max(this.props.width, 160) - 160;
    let x;
    if (
      Number.isInteger(this.state.domainYears.minYear) &&
      Number.isInteger(this.state.domainYears.maxYear)
    ) {
      let yearDiff =
        this.state.domainYears.maxYear - this.state.domainYears.minYear;

      let xDomain = Array(yearDiff + 1)
        .fill()
        .map((_, i) => this.state.domainYears.minYear - 1 + i + 1);

      x = d3.scaleBand().domain(xDomain).rangeRound([0, timescaleWidth]); /*  */
      if (yearDiff > 0) {
        renderTimelines = true;
      }
    }

    if (renderTimelines) {
      return (
        <div
          style={{
            display: "grid",
            width: "100%",
            height: "100%",
            maxHeight: "100%",
            gridTemplateColumns: "auto",
            gridTemplateRows: `min-content 1fr min-content`
          }}
        >
          {/* <div
            style={{
              backgroundColor: "orange",
              height: "20px"
            }}
          ></div>
          <div
            style={{
              backgroundColor: "teal",
              overflow: "hidden",
              overflowY: "scroll",
              height: "auto",
              gridTemplateColumns: "auto",
              gridTemplateRows: "1fr",
              display: "grid"
            }}
          >
            <div
              style={{
                backgroundColor: "purple",
                height: "500px",
                overflow: "scroll"
              }}
            >
              <div>{this.props.width}</div>
              <div>{this.props.height}</div>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "orange",
              height: "20px"
            }}
          ></div> */}
          {/*  <TimelineScaleD3
              initWidth={this.props.initWidth}
              key={"scaleToptimeline"}
              data={null}
              speciesName={"scaleTop"}
              sourceColorMap={this.state.sourceColorMap}
              domainYears={this.state.domainYears}
              zoomLevel={this.state.zoomLevel}
              setTimeFrame={this.props.setTimeFrame}
              timeFrame={this.props.timeFrame}
              x={x}
              width={timescaleWidth}
            /> */}
          {
            <div
              style={{
                overflowY: "scroll",
                width: "fit-content",
                position: "relative",
                marginLeft: "3px"
              }}
            >
              <div
                style={{
                  position: "relative"
                }}
              >
                {this.state.sortedKeys.map((e) => {
                  return (
                    <Timeline
                      id={replaceSpecialCharacters(e) + "TimelineVis"}
                      key={replaceSpecialCharacters(e) + "timeline"}
                      data={this.state.preparedData[e]}
                      initWidth={this.props.initWidth}
                      speciesName={e}
                      sourceColorMap={this.state.sourceColorMap}
                      domainYears={this.state.domainYears}
                      zoomLevel={this.state.zoomLevel}
                      setZoomLevel={this.setZoomLevel.bind(this)}
                      maxPerYear={this.state.maxPerYear}
                      pieStyle={this.props.pieStyle}
                      groupSame={this.props.groupSame}
                      heatStyle={this.props.heatStyle}
                      sortGrouped={this.props.sortGrouped}
                      justGenus={e.trim().includes(" ") ? false : true}
                      setSpeciesSignThreats={this.props.setSpeciesSignThreats}
                      getSpeciesSignThreats={this.props.getSpeciesSignThreats}
                      getTreeThreatLevel={this.props.getTreeThreatLevel}
                      addSpeciesToMap={this.props.addSpeciesToMap}
                      removeSpeciesFromMap={this.props.removeSpeciesFromMap}
                      colorBlind={this.props.colorBlind}
                      setFilter={this.props.setFilter}
                      species={this.props.species}
                      muted={
                        Object.keys(this.state.unmutedSpecies).includes(e)
                          ? false
                          : Object.keys(this.state.unmutedSpecies).length > 0
                          ? true
                          : false
                      }
                      removeAllUnmutedSpecies={this.removeAllUnmutedSpecies.bind(
                        this
                      )}
                      addUnmutedSpecies={this.addUnmutedSpecies.bind(this)}
                      removeUnmutedSpecies={this.removeUnmutedSpecies.bind(
                        this
                      )}
                      treeImageLinks={this.props.treeImageLinks}
                      dummyImageLinks={this.props.dummyImageLinks}
                      setHover={this.props.setHover}
                      setTimeFrame={this.props.setTimeFrame}
                      timeFrame={this.props.timeFrame}
                      getPlantIcon={this.props.getPlantIcon}
                      getAnimalIcon={this.props.getAnimalIcon}
                      lastSpeciesSigns={this.props.lastSpeciesSigns}
                      lastSpeciesThreats={this.props.lastSpeciesThreats}
                      x={x}
                      width={timescaleWidth}
                      populationTrend={this.props.data[e].populationTrend}
                      imageLink={this.props.treeImageLinks[e]}
                      dummyImageLink={this.props.dummyImageLinks[e]}
                      isAnimal={
                        this.props.data[e].Kingdom === "Animalia" ? true : false
                      }
                      tooltip={this.props.tooltip}
                    />
                  );
                })}
                {this.props.timeFrame[1] !== undefined &&
                  this.props.timeFrame[1] !==
                    this.state.domainYears.maxYear && (
                    <div
                      style={{
                        /*  */ position: "absolute",
                        left: 140 + x(this.props.timeFrame[1]),
                        top: 0,
                        width: timescaleWidth - x(this.props.timeFrame[1]),
                        height: "100%",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderLeft: "2px solid var(--highlightpurple)"
                      }}
                    />
                  )}
              </div>
            </div>
          }
          {
            {
              /* <TimelineScaleD3
              initWidth={this.props.initWidth}
              key={"scaleBottomtimeline"}
              data={null}
              speciesName={"scaleBottom"}
              sourceColorMap={this.state.sourceColorMap}
              domainYears={this.state.domainYears}
              zoomLevel={this.state.zoomLevel}
              setTimeFrame={this.props.setTimeFrame}
              timeFrame={this.props.timeFrame}
              x={x}
              width={timescaleWidth}
              bottom={true}
            /> */
            }
          }
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default TimelineView;

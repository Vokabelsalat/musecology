import { useEffect, useRef, useState } from "react";
import TimelineNew from "./Timeline";
import TimelineScaleD3 from "./TimelineScaleD3";
import TimelineCitations from "./TimelineCitations";

import { replaceSpecialCharacters } from "../utils/utils";

import * as d3 from "d3";

const ASSESSMENT_SOURCES = [
  {
    name: "IUCN Red List",
    field: "iucn",
    description: "Global extinction risk assessments.",
    href: "https://www.iucnredlist.org/"
  },
  {
    name: "BGCI ThreatSearch",
    field: "bgci",
    description: "Conservation assessments of plant species.",
    href: "https://www.bgci.org/resources/bgci-databases/threatsearch/"
  },
  {
    name: "CITES",
    field: "cites",
    description: "Trade listings in the CITES appendices, via Species+.",
    href: "https://cites.org/eng/app/index.php"
  }
];

export default function TimelineViewNew(props) {
  const {
    data,
    width,
    timeFrame,
    setTimeFrame,
    domainYears,
    imageLinks,
    dummyImageLinks,
    colorBlind,
    getTreeThreatLevel,
    setTreeMapFilter,
    setHoveredSpecies
  } = props;

  const [showAssessmentSources, setShowAssessmentSources] = useState(false);
  const assessmentSourcesRef = useRef(null);

  useEffect(() => {
    if (!showAssessmentSources) return;

    const handleOutsidePointerDown = (event) => {
      if (!assessmentSourcesRef.current?.contains(event.target)) {
        setShowAssessmentSources(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    return () =>
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown,
        true
      );
  }, [showAssessmentSources]);

  let x = (val) => 6;

  let timescaleWidth = Math.max(width, 160) - 160;
  if (
    Number.isInteger(domainYears.minYear) &&
    Number.isInteger(domainYears.maxYear)
  ) {
    let yearDiff = domainYears.maxYear - domainYears.minYear;

    let xDomain = Array(yearDiff + 1)
      .fill()
      .map((_, i) => domainYears.minYear - 1 + i + 1);

    x = d3.scaleBand().domain(xDomain).rangeRound([0, timescaleWidth]);
  }

  const sortedKeys =
    data != null
      ? Object.keys(data)
          .filter((e) => data[e] != null)
          .sort()
      : [];
  const id = "timelineView";

  const hasAssessment = (e, field) => data[e][field]?.length > 0;
  const assessedSpeciesCount = sortedKeys.filter((e) =>
    ASSESSMENT_SOURCES.some((source) => hasAssessment(e, source.field))
  ).length;

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        gridTemplateColumns: "auto",
        gridTemplateRows: `min-content 1fr min-content`,
        position: "relative"
      }}
    >
      <div
        ref={assessmentSourcesRef}
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          zIndex: 2,
          width: showAssessmentSources
            ? "min(340px, calc(100% - 20px))"
            : "auto",
          maxWidth: showAssessmentSources ? undefined : 130,
          borderRadius: "6px",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
          fontSize: "13px",
          lineHeight: 1.35,
          color: "#1e212e",
          overflow: "hidden"
        }}
      >
        <button
          type="button"
          aria-expanded={showAssessmentSources}
          aria-controls="assessment-sources"
          onClick={() => setShowAssessmentSources((isExpanded) => !isExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
            width: "100%",
            padding: "4px 5px",
            border: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            textAlign: "left",
            cursor: "pointer"
          }}
        >
          <span aria-live="polite">
            {assessedSpeciesCount.toLocaleString()} assessed species
          </span>
          <span aria-hidden="true">{showAssessmentSources ? "−" : "+"}</span>
        </button>

        {showAssessmentSources && (
          <div
            id="assessment-sources"
            style={{
              padding: "0 12px 12px",
              borderTop: "1px solid rgba(30, 33, 46, 0.14)"
            }}
          >
            <p style={{ margin: "10px 0 8px", fontWeight: 700 }}>
              Assessment and listing sources
            </p>
            <p style={{ margin: "0 0 10px" }}>
              A species counts as assessed if at least one source has an
              assessment or listing for it.{" "}
              {sortedKeys.length - assessedSpeciesCount} of {sortedKeys.length}{" "}
              shown species have no assessment.
            </p>
            <ul style={{ margin: 0, paddingLeft: "22px", listStyle: "disc" }}>
              {ASSESSMENT_SOURCES.map((source) => (
                <li key={source.field} style={{ marginBottom: "8px" }}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#095e8e", fontWeight: 600 }}
                  >
                    {source.name}
                  </a>
                  <span style={{ display: "block" }}>
                    {sortedKeys
                      .filter((e) => hasAssessment(e, source.field))
                      .length.toLocaleString()}{" "}
                    species. {source.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {
        <TimelineScaleD3
          id={`${id}scaleTop`}
          key={`scaleToptimeline${JSON.stringify(domainYears)}`}
          data={null}
          speciesName={"scaleTop"}
          domainYears={domainYears}
          setTimeFrame={setTimeFrame}
          timeFrame={timeFrame}
          x={x}
          width={timescaleWidth}
        />
      }
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
            {sortedKeys.map((e) => {
              return (
                <TimelineNew
                  id={replaceSpecialCharacters(e) + "TimelineVis"}
                  key={replaceSpecialCharacters(e) + "timeline"}
                  data={data[e]}
                  species={{
                    kingdomName: data[e]["kingdom"],
                    familyName: data[e]["family"],
                    genusName: data[e]["genus"],
                    speciesName: data[e]["species"]
                  }}
                  domainYears={domainYears}
                  getTreeThreatLevel={getTreeThreatLevel}
                  colorBlind={colorBlind}
                  timeFrame={timeFrame}
                  x={x}
                  width={timescaleWidth}
                  populationTrend={data[e].populationTrend}
                  imageLink={imageLinks[e]}
                  dummyImageLink={dummyImageLinks[e]}
                  isAnimal={data[e].isAnimal}
                  setTreeMapFilter={setTreeMapFilter}
                  setHoveredSpecies={setHoveredSpecies}
                />
              );
            })}
            {timeFrame[1] !== undefined &&
              timeFrame[1] !== domainYears.maxYear && (
                <div
                  style={{
                    position: "absolute",
                    left: 140 + x(timeFrame[1]),
                    top: 0,
                    width: timescaleWidth - x(timeFrame[1]),
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderLeft: "2px solid var(--highlightpurple)"
                  }}
                />
              )}
          </div>
          {sortedKeys.length === 1 && (
            <TimelineCitations
              data={data[sortedKeys[0]]}
              width={timescaleWidth + 140}
            />
          )}
        </div>
      }
      {
        <TimelineScaleD3
          id={`${id}scaleBottom`}
          key={`scaleBottomtimeline${JSON.stringify(domainYears)}`}
          data={null}
          domainYears={domainYears}
          setTimeFrame={setTimeFrame}
          timeFrame={timeFrame}
          x={x}
          width={timescaleWidth}
          bottom={true}
        />
      }
    </div>
  );
}

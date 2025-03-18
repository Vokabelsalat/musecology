import { isEmojiSupported } from "is-emoji-supported";
import { useMemo } from "react";
import { ReactCountryFlag } from "react-country-flag";
import ThreatCode from "./ThreatCode";
import ThreatIcon from "./ThreatIcon";
import { createProxyPhoto } from "./TimelineFront";

export const langUnicode = {
  de: "DE",
  en: "GB",
  es: "ES",
  fr: "FR"
};

const getLatestAssessment = (assessments) => {
  if (assessments != null && assessments.length > 0) {
    const latest = assessments.sort((a, b) => {
      return parseInt(b.element.year) - parseInt(a.element.year);
    })[0];
    return latest.assessment.abbreviation;
  } else {
    return "";
  }
};

const createSpeciesPhoto = (imageLink, dummyLink) => {
  if (imageLink != null && imageLink.length > 0) {
    return (
      <div className="h-auto w-[300px] max-h-[200px]">
        <img src={imageLink[0].link} />
      </div>
    );
  } else if (dummyLink != null) {
    return (
      <div className="h-auto w-[300px] max-h-[200px]">
        {createProxyPhoto(dummyLink)}
      </div>
    );
  } else {
    return <></>;
  }
};

const getImageSource = (imageLink, dummyLink) => {
  if (imageLink != null) {
    return (
      <>
        <span>&copy; </span>
        <span>{imageLink[0].source}</span>
      </>
    );
  } else if (dummyLink != null) {
    return (
      <>
        <span>&copy; </span>
        <span>Proxy of </span>
        <span>{dummyLink.source}</span>
      </>
    );
  }
};

export default function Tooltip(props) {
  const { speciesLabels, tooltipMode, tooltipText, tooltipOptions } = props;

  const tooltipContent = useMemo(() => {
    if (tooltipMode === "text") {
      return tooltipText;
    } else if (tooltipMode === "assessment") {
      const assessmentAndElement = tooltipText;

      return (
        <div className="flex flex-col gap-1 max-w-80">
          <div className="font-bold text-[medium] mb-1">
            <span className="italic">{assessmentAndElement.species}</span>
            {` (${assessmentAndElement.author})`}
          </div>
          {assessmentAndElement.assessment.assessmentType === "CITES" && (
            <>
              {assessmentAndElement.element.foundBy && (
                <div>
                  <span className="font-bold">CITES Synonym: </span>
                  <span className="italic">{`${assessmentAndElement.element.foundBy.taxonName}`}</span>
                  {` (${assessmentAndElement.element.foundBy.author})`}
                </div>
              )}
              <div>
                <span className="font-bold">CITES: </span>
                <span>{`${assessmentAndElement.element.year} – Appendix ${assessmentAndElement.element.appendix}`}</span>
              </div>
              {assessmentAndElement.element.annotation && (
                <div>
                  <span className="font-bold">Annotation: </span>
                  <span>{assessmentAndElement.element.annotation}</span>
                </div>
              )}
              {assessmentAndElement.element.hash_annotation && (
                <div>
                  <div className="font-bold">
                    Annotation for traded commodities:
                  </div>
                  <div>{`${assessmentAndElement.element.hash_annotation.symbol} ${assessmentAndElement.element.hash_annotation.note}`}</div>
                </div>
              )}
            </>
          )}
          {assessmentAndElement.assessment.assessmentType === "IUCN" && (
            <>
              {assessmentAndElement.element.foundBy && (
                <div>
                  <span className="font-bold">IUCN Synonym: </span>
                  <span className="italic">{`${assessmentAndElement.element.foundBy.taxonName}`}</span>
                  {` (${assessmentAndElement.element.foundBy.author})`}
                </div>
              )}
              <div>
                <span className="font-bold">IUCN: </span>
                <span>{`${assessmentAndElement.element.year} – ${assessmentAndElement.assessment.name} (${assessmentAndElement.assessment.abbreviation})`}</span>
              </div>
              <div>
                <span className="font-bold">Assessment Year: </span>
                <span>{`${new Date(
                  assessmentAndElement.element.assessmentDate
                ).getFullYear()}`}</span>
              </div>
            </>
          )}
          {assessmentAndElement.assessment.assessmentType === "BGCI" && (
            <>
              {assessmentAndElement.element.foundBy && (
                <div>
                  <span className="font-bold">BGCI Synonym: </span>
                  <span className="italic">{`${assessmentAndElement.element.foundBy.taxonName}`}</span>
                  {` (${assessmentAndElement.element.foundBy.author})`}
                </div>
              )}
              <div>
                <span className="font-bold">BGCI: </span>
                <span>
                  {`${assessmentAndElement.assessment.name} (${assessmentAndElement.assessment.abbreviation})`}
                </span>
              </div>
              <div>
                <span className="font-bold">Assessment Year: </span>
                <span>{assessmentAndElement.element.year}</span>
              </div>
              <div>
                <span className="font-bold">Reference: </span>
                <span>{`${assessmentAndElement.element.reference}`}</span>
              </div>
            </>
          )}
        </div>
      );
    } else if (tooltipMode === "species") {
      const species = tooltipText;
      const labels = speciesLabels[species];
      const threatThreatLevel = tooltipOptions.threatThreat;
      const tradeThreatLevel = tooltipOptions.tradeThreat;

      return (
        <div className="grid grid-cols-1 grid-rows-[auto_auto_auto_auto_auto] p-1 gap-x-2">
          <b>
            <i>{species}</i>
          </b>
          <div className="flex gap-3">
            {Object.keys(labels).map((language) => {
              if (labels[language] == null || labels[language].length === 0) {
                return <></>;
              } else {
                return (
                  <div key={`langTag-${species}-${language}`}>
                    <ReactCountryFlag
                      style={{
                        fontSize: "1.5em",
                        lineHeight: "1.5em"
                      }}
                      countryCode={langUnicode[language]}
                      svg={!isEmojiSupported("🇬🇧")}
                    />{" "}
                    {labels[language].join(", ")}
                  </div>
                );
              }
            })}
          </div>
          <div className="grid grid-cols-[min-content_min-content] grid-rows-1 gap-3 mt-2">
            {tooltipOptions != null &&
              createSpeciesPhoto(
                tooltipOptions.imageLink,
                tooltipOptions.dummyLink
              )}
            <div className="self-center w-auto h-min grid grid-cols-[repeat(5,min-content)] grid-rows-5 gap-x-3">
              <div className="col-span-2 flex justify-end font-bold">Trade</div>
              <div className="row-span-5 flex items-center justify-center">
                <ThreatIcon
                  leftColor={tradeThreatLevel.getColor(
                    tooltipOptions.colorBlind
                  )}
                  rightColor={threatThreatLevel.getColor(
                    tooltipOptions.colorBlind
                  )}
                  isAnimal={tooltipOptions.isAnimal}
                  size="big"
                />
              </div>
              <div className="col-span-2 font-bold">Threat</div>
              <div className="col-span-2 flex justify-end text-nowrap">
                {tradeThreatLevel.getName()}
              </div>
              <div className="col-span-2 text-nowrap">
                {threatThreatLevel.getName()}
              </div>
              <div className="row-span-2">CITES:</div>
              <div className="row-span-2">
                {tooltipOptions.cites.length > 0 && (
                  <ThreatCode
                    type="cites"
                    code={getLatestAssessment(tooltipOptions.cites)}
                  />
                )}
              </div>
              <div className="">IUCN:</div>
              <div className="">
                <ThreatCode
                  type="iucn"
                  code={getLatestAssessment(tooltipOptions.iucn)}
                />
              </div>
              <div className="">BGCI:</div>
              <div className="">
                <ThreatCode
                  type="bgci"
                  code={getLatestAssessment(tooltipOptions.bgci)}
                />
              </div>
            </div>
          </div>
          <div className="mt-2">
            {tooltipOptions != null && (
              <div>
                {getImageSource(
                  tooltipOptions.imageLink,
                  tooltipOptions.dummyLink
                )}
              </div>
            )}
          </div>
          <div className="italic">Click to filter!</div>
        </div>
      );
    } else {
      return "";
    }
  }, [tooltipText, tooltipMode, tooltipOptions]);

  if (tooltipText === "" || tooltipText == null) {
    return <></>;
  } else {
    return tooltipContent;
    /* return (
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          border: "1px solid gray",
          padding: "3px",
          borderRadius: "5px",
          backgroundColor: "white",
          zIndex: 99999
        }}
      >
        <div className="relative size-full">{tooltipContent}</div>
      </div>
    ); */
  }
}

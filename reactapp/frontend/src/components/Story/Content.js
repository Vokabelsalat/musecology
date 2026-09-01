import { padding } from "@mui/system";
import { forwardRef, useMemo, useRef, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { ImageSource } from "react-map-gl";
import ResizeComponent from "../ResizeComponent";
import OrchestraNew from "../Orchestra";
import TimelineViewNew from "../TimelineView";
import OverlayLink from "../Overlay/OverlayLink";
import { Parser } from "html-to-react";
import TreeMapView from "../TreeMapViewNew";
import Legend from "../LegendNew";
import { iucnAssessment } from "../../utils/timelineUtils";
import ThreatCode from "../ThreatCode";
import { serialize, deserialize } from "react-serialize";
import { replaceSpecialCharacters } from "../../utils/utils";
// import { useOnParent } from "./useOnParent";

export const Content = (props) => {
  const {
    id,
    title,
    subtitle,
    authors,
    type,
    text,
    image,
    imageArray,
    audio,
    quote,
    fontStyle,
    alignment,
    height,
    width,
    playAudio = false,
    mobile = false,
    visualization,
    legend,
    colorBlind,
    setOverlayContent
  } = props;

  const audioRef = useRef(null);
  const htmlParser = new Parser();
  const renderRichContent = (value) =>
    typeof value === "string" ? htmlParser.parse(value) : value;

  const replaceThreatCodes = (elementArray) => {
    const newElements = [];
    try {
      let idx = 0;
      for (let element of elementArray) {
        if (element.type === "threatcode") {
          newElements.push(
            <ThreatCode
              key={
                replaceSpecialCharacters(JSON.stringify(element.props)) + idx
              }
              {...element.props}
              colorBlind={colorBlind}
            />
          );
        } else {
          newElements.push(element);
        }
        idx = idx + 1;
      }
    } catch (error) {
      newElements.push(elementArray);
    }

    return newElements;
  };

  const getVisualization = (vis) => {
    const visualizationId = vis.id ?? `${vis.type}-${id}`;

    switch (vis.type) {
      case "orchestra":
        return (
          <OrchestraNew
            key={visualizationId}
            id={visualizationId}
            instrumentData={vis.instrumentData}
            instrumentGroupData={vis.instrumentGroupData}
            getThreatLevel={vis.getThreatLevel}
            threatType={vis.threatType}
            colorBlind={colorBlind}
            setInstrument={vis.setInstrument}
            setInstrumentGroup={vis.setInstrumentGroup}
            instrument={vis.instrument}
            instrumentGroup={vis.instrumentGroup}
            instrumentPart={vis.instrumentPart}
            setInstrumentPart={vis.setInstrumentPart}
            showThreatDonuts={vis.showThreatDonuts}
            instrumentVideos={vis.instrumentVideos}
          />
        );
      case "timeline":
        return (
          <TimelineViewNew
            data={vis.speciesTimelineData}
            getTreeThreatLevel={vis.getThreatLevel}
            imageLinks={vis.imageLinks}
            dummyImageLinks={vis.dummyImageLinks}
            setTimeFrame={vis.setTimeFrame}
            timeFrame={vis.timeFrame}
            colorBlind={colorBlind}
            domainYears={vis.domainYears}
            setTreeMapFilter={vis.setTreeMapFilter}
          />
        );
      case "treeMap":
        return (
          <TreeMapView
            data={{
              name: "Kingdom",
              children: vis.kingdomData,
              filterDepth: 0
            }}
            treeMapFilter={vis.treeMapFilter}
            setTreeMapFilter={vis.setTreeMapFilter}
          />
        );
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (audioRef.current != null) {
      if (playAudio) {
        audioRef.current.audioEl.current.play();
      } else {
        audioRef.current.audioEl.current.pause();
      }
    }
  }, [playAudio]);

  const { titlePrimary, titleSecondary, textPrimary, textSecondary } =
    useMemo(() => {
      switch (fontStyle) {
        case "classic":
        default:
          return {
            titlePrimary: "Great Vibes",
            titleSecondary: "Montserrat",
            textPrimary: "Libre Baskerville",
            textSecondary: "Source Sans Pro"
          };
      }
    }, [fontStyle]);

  const { textAlign, blockText } = useMemo(() => {
    switch (alignment) {
      case "centerBlockText":
        return { textAlign: "center", blockText: true };
      case "center":
        return { textAlign: "center", blockText: false };
      case "right":
        return { textAlign: "end" };
      case "left":
      default:
        return { textAlign: "start" };
    }
  }, [alignment]);

  const html = useMemo(() => {
    switch (type) {
      case "storyTitle":
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              padding: "10px",
              height: mobile ? "45vh" : "100vh",
              display: "grid",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexFlow: "column",
              gap: "5px"
            }}
          >
            <div
              style={{
                fontSize: mobile ? "larger" : "-webkit-xxx-large",
                fontFamily: titlePrimary
                //marginTop: "-50%"
              }}
            >
              {renderRichContent(title)}
            </div>
            {subtitle !== undefined && (
              <div
                style={{
                  fontFamily: titleSecondary,
                  fontSize: mobile ? "initial" : "larger"
                }}
              >
                {renderRichContent(subtitle)}
              </div>
            )}
            {authors !== undefined && (
              <div
                style={{
                  fontFamily: titleSecondary,
                  fontSize: mobile ? "initial" : "larger"
                }}
              >
                {renderRichContent(authors)}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexFlow: "column",
                gap: "10px"
              }}
            >
              <div
                style={{
                  fontSize: "initial",
                  fontFamily: titleSecondary,
                  alignSelf: "center"
                }}
              >
                Scroll to experience the story.
              </div>
              <div className="mouse-icon">
                <div className="wheel"></div>
              </div>
            </div>
          </div>
        );
      case "end":
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "-webkit-xxx-large",
              fontFamily: titlePrimary,
              padding: "10px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {title}
          </div>
        );
      case "fullSizeQuote":
        return (
          <div
            style={{
              height: mobile ? "45vh" : "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              style={{
                //verticalAlign: "middle",
                display: "grid",
                gridTemplateColumns: "auto",
                gridTemplateRows: "minmax(100px, 1fr) minmax(100px, 1fr)",
                // gap: "10px",
                padding: "10px",
                textAlign: textAlign,
                height: "100%",
                alignItems: "center"
              }}
            >
              {image !== undefined && (
                <div
                  className="vignette-radial"
                  style={{ height: "45%" }}
                  /* style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  alignItems: "center"
                }} */
                >
                  <img style={{ height: "100%" }} src={`${image.url}`} />
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: "-webkit-xxx-large",
                    fontFamily: titlePrimary
                  }}
                >
                  {renderRichContent(quote.text)}
                </div>
                <div
                  style={{
                    marginTop: "1em",
                    fontSize: "x-large",
                    fontFamily: titleSecondary
                  }}
                >
                  "{renderRichContent(quote.translation)}"
                </div>
                <div
                  style={{
                    fontFamily: titleSecondary,
                    color: "gray",
                    marginTop: "1em",
                    fontSize: "large"
                  }}
                >
                  {renderRichContent(quote.author)}
                </div>
              </div>
            </div>
          </div>
        );
      case "text":
        return (
          <div
            style={{
              //verticalAlign: "middle",
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto auto",
              gap: "10px",
              padding: "10px",
              width: "100%",
              height: "100%",
              textAlign: textAlign
            }}
          >
            <div
              style={{
                fontSize: "large",
                fontFamily: textPrimary,
                marginBottom: "5px"
              }}
            >
              {renderRichContent(title)}
            </div>
            <div
              style={{
                fontSize: "large",
                fontFamily: textSecondary,
                textAlign: blockText ? "justify" : "center"
              }}
            >
              {replaceThreatCodes(renderRichContent(text))}
            </div>
            {image !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  width: image.width ? image.width : "50%",
                  display: "grid",
                  gridTemplateColumns: "auto",
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign
                }}
              >
                <OverlayLink setOverlayContent={setOverlayContent}>
                  <img style={{ width: "100%" }} src={image.url}></img>
                </OverlayLink>
                <div style={{ width: "100%", fontSize: "large" }}>
                  {renderRichContent(image.caption)}
                </div>
                <div
                  className="copyrightQuote"
                  style={{ width: "100%", color: "gray" }}
                >
                  {renderRichContent(image.copyright)}
                </div>
              </div>
            )}
            {imageArray !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: `${imageArray
                    .map((i) => {
                      return i.width ?? "auto";
                    })
                    .join(" ")}`,
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign
                }}
              >
                {imageArray.map((image, index) => {
                  return (
                    <>
                      <OverlayLink
                        key={`link${JSON.stringify(image)}${index}`}
                        setOverlayContent={setOverlayContent}
                      >
                        <img
                          key={`img${JSON.stringify(image)}${index}`}
                          style={{
                            gridColumn: index + 1,
                            gridRow: 1,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          src={image.url}
                        ></img>
                      </OverlayLink>
                      <div
                        key={`caption${JSON.stringify(image)}${index}`}
                        style={{
                          gridColumn: index + 1,
                          gridRow: 2,
                          width: "100%",
                          fontSize: "large"
                        }}
                      >
                        {renderRichContent(image.caption)}
                      </div>
                      <div
                        key={`copyright${JSON.stringify(image)}${index}`}
                        className="copyrightQuote"
                        style={{
                          width: "100%",
                          color: "gray",
                          gridColumn: index + 1,
                          gridRow: 3
                        }}
                      >
                        {renderRichContent(image.copyright)}
                      </div>
                    </>
                  );
                })}
              </div>
            )}
            {audio !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  display: "grid",
                  gridTemplateColumns: "auto",
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign,
                  justifyItems: textAlign
                }}
              >
                <ReactAudioPlayer
                  ref={audioRef}
                  src={audio.url}
                  controls
                  preload="auto"
                />
                <div style={{ width: "100%", fontSize: "large" }}>
                  {renderRichContent(audio.caption)}
                </div>
                <div
                  className="copyrightQuote"
                  style={{ width: "100%", color: "gray" }}
                >
                  {renderRichContent(audio.copyright)}
                </div>
              </div>
            )}
            {legend != null && (
              <Legend
                type={legend.threatType}
                threatType={legend.threatType}
                colorBlind={legend.colorBlind}
                setCategoryFilter={legend.setCategoryFilter}
                categoryFilter={legend.categoryFilter}
              />
            )}
            {visualization != null && (
              <div
                style={{
                  marginTop: "15px",
                  width: visualization.width ? visualization.width : "100%",
                  minWidth: visualization.width ? visualization.width : "100%",
                  maxWidth: visualization.width ? visualization.width : "100%",
                  minHeight: "50px",
                  aspectRatio: ["legend"].includes(visualization.type)
                    ? "unset"
                    : "16 / 9"
                }}
              >
                <ResizeComponent>
                  {getVisualization(visualization)}
                </ResizeComponent>
              </div>
            )}
          </div>
        );
      case "clear":
        return <></>;
      case "restart":
        return (
          <a style={{ textDecoration: "none", textAlign: textAlign }} href="#0">
            <div style={{ color: "#ab6318", fontSize: "50px" }}>&#8682;</div>
            Restart the Story
          </a>
        );
      default:
        return <div>Nothin to see here...</div>;
    }
  });

  return (
    <div
      className={`content`}
      style={{
        padding: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height ?? "auto",
        width: width ?? "100%"
      }}
    >
      {html}
    </div>
  );
};

/* Content.displayName = "Content";

export default Content;
 */

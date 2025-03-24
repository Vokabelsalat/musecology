import { useCallback, useEffect, useRef, useState } from "react";
import OrchestraGroup from "./OrchestraGroup";
import OrchestraHeader from "./OrchestraHeader";

const groupToPosition = {
  Keyboard: 0,
  Plucked: 1,
  Percussion: 2,
  Woodwinds: 3,
  Brasses: 4,
  Strings: 5
};

export default function OrchestraNew(props) {
  const {
    data,
    width,
    height,
    instrumentData,
    instrumentGroupData,
    colorBlind,
    threatType,
    getThreatLevel,
    setInstrument,
    setInstrumentGroup,
    instrumentGroup = null,
    instrument,
    instrumentPart,
    setInstrumentPart,
    showThreatDonuts = true
  } = props;

  const ref = useRef(null);

  const [scaleString, setScaleString] = useState(null);

  const [scaledWidth, setScaledWidth] = useState(width);
  const [scaledHeight, setScaledHeight] = useState(height);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (ref) {
      if (ref.current) {
        let actWidth = ref.current.getBBox().width;
        let actHeight = ref.current.getBBox().height;

        actWidth = actWidth > 0 ? actWidth : 1;
        actHeight = actHeight > 0 ? actHeight : 0.5;

        let tmpScale = Math.min(
          (width - 5) / actWidth,
          (height - 5) / actHeight
        );

        let tmpScaledWidth = actWidth * tmpScale;
        let tmpScaledHeight = actHeight * tmpScale;

        setScaledWidth(tmpScaledWidth);
        setScaledHeight(tmpScaledHeight);
        setScale(tmpScale);
      }
    }
  }, [width, height, scale, instrumentGroupData]);

  const zoomInto = useCallback(
    (i_zoom) => {
      let scaleStringTmp;
      if (i_zoom) {
        let x0 = i_zoom.x;
        let x1 = i_zoom.x + i_zoom.width;
        let y0 = i_zoom.y;
        let y1 = i_zoom.y + i_zoom.height;

        scaleStringTmp = `translate(${scaledWidth / 2}, ${
          scaledHeight / 2
        }) scale(${Math.min(
          8,
          0.9 / Math.max((x1 - x0) / scaledWidth, (y1 - y0) / scaledHeight)
        )}) translate(${-(x0 + x1) / 2}, ${-(y0 + y1) / 2})`;
        setScaleString(scaleStringTmp);
      } else {
        scaleStringTmp = `scale(${scale})`;
        setScaleString(scaleStringTmp);
      }
    },
    [scaledWidth, scaledHeight, scale]
  );

  useEffect(() => {
    if (instrumentGroup === null) {
      zoomInto(null);
    }
  }, [instrumentGroup, zoomInto]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "1px"
      }}
    >
      {instrumentGroup && (
        <div
          className="resetButton"
          style={{
            position: "absolute",
            top: 5,
            left: 5
          }}
          onClick={() => {
            /* setSelected(null); */
            zoomInto(null);
            setInstrument(null);
            setInstrumentGroup(null);
            setInstrumentPart(null);
          }}
        >
          Reset
        </div>
      )}
      <svg
        width={scaledWidth + 4}
        height={scaledHeight + 4}
        style={{
          border: "1px solid lightgray",
          boxSizing: "border-box",
          padding: "1px"
        }}
      >
        <g
          ref={ref}
          transform={`${scaleString ? scaleString : `scale(${scale})`}`}
        >
          {Object.keys(instrumentGroupData).map((group) => {
            const i = groupToPosition[group];

            const asArray = Object.entries(instrumentData);

            const filtered = asArray
              .filter(([key, value]) => {
                return instrumentGroupData[group].includes(key);
              })
              .map(([key, value]) => {
                return [
                  key,
                  [
                    ...new Set(
                      Object.values(value).flatMap((entry) => {
                        return entry;
                      })
                    )
                  ]
                ];
              });

            const species = Object.fromEntries(filtered);

            return (
              <OrchestraGroup
                key={`OG${i}`}
                id={`OG${i}`}
                groupName={group}
                position={{
                  x: 510 / 2,
                  y: 255
                }}
                positionID={i}
                /* setSelected={setSelected}
                selected={selected} */
                selected={group === instrumentGroup}
                setZoom={zoomInto}
                instruments={instrumentGroupData[group]}
                species={species}
                getThreatLevel={getThreatLevel}
                threatType={threatType}
                colorBlind={colorBlind}
                setInstrument={setInstrument}
                setInstrumentGroup={setInstrumentGroup}
                setInstrumentPart={setInstrumentPart}
                instrument={instrument}
                showThreatDonuts={showThreatDonuts}
              />
            );
          })}
        </g>
      </svg>
      {instrument && (
        <div
          style={{
            position: "absolute",
            width: "90%",
            height: "80%",
            backgroundColor: "white",
            border: "1px gray solid",
            overflow: "hidden",
            overflowY: "scroll"
          }}
        >
          <OrchestraHeader
            instrumentGroup={instrumentGroup}
            instrument={instrument}
            instrumentParts={instrumentData[instrument]}
            instrumentPart={instrumentPart}
            setInstrument={setInstrument}
            setInstrumentPart={setInstrumentPart}
          />
          <div
            style={{
              display: "grid",
              gridGap: "5px",
              padding: "5px"
            }}
          >
            {instrumentData.hasOwnProperty(instrument) &&
              Object.keys(instrumentData[instrument])
                .sort()
                .map((instPart) => {
                  return (
                    <div
                      style={{
                        cursor: "pointer",
                        width: "fit-content",
                        boxSizing: "border-box",
                        padding: "2px",
                        border:
                          instrumentPart === instPart
                            ? "solid 2px purple"
                            : "none"
                      }}
                      onClick={() => {
                        setInstrumentPart(instPart);
                      }}
                    >
                      {instPart} ({instrumentData[instrument][instPart].length})
                    </div>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";

export default function OrchestraHeader(props) {
  const {
    instrumentGroup,
    instrument,
    instrumentParts,
    instrumentPart,
    setInstrument,
    setInstrumentPart,
    instrumentVideos
  } = props;

  const videos = useMemo(() => {
    for (const key of Object.keys(instrumentVideos)) {
      console.log(key, instrument);

      if (instrument.includes(key)) {
        console.log("RETURN");

        return instrumentVideos[key];
      }
    }
    return null;
  }, [instrumentVideos, instrument]);

  console.log("HERE", instrumentVideos, videos, instrument);

  return (
    <>
      <div
        style={{
          width: "100%",
          backgroundColor: "white",
          display: "grid",
          gridTemplateColumns: "auto auto",
          gridTemplateRows: "auto",
          gridGap: "10px",
          gridColumn: "1"
        }}
        className="border-b"
      >
        {instrumentGroup && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto",
                gridTemplateRows: "auto auto",
                cursor: "pointer",
                padding: "5px"
              }}
              onClick={() => {
                setInstrument(null);
                /* filterTreeMap({ data: { name: kingdom, filterDepth: 1 } }); */
              }}
            >
              <div style={{ fontWeight: "bold" }}>Instrument Group</div>
              <div style={{}}>{instrumentGroup}</div>
            </div>
          </>
        )}
        {instrument && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto",
              cursor: "pointer",
              border: instrumentPart == null ? "2px solid purple" : "none",
              padding: "5px"
            }}
            onClick={() => {
              setInstrumentPart(null);
              /* filterTreeMap({ data: { name: family, filterDepth: 2 } }); */
            }}
          >
            <div style={{ fontWeight: "bold" }}>Instrument</div>
            <div style={{}}>{instrument}</div>
          </div>
        )}
      </div>
      {videos != null && (
        <>
          <div className="row-1 col-2 border-b">Videos</div>
          <div className="col-start-2 row-start-2 p-2">
            {Object.entries(videos).map(([k, v]) => {
              if (v != null) {
                return (
                  <div>
                    <div>{k}</div>
                    <div className="pb-[56.25%] relative">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={v
                          .replace("watch?v=", "embed/")
                          .replace(
                            "https://youtu.be/",
                            "https://www.youtube.com/embed/"
                          )}
                      ></iframe>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}
    </>
  );
}

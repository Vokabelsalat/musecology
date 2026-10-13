import { useEffect, useMemo, useState } from "react";
import InstrumentPhotoCarousel from "./InstrumentPhotoCarousel";

export default function OrchestraHeader(props) {
  const {
    instrumentGroup,
    instrumentFamily,
    setInstrumentFamily,
    familySpecies,
    instrument,
    instrumentPart,
    setInstrument,
    setInstrumentPart,
    instrumentVideos,
    instrumentImages = {},
    groupSpecies,
    instrumentSpecies,
    setHoveredSpecies
  } = props;

  const videos = useMemo(() => {
    for (const key of Object.keys(instrumentVideos)) {
      if (instrument.includes(key)) {
        return instrumentVideos[key];
      }
    }
    return null;
  }, [instrumentVideos, instrument]);

  const photos = instrumentImages?.[instrument]?.images ?? [];
  const hasVideos =
    videos != null && Object.values(videos).some((v) => v != null);

  const tabs = [
    ...(photos.length > 0 ? ["Photos"] : []),
    ...(hasVideos ? ["Videos"] : [])
  ];
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    setActiveTab(null);
  }, [instrument]);

  const shownTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <>
      <div
        style={{
          width: "100%",
          backgroundColor: "white",
          display: "grid",
          gridTemplateColumns: "auto auto auto",
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
                setInstrumentFamily?.(null);
                /* filterTreeMap({ data: { name: kingdom, filterDepth: 1 } }); */
              }}
              onMouseEnter={() => setHoveredSpecies?.(groupSpecies)}
              onMouseLeave={() => setHoveredSpecies?.(instrumentSpecies)}
            >
              <div>Instrument Group</div>
              <div className="font-bold">{instrumentGroup}</div>
            </div>
          </>
        )}
        {instrumentFamily && (
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
            }}
            onMouseEnter={() => setHoveredSpecies?.(familySpecies)}
            onMouseLeave={() => setHoveredSpecies?.(instrumentSpecies)}
          >
            <div>Instrument Family</div>
            <div className="font-bold">{instrumentFamily}</div>
          </div>
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
            }}
            onMouseEnter={() => setHoveredSpecies?.(instrumentSpecies)}
            onMouseLeave={() => setHoveredSpecies?.(instrumentSpecies)}
          >
            <div>Instrument</div>
            <div className="font-bold">{instrument}</div>
          </div>
        )}
      </div>
      {tabs.length > 0 && (
        <>
          <div className="row-1 col-2 border-b flex items-end gap-4 px-2">
            {tabs.map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer pb-1 ${
                  tab === shownTab ? "font-bold" : ""
                }`}
                style={{
                  borderBottom:
                    tab === shownTab
                      ? "2px solid var(--highlightpurple)"
                      : "2px solid transparent"
                }}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="col-start-2 row-start-2 p-2">
            {shownTab === "Photos" && (
              <InstrumentPhotoCarousel photos={photos} />
            )}
            {shownTab === "Videos" &&
              Object.entries(videos).map(([k, v]) => {
                if (v != null) {
                  return (
                    <div key={k}>
                      <div className="font-bold">{k}</div>
                      <div className="pb-[56.25%] relative">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={v
                            .replace("watch?v=", "embed/")
                            .replace(
                              "https://youtu.be/",
                              "www.youtube-nocookie.com/embed/"
                            )
                            .replace("youtube.com/", "youtube-nocookie.com/")}
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

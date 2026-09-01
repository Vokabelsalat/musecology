import { useEffect, useRef, useState, cloneElement } from "react";
import TimelineRow from "./TimelineRow";
import useResizeObserver from "use-resize-observer";
import { tooltip } from "leaflet";

export default function TimelineRows(props) {
  const { data, x, width, colorBlind, populationTrend, timeFrame } = props;

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "40px auto 30px",
        gridTemplateRows: "auto auto auto",
        fontSize: "12px",
        position: "relative"
      }}
      className="timelineRowsWrapper"
    >
      {data.cites.length > 0 && (
        <TimelineRow
          width={width}
          type="cites"
          data={data.cites}
          species={`${data.genus} ${data.species}`}
          author={data.author}
          x={x}
          colorBlind={colorBlind}
        />
      )}
      {data.iucn.length > 0 && (
        <TimelineRow
          width={width}
          type="iucn"
          data={data.iucn}
          species={`${data.genus} ${data.species}`}
          author={data.author}
          x={x}
          colorBlind={colorBlind}
          populationTrend={data.populationTrend}
        />
      )}
      {data.bgci.length > 0 && (
        <TimelineRow
          width={width}
          type="bgci"
          data={data.bgci}
          species={`${data.genus} ${data.species}`}
          author={data.author}
          x={x}
          colorBlind={colorBlind}
        />
      )}
    </div>
  );
}

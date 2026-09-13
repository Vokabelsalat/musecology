import { useMemo } from "react";
import TimelineRow from "./TimelineRow";

export default function TimelineRows(props) {
  const { data, x, width, colorBlind, populationTrend, timeFrame } = props;

  if (data.species === "lambertii") {
    console.log("test", data);
  }

  const numberOfLines = useMemo(() => {
    return [data.cites.length, data.iucn.length, data.bgci.length].filter(
      (e) => e > 0
    ).length;
  }, [data]);

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "40px auto 30px",
        gridTemplateRows: `repeat(${numberOfLines}, minmax(0px, 20px))`,
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

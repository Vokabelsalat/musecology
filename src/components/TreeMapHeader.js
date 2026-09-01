import TreeMap from "./TreeMapNew";
import { useState } from "react";

export default function TreeMapHeader(props) {
  const { species, genus, family, kingdom, filterTreeMap } = props;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "grid",
        gridTemplateColumns: "min-content auto auto auto auto",
        gridTemplateRows: "auto"
      }}
    >
      {kingdom && (
        <>
          <div
            style={{ display: "flex", alignItems: "center", margin: "0 15px" }}
          >
            <div
              className="resetButton"
              onClick={() => {
                filterTreeMap(null);
              }}
            >
              Reset
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto",
              cursor: "pointer"
            }}
            onClick={() => {
              filterTreeMap({ data: { name: kingdom, filterDepth: 1 } });
            }}
          >
            <div style={{}}>Kingdom</div>
            <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
              {kingdom}
            </div>
          </div>
        </>
      )}
      {family && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: family, filterDepth: 2 } });
          }}
        >
          <div style={{}}>Family</div>
          <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
            {family}
          </div>
        </div>
      )}
      {genus && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: genus, filterDepth: 3 } });
          }}
        >
          <div style={{}}>Genus</div>
          <div style={{ fontWeight: "bold", fontStyle: "italic" }}>{genus}</div>
        </div>
      )}
      {species && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: species, filterDepth: 4 } });
          }}
        >
          <div style={{}}>Species</div>
          <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
            {species}
          </div>
        </div>
      )}
    </div>
  );
}

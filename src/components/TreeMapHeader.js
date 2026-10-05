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
              cursor: "pointer",
              padding: "0px 2px",
              border: family == null ? "2px solid var(--highlightpurple)" : "",
              boxSizing: "border-box"
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
      {kingdom && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer",
            padding: "0px 2px",
            border:
              genus == null && family != null
                ? "2px solid var(--highlightpurple)"
                : "",
            boxSizing: "border-box"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: family, filterDepth: 2 } });
          }}
        >
          <div style={{}}>Family</div>
          {family && (
            <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
              {family}
            </div>
          )}
        </div>
      )}
      {family && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer",
            padding: "0px 2px",
            border:
              genus != null && species == null
                ? "2px solid var(--highlightpurple)"
                : "",
            boxSizing: "border-box"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: genus, filterDepth: 3 } });
          }}
        >
          <div style={{}}>Genus</div>
          {genus && (
            <div style={{ fontWeight: "bold", fontStyle: "italic" }}>
              {genus}
            </div>
          )}
        </div>
      )}
      {genus && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer",
            padding: "0px 2px",
            border: species != null ? "2px solid var(--highlightpurple)" : "",
            boxSizing: "border-box"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: species, filterDepth: 4 } });
          }}
        >
          <div style={{}}>Species</div>
          {species && <div className="font-bold italic">{species}</div>}
        </div>
      )}
    </div>
  );
}

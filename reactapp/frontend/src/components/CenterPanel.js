import PieChartNew from "./PieChartNew";
import Switch from "@mui/material/Switch";
import Legend from "./LegendNew";
import SearchBar from "./SearchBarNew";
import CountrySearchBar from "./CountrySearchBar";

export default function CenterPanel(props) {
  const {
    data,
    getSpeciesThreatLevel,
    threatType,
    setThreatType,
    colorBlind,
    setColorBlind,
    setCategoryFilter,
    categoryFilter,
    speciesData,
    treeMapFilter,
    setTreeMapFilter,
    formMapMode,
    countriesDictionary,
    ecoRegionSearchOptions,
    setSelectedCountry,
    selectedCountry,
    setSelectedEcoregion
  } = props;

  console.log("piechartdata", Object.values(data));

  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateRows: "auto",
        gridTemplateColumns: "calc(50% - 35px) 70px calc(50% - 35px)",
        gap: "3px"
      }}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateRows: "auto",
          gridTemplateColumns: "auto auto auto auto auto",
          gap: "3px"
        }}
      >
        <div
          style={{
            margin: 0,
            padding: 0
          }}
          className="searchBarWrapper"
        >
          <SearchBar
            speciesData={speciesData}
            setTreeMapFilter={setTreeMapFilter}
            treeMapFilter={treeMapFilter}
          />
        </div>
        <div
          style={{
            margin: 0,
            padding: 0,
            flexFlow: "column"
          }}
          className="searchBarWrapper"
        >
          <div>Color Blind Mode</div>
          <div className="switchWrapper">
            <Switch
              onChange={() => {
                setColorBlind(!colorBlind);
              }}
              checked={colorBlind}
              className="colorBlindSwitch"
              color="secondary"
            />
          </div>
        </div>
        <Legend
          type={"economically"}
          threatType={threatType}
          colorBlind={colorBlind}
          setThreatType={setThreatType}
          setCategoryFilter={setCategoryFilter}
          categoryFilter={categoryFilter}
        />
      </div>
      <div className="searchBarWrapper">
        <PieChartNew
          data={data}
          getThreatLevel={getSpeciesThreatLevel}
          threatType={threatType}
          colorBlind={colorBlind}
        />
      </div>
      <div
        style={{
          display: "grid",
          width: "100%",
          height: "100%",
          gridTemplateRows: "auto",
          gridTemplateColumns: "auto auto",
          gap: "3px"
        }}
      >
        <Legend
          type={"ecologically"}
          threatType={threatType}
          colorBlind={colorBlind}
          setThreatType={setThreatType}
          setCategoryFilter={setCategoryFilter}
          categoryFilter={categoryFilter}
        />
        <div
          style={{
            margin: 0,
            padding: 0
          }}
          className="searchBarWrapper"
        >
          <CountrySearchBar
            speciesData={speciesData}
            mapSearchMode={formMapMode}
            countriesDictionary={countriesDictionary}
            ecoRegionSearchOptions={ecoRegionSearchOptions}
            setSelectedCountry={setSelectedCountry}
            setSelectedEcoregion={setSelectedEcoregion}
            selectedCountry={selectedCountry}
          />
        </div>
      </div>
    </div>
  );
}

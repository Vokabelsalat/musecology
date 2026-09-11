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

  return (
    <div className="centerPanel">
      <div
        className="centerPanelSide centerPanelSideLeft"
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
      <div className="searchBarWrapper centerPanelChart">
        <PieChartNew
          data={data}
          getThreatLevel={getSpeciesThreatLevel}
          threatType={threatType}
          colorBlind={colorBlind}
        />
      </div>
      <div
        className="centerPanelSide centerPanelSideRight"
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

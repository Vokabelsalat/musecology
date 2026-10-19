import { fireEvent, render, screen } from "@testing-library/react";
import Statistics from "./Statistics";

jest.mock("../utils/timelineUtils", () => ({
  iucnAssessment: { get: () => ({ getColor: () => "gray" }) }
}));

const stats = {
  generated: "2026-10-13",
  species: { total: 2, byKingdom: { Plantae: 2 }, byEcosystem: { T: 2 } },
  map: {
    countries: { total: 10, withSpecies: 4, withoutSpecies: 6 },
    terrestrialEcoregions: { total: 5, withSpecies: 1, withoutSpecies: 4 },
    marineEcoregions: { total: 3, withSpecies: 0, withoutSpecies: 3 },
    hexagons: {
      total: 100,
      withSpecies: 7,
      withoutSpecies: 93,
      maxSpecies: 1
    }
  },
  coverage: {
    countrySources: { treeCountries: 2 },
    withCountries: 2,
    withEcoregions: 1,
    withHexagons: 1,
    withEcoregionsAndHexagons: 1,
    withoutCountries: 1,
    withoutEcoregions: 1,
    withoutHexagons: 1,
    withoutEcoregionsAndHexagons: 1
  },
  speciesWithMissingDistribution: [
    {
      name: "Abies nomapia",
      kingdom: "Plantae",
      family: "Pinaceae",
      ecosystem: "T",
      iucn: "EN",
      origin: "",
      countrySource: "treeCountries",
      countries: 1,
      terrestrialEcoregions: 0,
      marineEcoregions: 0,
      hexagons: 0,
      missing: ["ecoregions", "hexagons"]
    },
    {
      name: "Picea nocountria",
      kingdom: "Plantae",
      family: "Pinaceae",
      ecosystem: "T",
      iucn: "LC",
      origin: "",
      countrySource: null,
      countries: 0,
      terrestrialEcoregions: 2,
      marineEcoregions: 0,
      hexagons: 3,
      missing: ["countries"]
    }
  ],
  unmatchedCountryValues: { GI: 1 },
  unknownMapIds: {
    terrestrialEcoregions: [],
    marineEcoregions: [],
    hexagons: 0
  },
  regionTotals: {
    continents: { Europe: 5 },
    terrestrialRealms: { Palearctic: 4 },
    marineRealms: {}
  },
  instrumentFamilies: [
    {
      family: "Violin family",
      speciesCount: 2,
      countries: 3,
      terrestrialEcoregions: 1,
      marineEcoregions: 0,
      hexagons: 7,
      continents: { Europe: 3 },
      terrestrialRealms: { Palearctic: 1 },
      marineRealms: {}
    }
  ],
  ecoregions: [
    {
      id: 1,
      name: "Alpine forests",
      type: "terrestrial",
      realm: "Palearctic",
      group: "Forests",
      speciesCount: 1,
      kingdoms: { Plantae: 1 },
      iucn: { LC: 1 },
      species: ["Abies alba"]
    },
    {
      id: 2,
      name: "Coral sea",
      type: "marine",
      realm: "Pacific",
      group: "Reef",
      speciesCount: 0,
      kingdoms: {},
      iucn: {},
      species: []
    }
  ]
};

test("statistics page lists species without map and expands ecoregions", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(stats) })
  );
  render(<Statistics />);

  expect(await screen.findByText("Abies nomapia")).toBeInTheDocument();
  expect(screen.getByText("Picea nocountria")).toBeInTheDocument();
  fireEvent.change(
    screen.getByDisplayValue("Missing countries, ecoregions or hexagons"),
    { target: { value: "countries" } }
  );
  expect(screen.queryByText("Abies nomapia")).not.toBeInTheDocument();
  expect(screen.getByText("Picea nocountria")).toBeInTheDocument();
  expect(
    screen.getByText("Terrestrial ecoregions", { selector: "div" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Abies alba")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText(/Alpine forests/));
  expect(screen.getByText("Abies alba")).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Violin family/));
  expect(screen.getByText("Countries per continent")).toBeInTheDocument();
  expect(screen.getByText("1 / 4 ecoregions")).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText("Only ecoregions without species"));
  expect(screen.queryByText(/Alpine forests/)).not.toBeInTheDocument();
  expect(screen.getByText(/Coral sea/)).toBeInTheDocument();
});

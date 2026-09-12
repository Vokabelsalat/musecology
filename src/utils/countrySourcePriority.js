export const COUNTRY_SOURCE_PRIORITY = [
  {
    name: "BGCI GlobalTreeSearch",
    field: "treeCountries",
    description: "Country-level distribution data for tree species.",
    href: "https://www.bgci.org/resources/bgci-databases/globaltreesearch/"
  },
  {
    name: "IUCN Red List",
    field: "iucnCountries",
    description: "Countries from the latest global assessment.",
    href: "https://www.iucnredlist.org/"
  },
  {
    name: "Plants of the World Online (POWO)",
    field: "powoCountries",
    description: "Native plant distribution records from Kew.",
    href: "https://powo.science.kew.org/"
  },
  {
    name: "Manual curation",
    field: "manualCountries",
    description:
      "Internally reviewed country assignments when no source above is available."
  }
];

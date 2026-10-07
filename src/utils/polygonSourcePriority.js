const COUNTRY_SOURCE_MAPPING = {
  sources: {
    title: "Species Distribution Sources",
    subtitle:
      "The first source with data is used; results from later sources are not combined.",
    data: [
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
        href: "https://www.iucnredlist.org"
      },
      {
        name: "Plants of the World Online (POWO)",
        field: "powoCountries",
        description: "Native plant distribution records from Kew.",
        href: "https://powo.science.kew.org"
      },
      {
        name: "Manual curation",
        field: "manualCountries",
        description:
          "Internally reviewed country assignments when no source above is available."
      }
    ]
  },
  boundaries: {
    title: "Baselayer",
    subtitle: null,
    data: [
      {
        name: "UN Country Borders",
        field: "countryBorders",
        description: "UNHCR Administrative Boundary",
        href: "https://data.unhcr.org/en/geoservices"
      }
    ]
  }
};

const ECOREGION_SOURCES = {
  title: "Species Distribution Sources",
  subtitle: null,
  data: [
    {
      name: "BGCI",
      field: "treeCountries",
      description: "Point distribution data.",
      href: "https://www.bgci.org"
    },
    {
      name: "IUCN Red List",
      field: "iucnCountries",
      description: "Point distribution or range map data.",
      href: "https://www.iucnredlist.org"
    },
    {
      name: "Ocean Biodiversity Information System (OBIS)",
      // field: "powoCountries",
      description: "Point distribution data.",
      href: "https://mapper.obis.org"
    },
    {
      name: "Global Biodiversity Information Facility (GBIF)",
      // field: "powoCountries",
      description: "Point distribution data.",
      href: "https://www.gbif.org"
    },
    {
      name: "Manual curation",
      field: "manualCountries",
      description:
        "Internally reviewed ecoregion assignments when no source above is available."
    }
  ]
};

const ECOREGION_SOURCE_MAPPING = {
  sources: ECOREGION_SOURCES,
  boundaries: {
    title: "Baselayer",
    subtitle: null,
    data: [
      {
        name: "Ecoregions 2017",
        // field: "countryBorders",
        // description: "UNHCR Administrative Boundary",
        href: "https://ecoregions.appspot.com"
      }
    ]
  }
};

const HEXAGON_SOURCE_MAPPING = {
  sources: ECOREGION_SOURCES,
  boundaries: {
    title: "Baselayer",
    subtitle: null,
    data: [
      {
        name: "Artificial Hexagongrid",
        description: "One hexagon corresponds approx. to 1,000 km²."
        // field: "countryBorders",
        // href: "https://ecoregions.appspot.com"
      }
    ]
  }
};

const ORCHESTRA_SOURCE_MAPPING = {
  sources: {
    title: "Orchestras & Opera Houses Worldwide",
    subtitle: null,
    data: [
      {
        name: "musicalchairs",
        field: null,
        description:
          "Directory orchestras & opera houses worldwide, including city locations. Accessed 12/2021",
        href: "https://www.musicalchairs.info/orchestras"
      }
    ]
  },
  boundaries: {
    title: "Baselayer",
    subtitle: null,
    data: [
      {
        name: "UN Country Borders",
        field: "countryBorders",
        description: "UNHCR Administrative Boundary",
        href: "https://data.unhcr.org/en/geoservices"
      }
    ]
  }
};

// const COUNTRY_MAPPING = {
//   title: "Species mapping source priority",
//   description:
//     "The first source with data is used; results from later sources are not combined.",
//   sources: COUNTRY_SOURCE_PRIORITY
// };

// const ECOREGION_MAPPING = {
//   title: "Ecoregion mapping sources",
//   description:
//     "Species are assigned to every ecoregion their range intersects; terrestrial and marine assignments are shown separately.",
//   sources: {
//     terrestrial: [
//       {
//         name: "Terrestrial ecoregions",
//         field: "terEcos",
//         description: "Ecoregion IDs (ECO_ID) intersecting the species range."
//       }
//     ],
//     marine: [
//       {
//         name: "Marine ecoregions",
//         field: "marEcos",
//         description:
//           "Marine ecoregion codes (ECO_CODE) intersecting the species range."
//       }
//     ]
//   }
// };

// const HEXAGON_MAPPING = {
//   title: "Hexagon mapping sources",
//   description:
//     "Species are assigned to every hexagon their range intersects; terrestrial and marine assignments are shown separately.",
//   sources: {
//     terrestrial: [
//       {
//         name: "Terrestrial hexagons",
//         field: "terHexagons",
//         description: "Hexagon IDs intersecting the species range on land."
//       }
//     ],
//     marine: [
//       {
//         name: "Marine hexagons",
//         field: "marHexagons",
//         description: "Hexagon IDs intersecting the species range at sea."
//       }
//     ]
//   }
// };

export const POLYGON_SOURCE_MAPPINGS = {
  countries: COUNTRY_SOURCE_MAPPING,
  orchestras: ORCHESTRA_SOURCE_MAPPING,
  ecoregions: ECOREGION_SOURCE_MAPPING,
  protection: ECOREGION_SOURCE_MAPPING,
  hexagons: HEXAGON_SOURCE_MAPPING
};

export const getPolygonSourcePriority = (mapMode, isTerrestial = true) => {
  const mapping = POLYGON_SOURCE_MAPPINGS[mapMode] ?? COUNTRY_SOURCE_MAPPING;
  // const sources = Array.isArray(mapping.sources)
  //   ? mapping.sources
  //   : mapping.sources[isTerrestial ? "terrestrial" : "marine"];
  return { ...mapping };
};

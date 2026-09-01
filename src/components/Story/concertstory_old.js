const concertContents = [
  {
    type: "storyTitle",
    title: (
      <>
        <div>Waldkonzert</div>
      </>
    ),
    authors: <>S. Lichtenberg & J.Kusnick</>,
    subtitle: (
      <>
        Sonntag, 21.05.2023
        <br />
        11.00 - 13.00 Uhr
      </>
    ),
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [0.0, 0.0],
      zoom: 1,
      speed: 1.0
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false
  },
  {
    type: "text",
    title: "Nürnberg",
    text: (
      <>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </>
    ),
    image: {
      url: "https://images.ctfassets.net/0i0zqigm38c2/3exNPrwEV0gT0hyEAsT5Nx/1e0403578281fff58b9e0bc16958b350/Gluck-Saal.jpg",
      caption:
        "Gluck-Saal im Opernhaus (Staatstheater Nürnberg/Matthias Dengler)",
      width: "100%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [11.075459128357894, 49.44642081594858],
      zoom: 18,
      speed: 0.2
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false,
    width: "100%"
  },
  {
    type: "text",
    title: "Brazil",
    text: "Brazil officially the Federative Republic of Brazil (Portuguese: República Federativa do Brasil), is the largest country in South America and in Latin America. At 8.5 million square kilometers (3,300,000 sq mi) and with over 217 million people, Brazil is the world's fifth-largest country by area and the seventh most populous. Its capital is Brasília, and its most populous city is São Paulo. The federation is composed of the union of the 26 states and the Federal District. It is the only country in the Americas to have Portuguese as an official language. It is one of the most multicultural and ethnically diverse nations, due to over a century of mass immigration from around the world, and the most populous Roman Catholic-majority country.",
    image: {
      url: "./P1020999.JPG",
      width: "50%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-57.78726375397518, -13.98656101384816],
      zoom: 3,
      speed: 0.5
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false,
    mapFilter: { country: "Brazil" },
    extraPolygon: {
      name: "mataAtlantica",
      fill: null
    }
  },
  {
    type: "text",
    title: "Mata Atlântica – Area of the Superlatives",
    text: "Long before the Europeans invaded Brazil the tree had already developed the same preference as human beings, the Brazilian Coast. Today 2/3 of Brazilians populations lives along its coast. The Mata Atlântica is one of the worldwide biodiversity hotspots with an extraordinary species richness and at the same time one of the most threatened and degradaded biomes in the world. It consists of 15 different ecoregions with their characteristic, geographically distinct assemblages of natural communities and species.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG",
      caption: "Antonina Bay as viewed from the Serra do Mar Paranaense.",
      width: "60%",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG">
            Deyvid Setti e Eloy Olindo Setti
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0">
            CC BY-SA 3.0
          </a>
          , via Wikimedia Commons
        </>
      )
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-41.817144351268325, -19.675475442674127],
      zoom: 4,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    projection: "globe",
    showThreatDonuts: false,
    treeMapFilter: {
      genus: "Paubrasilia",
      species: "Paubrasilia echinata",
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    extraPolygon: {
      name: "mataAtlantica",
      fill: null
    }
  },
  {
    type: "text",
    title: "Mata Atlântica – Area of the Superlatives",
    text: "Long before the Europeans invaded Brazil the tree had already developed the same preference as human beings, the Brazilian Coast. Today 2/3 of Brazilians populations lives along its coast. The Mata Atlântica is one of the worldwide biodiversity hotspots with an extraordinary species richness and at the same time one of the most threatened and degradaded biomes in the world. It consists of 15 different ecoregions with their characteristic, geographically distinct assemblages of natural communities and species.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/85/Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG",
      caption: "Antonina Bay as viewed from the Serra do Mar Paranaense.",
      width: "60%",
      copyright: (
        <>
          <a href="https://commons.wikimedia.org/wiki/File:Ba%C3%ADa_de_Antonina_vista_da_Serra_do_Mar2.JPG">
            Deyvid Setti e Eloy Olindo Setti
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0">
            CC BY-SA 3.0
          </a>
          , via Wikimedia Commons
        </>
      )
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-34.38824229932922, -6.515708961589885],
      zoom: 8,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    projection: "globe",
    showThreatDonuts: false,
    treeMapFilter: {
      genus: "Paubrasilia",
      species: "Paubrasilia echinata",
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    extraPolygon: {
      name: "protectedAreasPaubrasil",
      fill: "rgba(246,249,146,1)"
    }
  },
  {
    type: "text",
    title: <>Where can this unique tree potentially be found?</>,
    text: (
      <>
        Pau-brasil is even more picky and grows naturally only between Rio
        Grande do Norte and Rio de Janeiro, which means it is endemic to the
        Mata Atlântica biome. The emblematic and culturally important pau-brasil
        tree tells a bundle of stories - on one hand a story of social and
        cultural exploitation and on the other of music and culture. The beauty
        of its flowers with their sweet smell attracts bees and fascinates
        people.
      </>
    ),
    width: "70%",
    imageArray: [
      {
        url: "./P1030585.JPG",
        caption: "Bee on the intensivly scenting Paubrasil's blossoms.",
        width: "40%",
        copyright: "Silke Lichtenberg"
      },
      {
        url: "./P1020974.JPG",
        caption: "The typical spiked birch of the Paubrasil tree.",
        width: "60%",
        copyright: "Silke Lichtenberg"
      }
    ],
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [-43.32547696037534, -23.093653119001388],
      zoom: 8,
      speed: 0.1
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false,
    treeMapFilter: {
      genus: "Paubrasilia",
      species: "Paubrasilia echinata",
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    extraPolygon: {
      name: "protectedAreasPaubrasil",
      fill: "rgba(246,249,146,1)"
    }
  },
  {
    type: "text",
    title: "Madagascar",
    text: "Madagascar, officially the Republic of Madagascar, is an island country lying off the southeastern coast of Africa. It is the world's fourth largest island, the second-largest island country and the 46th largest country in the world. Its capital and largest city is Antananarivo.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Iss059e046155_lrg_South_Side_of_Madagascar_from_ISS.jpg",
      width: "60%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [46.96217728373126, -19.40460294184492],
      zoom: 5,
      speed: 0.4
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    }
  },
  /* {
    type: "text",
    title: "Picea abies",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Kuusk_Keila-Paldiski_rdt_%C3%A4%C3%A4res.jpg",
      width: "30%"
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    treeMapFilter: {
      genus: "Picea",
      species: "Picea abies",
      kingdom: "Plantae",
      family: "Pinaceae"
    },
    showCountries: false,
    showThreatDonuts: false
  }, */
  {
    type: "text",
    title: "The Alps",
    text: "The Alps are the highest and most extensive mountain range that is entirely in Europe, stretching approximately 1,200 km (750 mi) across seven Alpine countries (from west to east): France, Switzerland, Italy, Liechtenstein, Austria, Germany, and Slovenia.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Saslong_udu_da_Sacun_ora.jpg",
      width: "70%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [9.316667, 46.5],
      zoom: 6,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    treeMapFilter: {
      genus: "Picea",
      species: "Picea abies",
      kingdom: "Plantae",
      family: "Pinaceae"
    },
    showCountries: false,
    showThreatDonuts: false,
    extraPolygon: { name: "alps", fill: null }
  },
  /* {
    type: "text",
    title: "Dalbergia",
    text: "Dalbergia is a large genus of small to medium-size trees, shrubs and lianas in the pea family, Fabaceae, subfamily Faboideae. It was recently assigned to the informal monophyletic Dalbergia clade (or tribe): the Dalbergieae. The genus has a wide distribution, native to the tropical regions of Central and South America, Africa, Madagascar and southern Asia.",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Dalbe_latif_081228-4907_H_ipb.jpg",
      width: "30%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [0, 0],
      zoom: 1,
      speed: 1
    },
    mapLayer: {
      type: "countries",
      mapStyle: "outdoors"
    },
    treeMapFilter: {
      genus: "Dalbergia",
      species: null,
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    projection: "equalEarth",
    showCountries: true,
    showThreatDonuts: true,
    showThreatStatusInCluster: false
  }, */
  {
    type: "text",
    title: "Nürnberg",
    text: (
      <>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </>
    ),
    image: {
      url: "https://images.ctfassets.net/0i0zqigm38c2/3exNPrwEV0gT0hyEAsT5Nx/1e0403578281fff58b9e0bc16958b350/Gluck-Saal.jpg",
      caption:
        "Gluck-Saal im Opernhaus (Staatstheater Nürnberg/Matthias Dengler)",
      width: "100%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [11.075459128357894, 49.44642081594858],
      zoom: 18,
      speed: 1
    },
    mapLayer: {
      type: "orchestras",
      mapStyle: "satellite"
    },
    projection: "globe",
    treeMapFilter: {
      genus: "Dalbergia",
      species: null,
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    showCountries: false,
    width: "100%"
  },
  {
    type: "text",
    title: "Dalbergia in Madagascar",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Iss059e046155_lrg_South_Side_of_Madagascar_from_ISS.jpg",
      width: "60%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [46.96217728373126, -19.40460294184492],
      zoom: 5,
      speed: 0.4
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false,
    mapFilter: {
      country: "Madagascar"
    },
    treeMapFilter: {
      kingdom: "Plantae",
      family: "Fabaceae",
      genus: "Dalbergia",
      species: null
    }
  },
  {
    type: "text",
    title: "Dalbergia in Madagascar",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Iss059e046155_lrg_South_Side_of_Madagascar_from_ISS.jpg",
      width: "60%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [46.96217728373126, -19.40460294184492],
      zoom: 5,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite"
    },
    mapFilter: {
      country: "Madagascar"
    },
    projection: "globe",
    treeMapFilter: {
      kingdom: "Plantae",
      family: "Fabaceae",
      genus: "Dalbergia",
      species: null
    },
    threatType: "ecologically",
    showThreatDonuts: true,
    showThreatStatusInCluster: true
  },
  /*  {
    type: "text",
    title: "Diospyros in Madagascar",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Iss059e046155_lrg_South_Side_of_Madagascar_from_ISS.jpg",
      width: "60%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [46.96217728373126, -19.40460294184492],
      zoom: 5,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite"
    },
    mapFilter: {
      country: "Madagascar"
    },
    projection: "globe",
    treeMapFilter: {
      kingdom: "Plantae",
      family: "Ebenaceae",
      genus: "Diospyros",
      species: null
    },
    threatType: "ecologically",
    showThreatDonuts: true,
    showThreatStatusInCluster: true
  }, */
  {
    type: "text",
    title: "Caparthians",
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [22.392448555989517, 47.2356781136759],
      zoom: 6,
      speed: 0.4
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    treeMapFilter: {
      kingdom: "Plantae",
      family: "Sapindaceae",
      genus: "Acer",
      species: "Acer pseudoplatanus"
    },
    projection: "globe",
    showThreatDonuts: false,
    showThreatStatusInCluster: false,
    extraPolygon: { name: "carphartians", fill: null }
  },
  {
    type: "text",
    title: "Tanzania",
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [39.41062597102422, -7.464119782844293],
      zoom: 7,
      speed: 0.1,
      minZoom: 3
    },
    mapLayer: {
      type: "hexagons",
      mapStyle: "satellite",
      polygonFill: false
    },
    treeMapFilter: {
      genus: "Dalbergia",
      species: "Dalbergia melanoxylon",
      kingdom: "Plantae",
      family: "Fabaceae"
    },
    showCountries: false,
    showThreatDonuts: false
  },
  {
    type: "text",
    title: "Nürnberg",
    text: (
      <>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </>
    ),
    image: {
      url: "https://images.ctfassets.net/0i0zqigm38c2/3exNPrwEV0gT0hyEAsT5Nx/1e0403578281fff58b9e0bc16958b350/Gluck-Saal.jpg",
      caption:
        "Gluck-Saal im Opernhaus (Staatstheater Nürnberg/Matthias Dengler)",
      width: "100%"
    },
    flyTo: {
      // bearing: 90,
      // pitch: 40
      center: [11.075459128357894, 49.44642081594858],
      zoom: 18,
      speed: 0.2
    },
    mapLayer: {
      type: "countries",
      mapStyle: "satellite"
    },
    projection: "globe",
    showCountries: false,
    showThreatDonuts: false,
    width: "100%"
  },
  { type: "end", title: "Le Fin" },
  {
    type: "text",
    title: "Violine",
    height: "50vh",
    text: (
      <>
        Moritz König
        <br />
        Tae Koseki
      </>
    )
  },
  {
    type: "text",
    title: "Viola",
    height: "50vh",
    text: <>Lisa Klotz</>
  },
  {
    type: "text",
    title: "Cello",
    height: "50vh",
    text: (
      <>
        Arita Kwon
        <br />
        Veronika Zucker
      </>
    )
  },
  {
    type: "text",
    title: "Fagott",
    height: "50vh",
    text: (
      <>
        Anna Koch
        <br />
        Paulina Strebel
      </>
    )
  },
  {
    type: "text",
    title: "Klarinette",
    height: "50vh",
    text: <>Martin Möhler</>
  },
  {
    type: "text",
    title: "Schlagzeug",
    height: "50vh",
    text: (
      <>
        Christian Stier
        <br />
        Sebastian Hausl
        <br />
        Christian Wissel
        <br />
        Pascal Klaiber
        <br />
        Paul Donat
      </>
    )
  }
];

export default concertContents;

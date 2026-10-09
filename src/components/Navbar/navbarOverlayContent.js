// Keep navbar copy as plain data. The overlay components accept the same object
// shapes, so these local values can later be replaced by a backend response.
export const navbarOverlayContent = {
  stories: {
    title: "MusEcology Stories",
    description:
      "Explore narrative views of the relationships between musical instruments, species and ecosystems.",
    links: [
      {
        label: "The Story of Stringed Instrument Bows",
        href: "/stories/bow"
      }
    ]
  },
  publications: {
    title: "Publications",
    entries: [
      {
        title: "Protecting threatened species and music traditions",
        authors:
          "Lichtenberg, S., Nehren, U., Anhuf, D., Brémaud, I., de Oliveira Pinto, T., Fonseca-Kruel, V. S., … & Rosa, P. (2025).",
        publication: "Frontiers in Ecology and the Environment, e2837.",
        href: "https://doi.org/10.1002/fee.2837",
        linkLabel: "https://doi.org/10.1002/fee.2837"
      },
      {
        title:
          "Visual analysis of diversity and threat status of natural materials for musical instruments",
        authors:
          "Kusnick, J., Lichtenberg, S., Wiegreffe, D., Huber-Sannwald, E., Nehren, U., & Jänicke, S. (2024).",
        publication: "Frontiers in Environmental Science, 12, 1406376.",
        href: "https://doi.org/10.3389/fenvs.2024.1406376",
        linkLabel: "https://doi.org/10.3389/fenvs.2024.1406376"
      },
      {
        title:
          "Visualization-based Scrollytelling of Coupled Threats for Biodiversity, Species and Music Cultures",
        authors: "Kusnick, J., Lichtenberg, S., & Jänicke, S. (2023).",
        publication:
          "Workshop on Visualisation in Environmental Sciences. The Eurographics Association.",
        href: "https://findresearcher.sdu.dk/ws/portalfiles/portal/263852266/099-106.pdf",
        linkLabel: "https://doi.org/10.2312/envirvis.20231112"
      }
    ]
  },
  updates: {
    title: "Latest Updates",
    description:
      "Recent changes from the master branch that are included in this version of MusEcology.",
    commitsEndpoint:
      "https://api.github.com/repos/Vokabelsalat/musecology/commits",
    repositoryHref: "https://github.com/Vokabelsalat/musecology",
    branchHref: "https://github.com/Vokabelsalat/musecology/commits/master",
    branchName: "master"
  },
  about: {
    title: "About MusEcology",
    paragraphs: [
      "A classical symphony orchestra consists of up to 29 musical instruments manufactured from up to 768 distinct natural materials. The interrelationships between the extraction of raw materials for instrument making, the international trade conditions, and the protection status of endangered species and their ecosystems are highly complex and have yet to be sufficiently scientifically examined. However, rapidly progressing climate and ecological change call for sustainable solutions.",
      "To address this challenging task, we present MusEcology, a new interactive decision support system based on visualizations. The interactive visualizations offer entry points for users of various backgrounds to explore the interrelationships between musical instruments, natural resources and ecosystems.",
      "The tool’s fundamental objectives are to guarantee that (1) data processing correlates related data resources, (2) visual interfaces and interaction schemes encourage new interdisciplinary research on complex systems interactions, and (3) high-level decision-making is supported to identify alternative pathways towards sustainable instrument making."
    ],
    people: [
      {
        name: "Silke Lichtenberg",
        role: "Ph. D. student",
        affiliation:
          "TH Köln – University of Applied Sciences, Cologne, Germany",
        image: "/images/silke.jpg",
        imageAlt: "Silke Lichtenberg"
      },
      {
        name: "Jakob Kusnick",
        role: "Postdoctoral Fellow",
        affiliation: "University of Bergen, Bergen, Norway",
        image: "/images/image001-1.jpg",
        imageAlt: "Jakob Kusnick"
      }
    ],
    specialpeople: [
      {
        name: "Udo Nehren",
        role: "Professor",
        affiliation:
          "TH Köln – University of Applied Sciences, Cologne, Germany"
      },
      {
        name: "Stefan Jänicke",
        role: "Professor",
        affiliation: "University of Southern Denmark, Odense, Denmark"
      },
      {
        name: "Elisabeth Huber-Sannwald",
        role: "Professor",
        affiliation:
          "Instituto Potosino de Investigación Científica y Tecnológica, San Luis Potosi, Mexico"
      },
      {
        name: "Emily Beech",
        role: "Head of Conservation Prioritisation",
        affiliation:
          "Botanic Gardens Conservation International, Richmond, United Kingdom"
      },
      {
        name: "Malin Rivers",
        role: "Head of Conservation Prioritisation",
        affiliation:
          "Botanic Gardens Conservation International, Richmond, United Kingdom"
      },
      {
        name: "Gerald Koch",
        role: "Scientific Director and Professor",
        affiliation: "Thünen Institute of Wood Research, Hamburg, Germany"
      },
      {
        name: "Volker Haag",
        role: "Scientific Officer",
        affiliation: "Thünen Institute of Wood Research, Hamburg, Germany"
      }
    ]
  },
  imprint: {
    title: "Terms of Use",
    paragraphs: [
      {
        title: null,
        texts: [
          "Use of this site constitutes your acceptance of these Terms which take affect on the date from which you first use the site."
        ]
      },
      {
        title: "Contact",
        texts: [
          "The platform version was developed by Jakob Kusnick on the basis of Silke Lichtenberg's database () and visualized in close collaboration with Silke Lichtenberg.",
          "Adress: XXX | Phone: XXX | E-Mail:  info@musecology.net"
        ]
      },
      {
        title: "Attribution",
        texts: [
          "The platform version was developed by Jakob Kusnick on the basis of Silke Lichtenberg's database () and visualized in close collaboration with Silke Lichtenberg.",
          "<i>Kusnick, J., and Lichtenberg, S., 2026, MusEcology v1.1, Available at: <a href='https://musecology.net'>https://musecology.net</a>, Accessed DD/MM/YYYY</i>",
          "This example is for v1.1. When citing a later release, include the names of all contributors. Change the release number and access date to match the version cited."
        ]
      },
      {
        title: "No Warranty and Waiver of Liability",
        texts: [
          "While MusEcology strives to ensure accuracy and keep the data up-to-date, the information is provided to the user ‘as is’ and no warranty of any kind is given as to its completeness or accuracy. All warranties, representations and conditions, express or implied, are hereby excluded to the fullest extent permitted. The User waives and releases MusEcology from any liability whatsoever, wherever and howsoever arising in connection with any use of the data or derivative works.",
          "Under no circumstances shall MusEcology or their affiliates or licensors be liable for any direct, indirect, incidental, special, punitive, or consequential damages that result in any way from your use, non-use or reliance upon the MusEcology data, or that result from mistakes, omissions, interruptions, deletions, errors, or defects in the data, or delays in their operation, transmission or failure of performance.",
          "You further expressly acknowledge and agree that information, text, graphics, and hyperlinks provided to you through MusEcology and located on other sites throughout the internet are provided solely as a resource and a convenience to you. Such hyperlinks to other sites are not an endorsement by MusEcology of those sites. MusEcology makes no warranty, either express or implied, as to the accuracy, reliability, or content of such information, text, graphics, and hyperlinks. MusEcology has not tested any software located on other sites and it makes no representation as to the quality, safety, reliability or suitability of such software."
        ]
      },
      {
        title: "Maps and Boundaries",
        texts: [
          "MusEcology does not guarantee the accuracy of the maps available through its tool. The boundaries, colours, denominations or other information shown on maps do not imply any judgement on the part of MusEcology concerning the legal status of any country, territory, or the endorsement or acceptance of such boundaries. Users must observe the copyright and licensing provisions included with all maps. Names of countries, territories and islands are based on recommendations made through the ISO-3166 standard."
        ]
      },
      {
        title: "Privacy Policy",
        texts: [
          "MusEcology does not use analytics or tracking tools and does not set its own cookies. To display maps, images and videos, your browser connects to the third-party services listed below. In doing so, your IP address, browser information and the requested address are transmitted to these providers. Some of them are located outside the European Union, in particular in the United States. Unless stated otherwise, the legal basis is our legitimate interest in providing a functional and visually complete website (Art. 6(1)(f) GDPR)."
        ],
        items: [
          "<b>Hosting</b>: The website is hosted by Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany. The web server records access logs (IP address, date and time, requested page, browser information), which are used only to operate and secure the website.",
          "<b>Mapbox (Mapbox Inc., Washington, DC, USA)</b>: Provides the map tiles and map styles. Mapbox may also collect anonymised usage statistics. Privacy policy: https://www.mapbox.com/legal/privacy",
          "<b>YouTube (Google Ireland Limited, Dublin, Ireland)</b>: Instrument videos are embedded from YouTube. When the user plays a video, YouTube may set cookies and process usage data. Privacy policy: https://policies.google.com/privacy",
          "<b>Wikimedia Commons (Wikimedia Foundation Inc., San Francisco, USA)</b>: Images of species and instruments are loaded directly from Wikimedia servers. Privacy policy: https://foundation.wikimedia.org/wiki/Policy:Privacy_policy",
          "<b>GitHub (GitHub Inc., San Francisco, USA)</b>: When you open the “Latest Updates” panel, recent changes are retrieved from the GitHub API. Privacy policy: https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
        ]
      },
      {
        title: "Third-Party Licenses",
        texts: [],
        items: [
          "<b>Mapbox</b>: XXX",
          "<b>Icons by Font Awesome</b>: CC BY 4.0",
          "<b>CITES Logo</b>: XXX",
          "<b>IUCN Red List Logo</b>: XXX",
          "<b>BGCI Logo</b>: XXX"
        ]
      }
    ]
  },
  data: {
    title: "Data Sources",
    paragraphs: [
      {
        title: null,
        texts: [
          "MusEcology combines a curated database of musical instruments and their natural materials with openly available biodiversity, conservation and geographic data. Assessments shown in the timelines are cited individually in the app. The access dates of the crawled databases are given with each assessment."
        ]
      },
      {
        title: "Musical Instruments and Materials",
        texts: [],
        items: [
          "<b>MusEcology Instrument and Species Database</b>: Curated database linking orchestral instruments and their parts to the species used as materials, compiled by Silke Lichtenberg. <i>Lichtenberg, S., Nehren, U., Anhuf, D., Brémaud, I., de Oliveira Pinto, T., Fonseca-Kruel, V. S., … & Rosa, P. (2025). Protecting threatened species and music traditions. Frontiers in Ecology and the Environment, e2837. <a href='https://doi.org/10.1002/fee.2837'>https://doi.org/10.1002/fee.2837</a></i>",
          "<b>Thünen Institute Wood Collection</b>: Photographs of wood samples from the scientific wood collection (Xylothek), including the wood collection of Dr. Wolfgang Mautz. <i>Thünen Institute of Wood Research, Hamburg, Germany. <a href='https://www.thuenen.de/de/thuenen-institut/verbundstrukturen/thuenen-kompetenzzentrum-holzherkuenfte/die-wissenschaftliche-holzsammlung-xylothek-1'>www.thuenen.de</a></i>",
          "<b>Instrument Videos</b>: Recordings of the instruments, selected manually and embedded from <a href='https://www.youtube.com'>YouTube</a>."
        ]
      },
      {
        title: "Threat and Trade Status",
        texts: [],
        items: [
          "<b>IUCN Red List of Threatened Species</b>: Global extinction risk assessments, retrieved via the IUCN Red List API v4. <i>IUCN (2025). The IUCN Red List of Threatened Species. Version 2025-X. <a href='https://www.iucnredlist.org'>https://www.iucnredlist.org</a>. Accessed on DD/MM/YYYY.</i>",
          "<b>CITES Listings (Species+)</b>: CITES Appendix listings and trade regulations, retrieved via the Species+ API. <i>UNEP (2025). The Species+ Website. Nairobi, Kenya. Compiled by UNEP-WCMC, Cambridge, UK. Available at: <a href='https://www.speciesplus.net'>www.speciesplus.net</a>. Accessed on DD/MM/YYYY.</i>",
          "<b>BGCI ThreatSearch</b>: National and regional conservation assessments for plants. <i>BGCI (2025). ThreatSearch online database. Botanic Gardens Conservation International. Richmond, UK. Available at <a href='https://tools.bgci.org/threat_search.php'>https://tools.bgci.org/threat_search.php</a>. Accessed on DD/MM/YYYY.</i>"
        ]
      },
      {
        title: "Species Distribution",
        texts: [],
        items: [
          "<b>BGCI GlobalTreeSearch</b>: Country-level distribution of tree species. <i>BGCI (2025). GlobalTreeSearch online database. Botanic Gardens Conservation International. Richmond, UK. Available at <a href='https://tools.bgci.org/global_tree_search.php'>https://tools.bgci.org/global_tree_search.php</a>. Accessed on DD/MM/YYYY.</i>",
          "<b>Plants of the World Online (POWO) and World Checklist of Vascular Plants (WCVP)</b>: Native distribution and accepted names of plant species. <i>POWO (2025). Plants of the World Online. Facilitated by the Royal Botanic Gardens, Kew. <a href='https://powo.science.kew.org'>https://powo.science.kew.org</a>. Govaerts, R., Nic Lughadha, E., Black, N., Turner, R., & Paton, A. (2021). The World Checklist of Vascular Plants, a continuously updated resource for exploring global plant diversity. Scientific Data, 8, 215. <a href='https://doi.org/10.1038/s41597-021-00997-6'>https://doi.org/10.1038/s41597-021-00997-6</a></i>",
          "<b>Global Biodiversity Information Facility (GBIF)</b>: Occurrence records of terrestrial species. <i>GBIF.org (2025). GBIF Occurrence Download. <a href='https://doi.org/10.15468/dl.XXXXXX'>https://doi.org/10.15468/dl.XXXXXX</a>. Accessed on DD/MM/YYYY.</i>",
          "<b>Ocean Biodiversity Information System (OBIS)</b>: Occurrence records of marine species. <i>OBIS (2025). Ocean Biodiversity Information System. Intergovernmental Oceanographic Commission of UNESCO. <a href='https://obis.org'>https://obis.org</a>. Accessed on DD/MM/YYYY.</i>",
          "<b>IUCN Red List Spatial Data</b>: Range maps and point data from the IUCN Red List assessments (see citation above).",
          "<b>Manual Curation</b>: Country and ecoregion assignments reviewed by the MusEcology team where no source above provides data."
        ]
      },
      {
        title: "Geographic Base Layers",
        texts: [],
        items: [
          "<b>Country Borders and Capitals</b>: World administrative boundaries and capital cities. <i>UNHCR (2025). Geoservices. <a href='https://data.unhcr.org/en/geoservices'>https://data.unhcr.org/en/geoservices</a>.</i>",
          "<b>Terrestrial Ecoregions 2017</b>: <i>Dinerstein, E., Olson, D., Joshi, A., Vynne, C., Burgess, N. D., Wikramanayake, E., … & Saleem, M. (2017). An Ecoregion-Based Approach to Protecting Half the Terrestrial Realm. BioScience, 67(6), 534–545. <a href='https://doi.org/10.1093/biosci/bix014'>https://doi.org/10.1093/biosci/bix014</a></i>. Licensed under CC BY 4.0.",
          "<b>Marine Ecoregions of the World (MEOW)</b>: <i>Spalding, M. D., Fox, H. E., Allen, G. R., Davidson, N., Ferdaña, Z. A., Finlayson, M., … & Robertson, J. (2007). Marine Ecoregions of the World: A Bioregionalization of Coastal and Shelf Areas. BioScience, 57(7), 573–583. <a href='https://doi.org/10.1641/B570707'>https://doi.org/10.1641/B570707</a></i>",
          "<b>Hexagon Grid</b>: Artificial hexagon grid created by the MusEcology team. One hexagon corresponds to approximately 1,000 km².",
          "<b>Base Map</b>: Map tiles and styles by <a href='https://www.mapbox.com/about/maps'>© Mapbox</a>, map data <a href='https://www.openstreetmap.org/copyright'>© OpenStreetMap contributors</a>."
        ]
      },
      // {
      //   title: "Orchestras and Opera Houses",
      //   texts: [],
      //   items: [
      //     "<b>musicalchairs</b>: Directory of orchestras and opera houses worldwide, including city locations. <i>musicalchairs. Orchestras worldwide. <a href='https://www.musicalchairs.info/orchestras'>https://www.musicalchairs.info/orchestras</a>. Accessed in 12/2021.</i>"
      //   ]
      // },
      {
        title: "Images and Descriptions",
        texts: [],
        items: [
          "<b>Wikimedia Commons</b>: Photographs of species and instruments. Authors and licences are given with each image. <a href='https://commons.wikimedia.org'>https://commons.wikimedia.org</a>",
          "<b>Wikipedia and Wikidata</b>: Species descriptions, common names and image references, retrieved via the Wikipedia and Wikidata APIs. Wikipedia texts are licensed under CC BY-SA 4.0, Wikidata under CC0. <a href='https://www.wikipedia.org'>https://www.wikipedia.org</a>, <a href='https://www.wikidata.org'>https://www.wikidata.org</a>"
        ]
      }
    ]
  }
};

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
      },
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
        href:
          "https://findresearcher.sdu.dk/ws/portalfiles/portal/263852266/099-106.pdf",
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
      "A classical symphony orchestra consists of up to 29 musical instruments manufactured from up to 758 distinct natural materials. The interrelationships between the extraction of raw materials for instrument making, the international trade conditions, and the protection status of endangered species and their ecosystems are highly complex and have yet to be sufficiently scientifically examined. However, rapidly progressing climate and ecological change call for sustainable solutions.",
      "To address this challenging task, we present MusEcology, a new interactive decision support system based on visualizations. The interactive visualizations offer entry points for users of various backgrounds to explore the interrelationships between musical instruments, natural resources and ecosystems.",
      "The tool’s fundamental objectives are to guarantee that (1) data processing correlates related data resources, (2) visual interfaces and interaction schemes encourage new interdisciplinary research on complex systems interactions, and (3) high-level decision-making is supported to identify alternative pathways towards sustainable instrument making."
    ],
    people: [
      {
        name: "Silke Lichtenberg",
        role: "Ph. D. student",
        affiliation: "TH Köln – University of Applied Sciences",
        image: "/images/silke.jpg",
        imageAlt: "Silke Lichtenberg"
      },
      {
        name: "Jakob Kusnick",
        role: "Postdoctoral Fellow",
        affiliation: "University of Bergen",
        image: "/images/image001-1.jpg",
        imageAlt: "Jakob Kusnick"
      }
    ]
  },
  imprint: {
    title: "Imprint",
    paragraphs: ["We are working on this..."]
  }
};

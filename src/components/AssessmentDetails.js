import ThreatCode from "./ThreatCode";
import {
  Citation,
  formatDate,
  getAssessmentCitation
} from "./TimelineCitations";

const assessingParties = {
  CITES: {
    name: "CITES",
    logo: "/assets/logos/cites.jpg",
    link: "https://cites.org/eng"
  },
  IUCN: {
    name: "IUCN Red List",
    logo: "/assets/logos/iucn.svg",
    link: "https://www.iucnredlist.org"
  },
  BGCI: {
    name: "Botanic Gardens Conservation International",
    logo: "/assets/logos/bgci.svg",
    link: "https://www.bgci.org/resources/bgci-databases/globaltreesearch/"
  }
};

const citesChangeTypes = {
  "+": "Addition to the appendix",
  "-": "Deletion from the appendix",
  "R+": "Reservation entered",
  "R-": "Reservation withdrawn"
};

const iucnReasonsOfChange = {
  N: "Non-genuine status change",
  G: "Genuine status change",
  E: "Previous listing was an error"
};

function TaxonName({ name, author }) {
  return (
    <>
      <span className="italic">{name}</span>
      {author ? ` (${author})` : ""}
    </>
  );
}

function getCategoryLabel(assessment, element) {
  switch (assessment.assessmentType) {
    case "CITES":
      return assessment.name;
    case "IUCN":
      return element.category ?? assessment.name;
    case "BGCI":
      return element.threatened ?? assessment.name;
    default:
      return assessment.name;
  }
}

function getRows(assessment, element, colorBlind) {
  const category = (
    <span className="flex items-center gap-2">
      <ThreatCode
        type={assessment.assessmentType.toLowerCase()}
        code={assessment.abbreviation}
        colorBlind={colorBlind}
      />
      {getCategoryLabel(assessment, element)}
    </span>
  );

  switch (assessment.assessmentType) {
    case "CITES":
      return [
        ["Appendix", category],
        ["Listing change", citesChangeTypes[element.change_type]],
        [
          "Effective from",
          element.effective_at && formatDate(element.effective_at)
        ],
        [
          "Current listing",
          element.is_current != null && (element.is_current ? "Yes" : "No")
        ],
        ["Party", element.appendix === "III" && element.party?.name],
        ["Annotation", element.annotation],
        [
          "Annotation for traded commodities",
          element.hash_annotation &&
            `${element.hash_annotation.symbol} ${element.hash_annotation.note}`
        ]
      ];
    case "IUCN":
      return [
        ["Category", category],
        ["Published", element.year],
        [
          "Assessed on",
          element.assessmentDate &&
            formatDate(element.assessmentDate.substring(0, 10))
        ],
        ["Status change", iucnReasonsOfChange[element.reasonOfChange]]
      ];
    case "BGCI":
      return [
        ["Threat status", category],
        ["Assessment year", element.year],
        ["Scope", element.bgciScope],
        ["Reference", element.reference]
      ];
    default:
      return [];
  }
}

export default function AssessmentDetails(props) {
  const { assessment, element, species, author, colorBlind } = props;

  const party = assessingParties[assessment.assessmentType];

  const rows = [
    ["Species", <TaxonName name={species} author={author} />],
    [
      "Listed as",
      element.foundBy && (
        <TaxonName
          name={element.foundBy.taxonName}
          author={element.foundBy.author}
        />
      )
    ],
    ...getRows(assessment, element, colorBlind),
    [
      "Citation",
      <Citation
        citation={getAssessmentCitation(assessment.assessmentType, element)}
      />
    ]
  ].filter(([, value]) => value != null && value !== false && value !== "");

  return (
    <div className="flex max-h-[80vh] w-[min(80vw,600px)] flex-col gap-4 overflow-y-auto p-4 text-sm">
      {party && (
        <a
          href={party.link}
          target="_blank"
          rel="noreferrer"
          title={`Open the website of ${party.name}`}
          className="self-start"
        >
          <img src={party.logo} alt={party.name} className="h-20 w-auto" />
        </a>
      )}
      <table>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="w-auto whitespace-nowrap px-2 py-1 align-top font-bold">
                {label}
              </td>
              <td className="w-auto px-2 py-1 align-top">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useMemo } from "react";

export function formatDate(dateString) {
  if (dateString == null) {
    return "2025";
  }
  const [year, month, day] = dateString.split("-"); // Split by "-"
  return `${day}/${month}/${year}`; // Rearrange in DD/MM/YYYY format
}

export function getAssessmentCitation(assessmentType, element) {
  let date = "";
  switch (assessmentType) {
    case "CITES":
      date = element.accessDate;
      return {
        text: `UNEP (${
          date != null ? date.substring(0, 4) : "2025"
        }). The Species+ Website. Nairobi, Kenya. Compiled by UNEP-WCMC, Cambridge, UK. Available at: www.speciesplus.net. Accessed on ${formatDate(
          date
        )}.`
      };
    case "BGCI":
      date = element.accessDate;
      return {
        text: `BGCI. ${
          date != null ? date.substring(0, 4) : "2025"
        }. ThreatSearch online database. Botanic Gardens Conservation International. Richmond, UK. Available at https://tools.bgci.org/threat_search.php. Accessed on ${formatDate(
          date
        )}.`
      };
    case "IUCN":
      return { text: `${element.cite} `, url: element.url };
    default:
      return null;
  }
}

export function Citation({ citation }) {
  if (citation == null) {
    return null;
  }
  return (
    <div>
      {citation.text}
      {citation.url && (
        <a
          target="_blank"
          rel="noreferrer"
          href={citation.url}
          className="text-[var(--highlightpurple)] underline"
        >
          {citation.url}
        </a>
      )}
    </div>
  );
}

export default function TimelineCitations(props) {
  const { data, width } = props;

  const citations = useMemo(() => {
    const unique = new Map();
    [
      ["CITES", data.cites],
      ["IUCN", data.iucn],
      ["BGCI", data.bgci]
    ].forEach(([type, assessments]) => {
      [...(assessments ?? [])]
        .sort((a, b) => parseInt(a.element.year) - parseInt(b.element.year))
        .forEach((assessmentAndElement) => {
          const citation = getAssessmentCitation(
            type,
            assessmentAndElement.element
          );
          if (citation != null) {
            const key = `${citation.text}${citation.url ?? ""}`;
            if (!unique.has(key)) {
              unique.set(key, citation);
            }
          }
        });
    });
    return [...unique.values()];
  }, [data]);

  if (citations.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-1 px-[5px] pt-3 pb-2 text-xs"
      style={{ maxWidth: width }}
    >
      <div className="font-bold">Data sources of the threat assessments</div>
      <ul className="flex list-disc flex-col gap-1 pl-4">
        {citations.map((citation) => (
          <li key={`${citation.text}${citation.url ?? ""}`}>
            <Citation citation={citation} />
          </li>
        ))}
      </ul>
    </div>
  );
}

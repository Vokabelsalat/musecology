import {
  iucnAssessment,
  bgciAssessment,
  citesAssessment
} from "../utils/timelineUtils";

export default function ThreatCode(props) {
  const { type, code, colorBlind } = props;

  let assessment = null;
  switch (type) {
    case "iucn":
      assessment = iucnAssessment.get(code);
      break;
    case "bgci":
      assessment = bgciAssessment.get(code);
      break;
    case "cites":
      assessment = citesAssessment.get(code);
      break;
    default:
      assessment = iucnAssessment.dataDeficient;
      break;
  }

  return (
    <div
      className="rounded"
      style={{
        display: "inline-block",
        backgroundColor: assessment.getColor(colorBlind),
        color: assessment.getForegroundColor(colorBlind),
        padding: "0 3px",
        width: "30px",
        textAlign: "center"
      }}
    >
      {code}
    </div>
  );
}

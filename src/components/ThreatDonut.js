import compareThreatCategories from "../utils/compareThreatCategories";

const polarPoint = (radius, angle, center) => ({
  x: center + radius * Math.cos(angle),
  y: center + radius * Math.sin(angle)
});

const donutSegment = (start, end, outerRadius, innerRadius, center) => {
  const startAngle = 2 * Math.PI * (start - 0.25);
  const endAngle = 2 * Math.PI * (end - 0.25);
  const outerStart = polarPoint(outerRadius, startAngle, center);
  const outerEnd = polarPoint(outerRadius, endAngle, center);
  const innerStart = polarPoint(innerRadius, startAngle, center);
  const innerEnd = polarPoint(innerRadius, endAngle, center);
  const largeArc = end - start > 0.5 ? 1 : 0;

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z"
  ].join(" ");
};

export default function ThreatDonut({
  distribution,
  total,
  data,
  getThreatLevel,
  threatType,
  colorBlind,
  showThreatDonuts = true,
  labelFontSize,
  size = 76
}) {
  // Orchestra and center-panel charts provide species; map tooltips provide
  // an already grouped distribution.
  if (distribution == null && data != null) {
    const grouped = new Map();
    for (const species of Object.keys(data)) {
      const threat = getThreatLevel(species, threatType);
      if (!threat) continue;

      const category = grouped.get(threat.abbreviation) ?? {
        abbreviation: threat.abbreviation,
        name: threat.name,
        color: threat.getColor(colorBlind),
        numvalue: threat.numvalue,
        sort: threat.sort,
        count: 0
      };
      category.count += 1;
      grouped.set(threat.abbreviation, category);
    }
    distribution = [...grouped.values()];
    total = distribution.reduce((sum, category) => sum + category.count, 0);
  }

  const categories = (distribution ?? [])
    .filter((category) => category.count > 0)
    .sort(compareThreatCategories);

  const speciesTotal = total ?? 0;
  let offset = 0;
  const center = size / 2;
  const outerRadius = center - 2;
  const innerRadius = outerRadius * 0.62;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${speciesTotal.toLocaleString()} species by threat category`}
      style={{ display: "block" }}
    >
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="#f3f4f6"
        stroke="#d1d5db"
      />
      {speciesTotal > 0 &&
        categories.map((category) => {
          const start = offset / speciesTotal;
          offset += category.count;
          // Avoid a coincident arc when a single category occupies the circle.
          const end = Math.min(offset / speciesTotal, 0.999999);
          return (
            <path
              key={`${category.abbreviation}-${category.name}`}
              d={donutSegment(start, end, outerRadius, innerRadius, center)}
              fill={showThreatDonuts === "white" ? "white" : category.color}
              stroke={showThreatDonuts === "white" ? "gray" : "none"}
            />
          );
        })}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 1}
        fill="white"
        stroke={showThreatDonuts === "white" ? "gray" : "none"}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={
          labelFontSize ??
          (size < 20 ? 5 : size < 50 ? 9 : speciesTotal >= 1000 ? 12 : 14)
        }
        // fontWeight="600"
        fill="#171717"
      >
        {data == null || speciesTotal > 0 ? speciesTotal.toLocaleString() : ""}
      </text>
    </svg>
  );
}

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

export default function ThreatDonut({ distribution = [], total = 0, size = 76 }) {
  const categories = distribution.filter((category) => category.count > 0);
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
      aria-label={`${total.toLocaleString()} species by threat category`}
    >
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="#f3f4f6"
        stroke="#d1d5db"
      />
      {total > 0 &&
        categories.map((category) => {
          const start = offset / total;
          offset += category.count;
          // Avoid a coincident arc when a single category occupies the circle.
          const end = Math.min(offset / total, 0.999999);
          return (
            <path
              key={`${category.abbreviation}-${category.name}`}
              d={donutSegment(start, end, outerRadius, innerRadius, center)}
              fill={category.color}
            />
          );
        })}
      <circle cx={center} cy={center} r={innerRadius - 1} fill="white" />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={total >= 1000 ? 12 : 14}
        fontWeight="600"
        fill="#171717"
      >
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

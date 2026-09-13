// ThreatLevel.numvalue selects the shared color palette across assessment
// schemes; sort only ranks categories within their own scheme.
export default function compareThreatCategories(a, b) {
  const colorOrder =
    (a.numvalue ?? a.sort ?? Infinity) - (b.numvalue ?? b.sort ?? Infinity);
  const levelOrder = (a.sort ?? Infinity) - (b.sort ?? Infinity);
  return (
    colorOrder ||
    levelOrder ||
    String(a.abbreviation ?? "").localeCompare(String(b.abbreviation ?? ""))
  );
}

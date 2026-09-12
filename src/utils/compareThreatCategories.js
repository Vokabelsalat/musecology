// ThreatLevel.numvalue selects the shared color palette across assessment
// schemes; sort only ranks categories within their own scheme.
export default function compareThreatCategories(a, b) {
  const colorOrder =
    (b.numvalue ?? b.sort ?? Infinity) - (a.numvalue ?? a.sort ?? Infinity);
  const levelOrder = (b.sort ?? Infinity) - (a.sort ?? Infinity);
  return (
    colorOrder ||
    levelOrder ||
    String(a.abbreviation ?? "").localeCompare(String(b.abbreviation ?? ""))
  );
}

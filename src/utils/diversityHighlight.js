export function getDiversityRange(scale, index) {
  const lower = scale[index]?.scaleValue;
  if (lower == null) return null;
  return { lower, upper: scale[index + 1]?.scaleValue };
}

export function getDiversityFilter(property, range, categorical = false) {
  const value = ["get", property];
  if (categorical) return ["==", value, range.lower];
  return [
    "all",
    [">=", value, range.lower],
    ...(range.upper == null ? [] : [["<", value, range.upper]])
  ];
}

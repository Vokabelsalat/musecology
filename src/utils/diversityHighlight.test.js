import { getDiversityFilter, getDiversityRange } from "./diversityHighlight";

const scale = [0, 2, 5].map((scaleValue) => ({ scaleValue }));

test("numeric swatches select non-overlapping count ranges", () => {
  expect(getDiversityFilter("speciesCount", getDiversityRange(scale, 1))).toEqual([
    "all",
    [">=", ["get", "speciesCount"], 2],
    ["<", ["get", "speciesCount"], 5]
  ]);
  expect(getDiversityFilter("speciesCount", getDiversityRange(scale, 2))).toEqual([
    "all",
    [">=", ["get", "speciesCount"], 5]
  ]);
});

test("protection swatches select their exact category", () => {
  expect(getDiversityFilter("NNH", getDiversityRange(scale, 1), true)).toEqual([
    "==",
    ["get", "NNH"],
    2
  ]);
});

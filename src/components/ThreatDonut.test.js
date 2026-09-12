import { render } from "@testing-library/react";
import ThreatDonut from "./ThreatDonut";

const assessments = {
  gray: {
    abbreviation: "DD",
    name: "Data Deficient",
    numvalue: 4,
    sort: 4,
    color: "gray"
  },
  orangeIucn: {
    abbreviation: "CR",
    name: "Critically Endangered",
    numvalue: 1,
    sort: 3,
    color: "orange"
  },
  green: {
    abbreviation: "LC",
    name: "Least Concern",
    numvalue: 3,
    sort: 7,
    color: "green"
  },
  orangeBgci: {
    abbreviation: "TH",
    name: "Threatened",
    numvalue: 1,
    sort: 1,
    color: "orange"
  },
  red: {
    abbreviation: "EX",
    name: "Extinct",
    numvalue: 0,
    sort: 0,
    color: "red"
  }
};

const expectedColors = ["red", "orange", "orange", "green", "gray"];

test("groups matching threat colors for species-backed donuts", () => {
  const { container } = render(
    <ThreatDonut
      data={Object.fromEntries(
        Object.keys(assessments).map((name) => [name, {}])
      )}
      getThreatLevel={(species) => ({
        ...assessments[species],
        getColor: () => assessments[species].color
      })}
    />
  );

  expect(
    [...container.querySelectorAll("path")].map((path) =>
      path.getAttribute("fill")
    )
  ).toEqual(expectedColors);
});

test("groups matching threat colors for map distributions", () => {
  const distribution = Object.values(assessments).map((assessment) => ({
    ...assessment,
    count: 1
  }));
  const { container } = render(
    <ThreatDonut distribution={distribution} total={5} />
  );

  expect(
    [...container.querySelectorAll("path")].map((path) =>
      path.getAttribute("fill")
    )
  ).toEqual(expectedColors);
});

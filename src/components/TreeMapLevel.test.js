import { fireEvent, render } from "@testing-library/react";
import TreeMapLevel from "./TreeMapLevel";

test("hovering a species image in a grouped genus highlights every species", () => {
  const group = {
    data: { name: "Genus", filterDepth: 3 },
    parent: null,
    x0: 0,
    y0: 0,
    x1: 100,
    y1: 50,
    value: 2
  };
  const species = ["Genus alpha", "Genus beta"].map((name, index) => ({
    data: { name, filterDepth: 4 },
    parent: group,
    x0: index * 50,
    y0: 0,
    x1: (index + 1) * 50,
    y1: 50,
    value: 1
  }));
  species.forEach((node) => {
    node.leaves = () => [node];
  });
  group.children = species;
  group.leaves = () => species;

  const setHoveredSpecies = jest.fn();
  const { container } = render(
    <TreeMapLevel node={group} setHoveredSpecies={setHoveredSpecies} />
  );
  const tiles = container.querySelectorAll(
    ".treeMapLevel > div[style*='background-color: gray']"
  );

  fireEvent.mouseEnter(tiles[0]);
  expect(setHoveredSpecies).toHaveBeenLastCalledWith([
    "Genus alpha",
    "Genus beta"
  ]);

  fireEvent.mouseLeave(container.querySelector(".treeMapLevel"));
  expect(setHoveredSpecies).toHaveBeenLastCalledWith(null);
});

test("hovering a genus image in a grouped family highlights the whole family", () => {
  const family = {
    data: { name: "Family", filterDepth: 2 },
    parent: null,
    x0: 0,
    y0: 0,
    x1: 100,
    y1: 50,
    value: 3
  };
  const genera = ["Genus A", "Genus B"].map((name, index) => ({
    data: { name, filterDepth: 3 },
    parent: family,
    x0: index * 50,
    y0: 0,
    x1: (index + 1) * 50,
    y1: 50,
    value: index === 0 ? 2 : 1
  }));
  const species = ["Genus alpha", "Genus beta", "Other gamma"].map(
    (name, index) => ({
      data: { name, filterDepth: 4 },
      parent: genera[index === 2 ? 1 : 0],
      x0: 0,
      y0: 0,
      x1: 50,
      y1: 50,
      value: 1
    })
  );
  genera[0].children = species.slice(0, 2);
  genera[1].children = species.slice(2);
  family.children = genera;
  family.leaves = () => species;

  const setHoveredSpecies = jest.fn();
  const { container } = render(
    <TreeMapLevel node={family} setHoveredSpecies={setHoveredSpecies} />
  );
  const genusImage = container.querySelector(
    ".treeMapLevel > div[style*='background-color: gray']"
  );

  fireEvent.mouseEnter(genusImage);
  expect(setHoveredSpecies).toHaveBeenLastCalledWith([
    "Genus alpha",
    "Genus beta",
    "Other gamma"
  ]);
});

import { fireEvent, render, screen } from "@testing-library/react";
import DiversityScale from "./DiversityScale";

jest.mock("../utils/timelineUtils", () => ({
  iucnAssessment: {
    get: () => ({ getColor: () => "gray" })
  }
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test("hovering a scale swatch reports its map mode and segment", () => {
  const onSegmentHover = jest.fn();
  render(
    <DiversityScale
      scales={{
        type: "countries",
        scale: [
          { scaleValue: 0, scaleColor: "white" },
          { scaleValue: 2, scaleColor: "blue" }
        ]
      }}
      onSegmentHover={onSegmentHover}
      setMapMode={() => {}}
    />
  );

  const swatch = screen.getByRole("button", {
    name: "Highlight countries with 2 or more"
  });
  fireEvent.mouseEnter(swatch);
  expect(onSegmentHover).toHaveBeenLastCalledWith({
    type: "countries",
    index: 1
  });

  fireEvent.mouseLeave(swatch);
  expect(onSegmentHover).toHaveBeenLastCalledWith(null);
});

import { fireEvent, render, screen } from "@testing-library/react";
import OrchestraNew from "./Orchestra";
import OrchestraInstrumentSlice from "./OrchestraInstrumentSlice";

const instrumentData = {
  Piano: { Keys: ["Species A"], Body: ["Species B"] },
  Organ: { Pipes: ["Species C"] }
};

test("orchestra group, instrument, and part hover use their respective species", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 500,
    height: 500
  });
  const setHoveredSpecies = jest.fn();

  try {
    const { container } = render(
      <OrchestraNew
        width={600}
        height={400}
        instrumentData={instrumentData}
        instrumentGroupData={{ Keyboard: ["Piano", "Organ"] }}
        instrumentGroup="Keyboard"
        instrument="Piano"
        instrumentVideos={{}}
        showThreatDonuts={false}
        setHoveredSpecies={setHoveredSpecies}
        setInstrument={() => {}}
        setInstrumentGroup={() => {}}
        setInstrumentPart={() => {}}
      />
    );

    fireEvent.mouseEnter(container.querySelector(".orchestraGroupGroup"));
    expect(setHoveredSpecies).toHaveBeenLastCalledWith([
      "Species A",
      "Species B",
      "Species C"
    ]);

    fireEvent.mouseEnter(screen.getByText("Instrument Group").parentElement);
    expect(setHoveredSpecies).toHaveBeenLastCalledWith([
      "Species A",
      "Species B",
      "Species C"
    ]);

    fireEvent.mouseEnter(screen.getByText("Instrument").parentElement);
    expect(setHoveredSpecies).toHaveBeenLastCalledWith([
      "Species A",
      "Species B"
    ]);

    fireEvent.mouseEnter(screen.getByText(/Keys \(1\)/));
    expect(setHoveredSpecies).toHaveBeenLastCalledWith(["Species A"]);
  } finally {
    SVGElement.prototype.getBBox = originalGetBBox;
  }
});

test("leaving an instrument slice restores its group species", () => {
  const setHoveredSpecies = jest.fn();
  const { container } = render(
    <svg>
      <OrchestraInstrumentSlice
        position={{ x: 100, y: 100 }}
        arcOptions={{ width: 50, strokeWidth: 20, start: 0, end: 90 }}
        width={50}
        groupName="Keyboard"
        instrument="Piano"
        species={{ Piano: ["Species A", "Species B"] }}
        groupSpecies={["Species A", "Species B", "Species C"]}
        showThreatDonuts={false}
        setHoveredSpecies={setHoveredSpecies}
      />
    </svg>
  );

  fireEvent.mouseEnter(container.querySelector("g"));
  expect(setHoveredSpecies).toHaveBeenLastCalledWith([
    "Species A",
    "Species B"
  ]);

  fireEvent.mouseLeave(container.querySelector("g"));
  expect(setHoveredSpecies).toHaveBeenLastCalledWith([
    "Species A",
    "Species B",
    "Species C"
  ]);
});

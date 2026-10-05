import { fireEvent, render, screen } from "@testing-library/react";
import OrchestraNew from "./Orchestra";
import OrchestraGroup from "./OrchestraGroup";
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

test("selected group shows families, selected family shows its instruments", () => {
  const setInstrumentGroup = jest.fn();
  const setInstrumentFamily = jest.fn();
  const setInstrument = jest.fn();
  const setInstrumentPart = jest.fn();
  const SVGElementGetBBox = SVGElement.prototype.getBBox;
  SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 1, height: 1 });
  const groupProps = {
    id: "keyboard",
    groupName: "Keyboard",
    position: { x: 255, y: 255 },
    positionID: 0,
    instruments: ["Piano", "Organ"],
    families: { Pianos: ["Piano"], Organs: ["Organ"] },
    species: { Piano: ["Species A"], Organ: ["Species B"] },
    showThreatDonuts: false,
    setZoom: () => {},
    setInstrumentGroup,
    setInstrumentFamily,
    setInstrument,
    setInstrumentPart
  };

  try {
    const { container, rerender } = render(
      <svg>
        <OrchestraGroup {...groupProps} selected={false} />
      </svg>
    );
    const group = container.querySelector(".orchestraGroupGroup");

    fireEvent.mouseEnter(group);
    expect(screen.queryByText("Pianos")).not.toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();

    rerender(
      <svg>
        <OrchestraGroup {...groupProps} selected={true} />
      </svg>
    );
    expect(screen.getByText("Pianos")).toBeInTheDocument();
    expect(screen.getByText("Organs")).toBeInTheDocument();
    expect(screen.queryByText("Piano")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Pianos").closest("g"));
    expect(setInstrumentFamily).toHaveBeenCalledWith("Pianos");
    expect(setInstrument).toHaveBeenCalledWith(null);
    expect(setInstrumentGroup).not.toHaveBeenCalled();

    rerender(
      <svg>
        <OrchestraGroup
          {...groupProps}
          selected={true}
          instrumentFamily="Pianos"
        />
      </svg>
    );
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.queryByText("Organ")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Piano").closest("g"));
    expect(setInstrumentGroup).toHaveBeenCalledWith("Keyboard");
    expect(setInstrument).toHaveBeenLastCalledWith("Piano");
  } finally {
    SVGElement.prototype.getBBox = SVGElementGetBBox;
  }
});

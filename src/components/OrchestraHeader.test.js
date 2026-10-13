import { fireEvent, render, screen } from "@testing-library/react";
import OrchestraHeader from "./OrchestraHeader";

const image = (n) => ({
  title: `File:Piano ${n}.jpg`,
  thumb: `https://example.org/piano${n}.jpg`,
  page: `https://commons.wikimedia.org/wiki/File:Piano_${n}.jpg`,
  author: `Author ${n}`,
  license: "CC BY-SA 4.0"
});

test("instrument shows photo carousel and video tab", () => {
  render(
    <OrchestraHeader
      instrument="Piano"
      instrumentVideos={{ Piano: { solo: "https://youtu.be/abc" } }}
      instrumentImages={{ Piano: { images: [image(1), image(2)] } }}
      setInstrument={() => {}}
      setInstrumentPart={() => {}}
    />
  );

  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "https://example.org/piano1.jpg"
  );
  expect(screen.getByText(/Author 1, CC BY-SA 4.0/)).toHaveAttribute(
    "href",
    "https://commons.wikimedia.org/wiki/File:Piano_1.jpg"
  );

  fireEvent.click(document.querySelector(".imageSliderButtonDivRight"));
  expect(screen.getByText(/Author 2, CC BY-SA 4.0/)).toBeInTheDocument();

  fireEvent.click(screen.getByText("Videos"));
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("solo")).toBeInTheDocument();
});

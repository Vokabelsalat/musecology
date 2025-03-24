import { useContext } from "react";
import { OverlayContext } from "./OverlayProvider";

export default function Footer() {
  const [overlay, setOverlay] = useContext(OverlayContext);

  return (
    <div
      style={{
        gridColumnStart: 1,
        gridColumnEnd: "span 2",
        gridRowStart: 4,
        gridRowEnd: 4
      }}
      className="grid grid-cols-4 w-full grid-rows-1 px-7 text-sm border-t border-gray-200"
    >
      <a className="hover:font-bold" href="/">
        &copy; MusEcology
      </a>
      <div
        className="cursor-pointer hover:font-bold px-4"
        onClick={() => {
          setOverlay(
            <div className="max-w-[50vw] max-h-[80vh] p-4">
              <div className="font-bold text-xl mb-4">About MusEcology</div>
              <div>
                A classical symphony orchestra consists of up to 29 musical
                instruments manufactured from up to 758 distinct natural
                materials. The interrelationships between the extraction of raw
                materials for instrument making, the international trade
                conditions, and the protection status of endangered species and
                their ecosystems are highly complex and have yet to be
                sufficiently scientifically examined. However, rapidly
                progressing climate and ecological change call for sustainable
                solutions. To address this challenging task, we present
                MusEcology, a new interactive decision support system based on
                visualizations. The interactive visualizations offer entry
                points for users of various backgrounds to explore the
                interrelationships between musical instruments, natural
                resources and ecosystems. The tool’s fundamental objectives are
                to guarantee that the (1) data processing correlates related
                data resources, that (2) visual interfaces and interaction
                schemes encourage new interdisciplinary research on complex
                systems interactions, and that (3) high-level decision-making is
                supported to identify alternative pathways towards sustainable
                instrument making.
              </div>
              <div className="grid grid-cols-2 w-full p-2 mt-4 gap-4">
                <div className="grid grid-cols-2 grid-rows-1 gap-4">
                  <div className="row-span-3 row-start-1">
                    <img className="h-full object-cover" src="/silke.jpg" />
                  </div>
                  <div>
                    <div className="font-bold">Silke Lichtenberg</div>
                    <div>Ph. D. student</div>
                    <div>TH Köln – University of Applied Sciences</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 grid-rows-1 gap-4">
                  <div className="row-span-3 row-start-1">
                    <img
                      className="h-full object-cover"
                      src="/image001-1.jpg"
                    />
                  </div>
                  <div>
                    <div className="font-bold">Jakob Kusnick</div>
                    <div>Postdoctoral Student</div>
                    <div>University of Southern Denmark</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      >
        About
      </div>
      <div
        className="cursor-pointer hover:font-bold px-4"
        onClick={() => {
          setOverlay(
            <div className="max-w-[50vw] p-4 flex flex-col gap-4">
              <div className="font-bold text-xl">Publications</div>
              <div>
                Lichtenberg, S., Nehren, U., Anhuf, D., Brémaud, I., de Oliveira
                Pinto, T., Fonseca‐Kruel, V. S., ... & Rosa, P. (2025). <br />
                Protecting threatened species and music traditions. <br />
                Frontiers in Ecology and the Environment, e2837.{" "}
                <a href="https://doi.org/10.1002/fee.2837" target="_blank">
                  https://doi.org/10.1002/fee.2837
                </a>
              </div>
              <div>
                Kusnick, J., Lichtenberg, S., Wiegreffe, D., Huber-Sannwald, E.,
                Nehren, U., & Jänicke, S. (2024). <br /> Visual analysis of
                diversity and threat status of natural materials for musical
                instruments. <br />
                Frontiers in Environmental Science, 12, 1406376.{" "}
                <a
                  href="https://doi.org/10.3389/fenvs.2024.1406376"
                  target="_blank"
                >
                  https://doi.org/10.3389/fenvs.2024.1406376
                </a>
              </div>{" "}
              <div>
                Kusnick, J., Lichtenberg, S., & Jänicke, S. (2023).
                <br /> Visualization-based Scrollytelling of Coupled Threats for
                Biodiversity, Species and Music Cultures. <br />
                In Workshop on Visualisation in Environmental Sciences. The
                Eurographics Association.{" "}
                <a
                  href="https://findresearcher.sdu.dk/ws/portalfiles/portal/263852266/099-106.pdf"
                  target="_blank"
                >
                  https://doi.org/10.2312/envirvis.20231112
                </a>
              </div>{" "}
            </div>
          );
        }}
      >
        Publications
      </div>
      <div
        className="cursor-pointer hover:font-bold px-4"
        onClick={() => {
          setOverlay(
            <div className="max-w-[50vw] p-4">
              <div className="font-bold text-xl mb-4">Imprint</div>
              <div>We are working on this...</div>
            </div>
          );
        }}
      >
        Imprint
      </div>
    </div>
  );
}

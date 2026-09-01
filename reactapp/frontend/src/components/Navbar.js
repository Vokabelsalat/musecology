import { useContext } from "react";
import { OverlayContext } from "./OverlayProvider";
import AboutOverlayContent from "./Navbar/AboutOverlayContent";
import ImprintOverlayContent from "./Navbar/ImprintOverlayContent";
import PublicationsOverlayContent from "./Navbar/PublicationsOverlayContent";
import StoriesOverlayContent from "./Navbar/StoriesOverlayContent";
import { navbarOverlayContent } from "./Navbar/navbarOverlayContent";

const navigationItems = [
  {
    label: "Stories",
    Content: StoriesOverlayContent,
    content: navbarOverlayContent.stories
  },
  {
    label: "Publications",
    Content: PublicationsOverlayContent,
    content: navbarOverlayContent.publications
  },
  {
    label: "About",
    Content: AboutOverlayContent,
    content: navbarOverlayContent.about
  },
  {
    label: "Imprint",
    Content: ImprintOverlayContent,
    content: navbarOverlayContent.imprint
  }
];

export default function Navbar() {
  const [, setOverlay] = useContext(OverlayContext);

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        gridColumnStart: 1,
        gridColumnEnd: "span 2"
      }}
      className="grid grid-cols-5 w-full items-center grid-rows-1 px-7 border-b border-gray-200 z-[9999] h-[40px]"
    >
      <a className="hover:font-bold text-xl text-black" href="/">
        MusEcology
      </a>
      {navigationItems.map(({ label, Content, content }) => (
        <button
          aria-haspopup="dialog"
          className="h-full border-r border-gray-200 bg-transparent px-4 text-center text-black hover:font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--highlightpurple)]"
          key={label}
          type="button"
          onClick={() => setOverlay(<Content content={content} />)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

import NavbarOverlayPanel from "./NavbarOverlayPanel";
import parseFormattedText from "../../utils/parseFormattedText";

export default function ImprintOverlayContent({ content }) {
  return (
    <NavbarOverlayPanel title={content.title}>
      <div className="space-y-4 leading-7 text-gray-700">
        {content.paragraphs.map((paragraph, i) => (
          <>
            <p className="font-bold text-lg" key={`para-${i}-title`}>
              {parseFormattedText(paragraph.title)}
            </p>
            {paragraph.texts.map((text, t) => (
              <p key={`para-${i}-text-${t}`}>{parseFormattedText(text)}</p>
            ))}
            {paragraph.items && (
              <ul className="list-disc space-y-2 pl-5" key={`para-${i}-items`}>
                {paragraph.items.map((item, j) => (
                  <li key={`para-${i}-item-${j}`}>
                    {parseFormattedText(item)}
                  </li>
                ))}
              </ul>
            )}
          </>
        ))}
      </div>
    </NavbarOverlayPanel>
  );
}

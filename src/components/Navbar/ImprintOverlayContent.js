import NavbarOverlayPanel from "./NavbarOverlayPanel";

export default function ImprintOverlayContent({ content }) {
  return (
    <NavbarOverlayPanel title={content.title}>
      <div className="space-y-4 leading-7 text-gray-700">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </NavbarOverlayPanel>
  );
}

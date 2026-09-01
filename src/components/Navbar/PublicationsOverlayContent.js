import NavbarOverlayPanel from "./NavbarOverlayPanel";

export default function PublicationsOverlayContent({ content }) {
  return (
    <NavbarOverlayPanel title={content.title}>
      <ol className="space-y-6">
        {content.entries.map((entry) => (
          <li
            className=""
            key={entry.href}
          >
            <h3 className="font-semibold leading-6">{entry.title}</h3>
            <p className="mt-1 leading-6 text-gray-700">{entry.authors}</p>
            <p className="leading-6 text-gray-700">{entry.publication}</p>
            <a
              className="mt-1 inline-block break-all text-[var(--highlightpurple)] hover:underline"
              href={entry.href}
              target="_blank"
              rel="noreferrer"
            >
              {entry.linkLabel}
            </a>
          </li>
        ))}
      </ol>
    </NavbarOverlayPanel>
  );
}

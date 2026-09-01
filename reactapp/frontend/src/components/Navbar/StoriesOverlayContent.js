import NavbarOverlayPanel from "./NavbarOverlayPanel";

export default function StoriesOverlayContent({ content }) {
  return (
    <NavbarOverlayPanel title={content.title}>
      {content.description && (
        <p className="mb-5 leading-7 text-gray-700">{content.description}</p>
      )}
      <ul className="divide-y divide-gray-200 border-y border-gray-200">
        {content.links.map((link) => (
          <li key={link.href}>
            <a
              className="block py-3 text-[var(--highlightpurple)] hover:underline"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="py-3">
        Do you want to create your own story?
        <a
            className="block text-[var(--highlightpurple)] hover:underline"
            href="/storyeditor"
            target="_blank"
            rel="noreferrer"
          >
        Use our Story Editor!
        </a>
      </div>
    </NavbarOverlayPanel>
  );
}

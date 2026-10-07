import NavbarOverlayPanel from "./NavbarOverlayPanel";

export default function AboutOverlayContent({ content }) {
  return (
    <NavbarOverlayPanel title={content.title}>
      <div className="space-y-4 leading-7 text-gray-700">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-5 grid gap-5 border-t border-gray-200 pt-6 md:grid-cols-2">
        {content.people.map((person) => (
          <article
            className="grid grid-cols-[88px_1fr] gap-4"
            key={person.name}
          >
            <img
              className="h-24 w-[88px] rounded-sm object-cover"
              src={person.image}
              alt={person.imageAlt}
            />
            <div>
              <h3 className="font-semibold">{person.name}</h3>
              <p className="mt-1 text-sm text-gray-700">{person.role}</p>
              <p className="mt-1 text-sm leading-5 text-gray-700">
                {person.affiliation}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3 border-t border-gray-200 pt-4 md:grid-cols-2 text-sm">
        {content.specialpeople.map((person) => (
          <article className="flex" key={person.name}>
            <div>
              <h3 className="font-semibold">{person.name}</h3>
              <p className="mt-0.5 text-xs text-gray-700">{person.role}</p>
              <p className="mt-0.5 text-xs leading-5 text-gray-700">
                {person.affiliation}
              </p>
            </div>
          </article>
        ))}
      </div>
    </NavbarOverlayPanel>
  );
}

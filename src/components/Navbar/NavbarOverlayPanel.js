export default function NavbarOverlayPanel({ title, children }) {
  return (
    <section className="scrollbar-hidden max-h-[95vh] w-auto max-w-[95vw] overflow-y-auto rounded-md bg-white p-6 text-left text-[var(--black)] shadow-xl">
      <h2 className="mb-5 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

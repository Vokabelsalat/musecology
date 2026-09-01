export default function NavbarOverlayPanel({ title, children }) {
  return (
    <section className="max-h-[80vh] w-[92vw] max-w-[760px] overflow-y-auto rounded-md bg-white p-6 text-left text-[var(--black)] shadow-xl">
      <h2 className="mb-5 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

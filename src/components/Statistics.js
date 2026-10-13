import { Fragment, useEffect, useMemo, useState } from "react";
import { iucnAssessment } from "../utils/timelineUtils";

const IUCN_ORDER = [
  "EX",
  "EW",
  "CR",
  "EN",
  "VU",
  "NT",
  "LC",
  "DD",
  "Not assessed"
];
const ECOSYSTEMS = { T: "Terrestrial", M: "Marine", F: "Freshwater" };
const COUNTRY_SOURCES = {
  treeCountries: "BGCI GlobalTreeSearch",
  iucnCountries: "IUCN Red List",
  powoCountries: "POWO",
  manualCountries: "Manual curation",
  none: "No source"
};

const iucnColor = (code) =>
  iucnAssessment.get(code)?.getColor() ?? iucnAssessment.get("DD").getColor();

const percent = (value, total) =>
  total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "–";

function Section({ title, children }) {
  return (
    <section className="py-6 border-b">
      <h2 className="text-xl font-bold pb-3">{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b">
            {head.map((h, i) => (
              <th key={i} className="font-bold py-1 pr-4 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function SortHeader({ label, column, sort, setSort }) {
  const active = sort.column === column;
  return (
    <span
      className="cursor-pointer select-none"
      onClick={() =>
        setSort({
          column,
          descending: active ? !sort.descending : column === "speciesCount"
        })
      }
    >
      {label}
      {active ? (sort.descending ? " ↓" : " ↑") : ""}
    </span>
  );
}

function IucnBar({ counts, total }) {
  if (total === 0) return null;
  return (
    <div className="flex h-3 w-40 border">
      {IUCN_ORDER.filter((code) => counts[code] > 0).map((code) => (
        <div
          key={code}
          title={`${code}: ${counts[code]}`}
          style={{
            width: `${(counts[code] / total) * 100}%`,
            backgroundColor: iucnColor(code)
          }}
        />
      ))}
    </div>
  );
}

function MapTile({ title, value }) {
  return (
    <div className="border p-3">
      <div>{title}</div>
      <div className="text-3xl font-bold">{value.total.toLocaleString()}</div>
      <div className="text-sm pt-1">
        {value.withSpecies.toLocaleString()} with species (
        {percent(value.withSpecies, value.total)}),{" "}
        {value.withoutSpecies.toLocaleString()} without
      </div>
      {value.maxSpeciesPerHexagon != null && (
        <div className="text-sm">
          Max. {value.maxSpeciesPerHexagon} species in one hexagon
        </div>
      )}
    </div>
  );
}

function CountTable({ title, counts, labels = {}, total }) {
  return (
    <div>
      <div className="font-bold pb-1">{title}</div>
      <Table head={["", "Species", "Share"]}>
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value]) => (
            <tr key={key} className="border-b">
              <td className="py-1 pr-4">{labels[key] ?? key}</td>
              <td className="py-1 pr-4 tabular-nums">{value}</td>
              <td className="py-1 pr-4 tabular-nums">
                {percent(value, total)}
              </td>
            </tr>
          ))}
      </Table>
    </div>
  );
}

function Ecoregions({ ecoregions }) {
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [sort, setSort] = useState({
    column: "speciesCount",
    descending: true
  });
  const [expanded, setExpanded] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = ecoregions.filter(
      (e) =>
        (type === "all" || e.type === type) &&
        (!onlyEmpty || e.speciesCount === 0) &&
        (q === "" ||
          e.name.toLowerCase().includes(q) ||
          e.species.some((s) => s.toLowerCase().includes(q)))
    );
    const direction = sort.descending ? -1 : 1;
    return filtered.sort((a, b) => {
      const x = a[sort.column] ?? "";
      const y = b[sort.column] ?? "";
      if (x === y) return a.name.localeCompare(b.name);
      return (
        (typeof x === "number" ? x - y : String(x).localeCompare(y)) * direction
      );
    });
  }, [ecoregions, type, query, onlyEmpty, sort]);

  const sortProps = { sort, setSort };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 pb-3">
        <select
          className="border px-2 py-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All ecoregions</option>
          <option value="terrestrial">Terrestrial</option>
          <option value="marine">Marine</option>
        </select>
        <input
          className="border px-2 py-1 w-72 max-w-full"
          placeholder="Search ecoregion or species"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyEmpty}
            onChange={(e) => setOnlyEmpty(e.target.checked)}
          />
          Only ecoregions without species
        </label>
        <span>{rows.length} ecoregions</span>
      </div>
      <Table
        head={[
          <SortHeader label="Ecoregion" column="name" {...sortProps} />,
          <SortHeader label="Type" column="type" {...sortProps} />,
          <SortHeader label="Realm" column="realm" {...sortProps} />,
          <SortHeader label="Biome / Province" column="group" {...sortProps} />,
          <SortHeader label="Species" column="speciesCount" {...sortProps} />,
          "Plants / Animals",
          "IUCN (latest)"
        ]}
      >
        {rows.map((e) => {
          const key = `${e.type}-${e.id}`;
          const open = expanded === key;
          return (
            <Fragment key={key}>
              <tr
                className={`border-b ${
                  e.speciesCount > 0 ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
                onClick={() =>
                  e.speciesCount > 0 && setExpanded(open ? null : key)
                }
              >
                <td className="py-1 pr-4">
                  {e.speciesCount > 0 ? (open ? "▾ " : "▸ ") : ""}
                  {e.name}
                </td>
                <td className="py-1 pr-4">
                  {e.type === "terrestrial" ? "Terrestrial" : "Marine"}
                </td>
                <td className="py-1 pr-4">{e.realm}</td>
                <td className="py-1 pr-4">{e.group}</td>
                <td className="py-1 pr-4 tabular-nums">{e.speciesCount}</td>
                <td className="py-1 pr-4 tabular-nums">
                  {e.kingdoms.Plantae ?? 0} / {e.kingdoms.Animalia ?? 0}
                </td>
                <td className="py-1 pr-4">
                  <IucnBar counts={e.iucn} total={e.speciesCount} />
                </td>
              </tr>
              {open && (
                <tr className="border-b">
                  <td colSpan={7} className="py-2">
                    <div className="columns-2 md:columns-4 gap-4 italic">
                      {e.species.map((s) => (
                        <div key={s}>{s}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </Table>
    </>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data/statistics.json")
      .then((res) => res.json())
      .then(setStats)
      .catch((e) => {
        console.log(`Couldn't find statistics.json`, e);
        setError(
          "Could not load statistics.json. Run data-fusing-and-crawling/export_statistics.py first."
        );
      });
  }, []);

  if (error) return <div className="p-6">{error}</div>;
  if (stats == null) return <div className="p-6">Loading statistics…</div>;

  const total = stats.species.total;
  const coverage = stats.coverage;

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold pt-6">Data coverage</h1>
        <div className="pt-1">
          {total} species, computed on {stats.generated}
        </div>

        <Section title="World map">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MapTile title="Countries" value={stats.map.countries} />
            <MapTile
              title="Terrestrial ecoregions"
              value={stats.map.terrestrialEcoregions}
            />
            <MapTile
              title="Marine ecoregions"
              value={stats.map.marineEcoregions}
            />
            <MapTile title="Hexagons" value={stats.map.hexagons} />
          </div>
        </Section>

        <Section title="Species coverage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CountTable
              title="Distribution data per species"
              total={total}
              counts={{
                "With countries": coverage.withCountries,
                "With ecoregions": coverage.withEcoregions,
                "With hexagons": coverage.withHexagons,
                "With ecoregions and hexagons":
                  coverage.withEcoregionsAndHexagons,
                "Without ecoregions and hexagons":
                  coverage.withoutEcoregionsAndHexagons
              }}
            />
            <CountTable
              title="Source of country distribution"
              total={total}
              counts={coverage.countrySources}
              labels={COUNTRY_SOURCES}
            />
            <CountTable
              title="Kingdom"
              total={total}
              counts={stats.species.byKingdom}
            />
            <CountTable
              title="Ecosystem"
              total={total}
              counts={stats.species.byEcosystem}
              labels={ECOSYSTEMS}
            />
          </div>
        </Section>

        <Section
          title={`Species without ecoregion or hexagon map (${stats.speciesWithoutDistributionMap.length})`}
        >
          <Table
            head={[
              "Species",
              "Kingdom",
              "Family",
              "Ecosystem",
              "IUCN",
              "Countries",
              "Country source",
              "Origin of distribution data"
            ]}
          >
            {stats.speciesWithoutDistributionMap.map((s) => (
              <tr key={s.name} className="border-b align-top">
                <td className="py-1 pr-4 italic whitespace-nowrap">{s.name}</td>
                <td className="py-1 pr-4">{s.kingdom}</td>
                <td className="py-1 pr-4">{s.family}</td>
                <td className="py-1 pr-4">
                  {ECOSYSTEMS[s.ecosystem] ?? s.ecosystem}
                </td>
                <td className="py-1 pr-4">{s.iucn}</td>
                <td className="py-1 pr-4 tabular-nums">{s.countries}</td>
                <td className="py-1 pr-4">
                  {COUNTRY_SOURCES[s.countrySource ?? "none"]}
                </td>
                <td className="py-1 pr-4 break-words max-w-xs">{s.origin}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title="Ecoregions">
          <Ecoregions ecoregions={stats.ecoregions} />
        </Section>

        <Section title="Data issues">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-bold pb-1">
                Country values not found on the map
              </div>
              {Object.keys(stats.unmatchedCountryValues).length === 0 ? (
                <div>None</div>
              ) : (
                <Table head={["Value", "Species"]}>
                  {Object.entries(stats.unmatchedCountryValues).map(
                    ([value, count]) => (
                      <tr key={value} className="border-b">
                        <td className="py-1 pr-4">{value}</td>
                        <td className="py-1 pr-4 tabular-nums">{count}</td>
                      </tr>
                    )
                  )}
                </Table>
              )}
            </div>
            <div>
              <div className="font-bold pb-1">IDs not found on the map</div>
              <Table head={["Layer", "IDs"]}>
                <tr className="border-b">
                  <td className="py-1 pr-4">Terrestrial ecoregions</td>
                  <td className="py-1 pr-4">
                    {stats.unknownMapIds.terrestrialEcoregions.join(", ") ||
                      "None"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 pr-4">Marine ecoregions</td>
                  <td className="py-1 pr-4">
                    {stats.unknownMapIds.marineEcoregions.join(", ") || "None"}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-1 pr-4">Hexagons</td>
                  <td className="py-1 pr-4">
                    {stats.unknownMapIds.hexagons || "None"}
                  </td>
                </tr>
              </Table>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

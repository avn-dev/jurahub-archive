import { useState } from "react";
import { useLibrary, ImportedUnit } from "@/context/LibraryContext";
import { SEO } from "@/components/SEO";
import UnitViewer from "@/components/UnitViewer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Card = ({ unit, onSelect }: { unit: ImportedUnit; onSelect: () => void }) => (
  <button onClick={onSelect} className="group text-left rounded-xl border p-4 transition hover:shadow">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded border bg-muted">
        {unit.imageUrl ? (
          <img src={unit.imageUrl} alt={`${unit.slug} Vorschaubild`} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{unit.title || unit.slug}</div>
        <div className="truncate text-sm text-muted-foreground">{unit.code ? `[${unit.code}] ` : ""}{unit.slug}</div>
      </div>
    </div>
  </button>
);

const Library = () => {
  const { units } = useLibrary();
  const [selected, setSelected] = useState<ImportedUnit | null>(units[0] || null);

  return (
    <div className="container mx-auto px-4 py-10">
      <SEO title="Bibliothek – Jura Navigator" description="Durchstöbere deine importierten JuraOnline-Lerneinheiten." canonicalPath="/library" />
      <h1 className="mb-6 text-3xl font-semibold">Bibliothek</h1>
      {units.length === 0 ? (
        <div className="surface-elevated rounded-xl p-8 text-center">
          <p className="text-muted-foreground">Noch keine Daten importiert.</p>
          <Button asChild className="mt-4">
            <Link to="/import">Jetzt importieren</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-3">
            {units.map((u) => (
              <Card key={`${u.folderPath}`} unit={u} onSelect={() => setSelected(u)} />
            ))}
          </div>
          <div>{selected ? <UnitViewer unit={selected} /> : null}</div>
        </div>
      )}
    </div>
  );
};

export default Library;

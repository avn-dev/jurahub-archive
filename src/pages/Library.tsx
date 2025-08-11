import { useEffect } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { SEO } from "@/components/SEO";
import UnitViewer from "@/components/UnitViewer";
import TreeNav from "@/components/TreeNav";

const Library = () => {
  const { tree, selected, loadTree, loading, error } = useLibrary();

  useEffect(() => {
    loadTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <SEO title="Bibliothek – Jura Navigator" description="Durchstöbere deine JuraOnline-Inhalte aus data.json mit strukturierter Navigation." canonicalPath="/library" />
      <h1 className="mb-6 text-3xl font-semibold">Bibliothek</h1>

      {error && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="surface-elevated rounded-xl p-4">
          {loading && <p className="text-sm text-muted-foreground">Lade Navigation…</p>}
          {!loading && tree.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine Daten gefunden. Lege data.json unter /public/jura/data.json ab.</p>
          )}
          {tree.length > 0 && <TreeNav nodes={tree} />}
        </aside>
        <section>
          {selected ? (
            <UnitViewer unit={selected} />
          ) : (
            <div className="surface-elevated rounded-xl p-8 text-center text-sm text-muted-foreground">
              Wähle links eine Lerneinheit.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Library;

import { ImportedUnit } from "@/services/DataService";

interface Props {
  unit: ImportedUnit;
}

export const UnitViewer = ({ unit }: Props) => {
  return (
    <article className="surface-elevated rounded-xl p-6">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">
          {unit.title || unit.slug}
          {unit.code ? <span className="ml-2 text-muted-foreground text-base align-middle">[{unit.code}]</span> : null}
        </h2>
      </header>
      {unit.imageUrl ? (
        <img
          src={unit.imageUrl}
          alt={`Jura Lerneinheit ${unit.title || unit.slug} – Vorschaubild`}
          className="mb-6 rounded-lg border"
          loading="lazy"
        />
      ) : null}
      {unit.descriptionHtml ? (
        <section className="prose prose-neutral max-w-none dark:prose-invert">
          {/* already sanitized in context */}
          <div dangerouslySetInnerHTML={{ __html: unit.descriptionHtml || "" }} />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Keine Beschreibung vorhanden.</p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-1">Videos</h3>
          <p className="text-sm text-muted-foreground">
            {unit.videos?.length ? `${unit.videos.length} Video(s) gefunden.` : "Keine Videos vorhanden."}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-1">Fragen</h3>
          <p className="text-sm text-muted-foreground">
            {unit.questions?.length ? `${unit.questions.length} Frage(n) gefunden.` : "Keine Fragen vorhanden."}
          </p>
        </div>
      </section>
    </article>
  );
};

export default UnitViewer;

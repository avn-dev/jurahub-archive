import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <SEO title="Jura Navigator – Eigene Lernplattform" description="Importiere und lerne mit deinen JuraOnline-Inhalten – Bibliothek, Viewer und strukturierte Übersicht." canonicalPath="/" />
      <section className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Deine JuraOnline-Inhalte, schön strukturiert an einem Ort
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Lade deine exportierten Daten als ZIP hoch und erhalte eine durchsuchbare Bibliothek mit Beschreibung, Medien und Fragen.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/import">Jetzt importieren</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/library">Bibliothek ansehen</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

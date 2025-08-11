import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <SEO title="Jura Navigator – Eigene Lernplattform" description="Durchsuche deine JuraOnline-Inhalte direkt vom Server – Navigation, Viewer und strukturierte Übersicht." canonicalPath="/" />
      <section className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Deine JuraOnline-Inhalte, direkt vom Server geladen
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Lege deine data.json und Unit-Dateien auf dem Server ab und nutze die Bibliothek mit Suche und Viewer.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/library">Bibliothek öffnen</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

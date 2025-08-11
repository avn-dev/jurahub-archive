import { SEO } from "@/components/SEO";
import { ZipImporter } from "@/components/import/ZipImporter";

const Import = () => {
  return (
    <div>
      <SEO title="Import – Jura Navigator" description="Importiere deine JuraOnline ZIP-Daten in die private Lernplattform." canonicalPath="/import" />
      <ZipImporter />
    </div>
  );
};

export default Import;

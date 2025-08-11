import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLibrary } from "@/context/LibraryContext";

export const ZipImporter = () => {
  const { toast } = useToast();
  const { importFromZip, loadDemo } = useLibrary();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFile = async (file?: File) => {
    if (!file) return;
    setIsLoading(true);
    setProgress(0);
    try {
      await importFromZip(file, setProgress);
      toast({ title: "Import erfolgreich", description: "ZIP wurde verarbeitet." });
    } catch (e) {
      console.error(e);
      toast({ title: "Import fehlgeschlagen", description: "Ungültige ZIP-Datei?", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <div className="surface-elevated rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Daten importieren</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Lade die vom Scraper erzeugte output.zip hoch (enthält Ordner mit excursus.json / unit_data_full.json).
            </p>
          </div>

          <label className="block">
            <span className="text-sm">ZIP-Datei</span>
            <Input
              type="file"
              accept=".zip,application/zip"
              onChange={(e) => onFile(e.target.files?.[0])}
              disabled={isLoading}
              className="mt-2"
            />
          </label>

          {isLoading && (
            <div className="text-sm text-muted-foreground">Verarbeite… {progress}%</div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={() => (document.querySelector<HTMLInputElement>('input[type=file]')?.click())} disabled={isLoading}>
              ZIP auswählen
            </Button>
            <Button variant="secondary" onClick={loadDemo} disabled={isLoading}>
              Demo laden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZipImporter;

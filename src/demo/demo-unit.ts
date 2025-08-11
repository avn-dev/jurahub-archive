import type { ImportedUnit } from "@/context/LibraryContext";

export const demoUnit: ImportedUnit = {
  slug: "schuldrecht_at_einführung",
  code: "SR-AT-01",
  folderPath: "demo/schuldrecht_at_einführung",
  title: "Schuldrecht AT – Einführung",
  descriptionHtml:
    "<h3>Überblick</h3><p>Diese Demo-Lerneinheit demonstriert, wie Inhalte aus JuraOnline dargestellt werden können. Sie enthält Beschreibungstext, optional ein Bild sowie Metadaten wie Videos und Fragen.</p><ul><li>Vertragsentstehung</li><li>Anspruchsaufbau</li><li>Leistungsstörungen</li></ul>",
  imageUrl: undefined,
  videos: [{ title: "Einführungsvideo", duration: 300 }],
  questions: [{ id: 1, text: "Was ist ein Schuldverhältnis?" }],
};

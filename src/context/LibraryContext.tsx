import React, { createContext, useContext, useMemo, useState } from "react";
import JSZip from "jszip";
import DOMPurify from "dompurify";
import { demoUnit } from "@/demo/demo-unit";

export interface ImportedUnit {
  slug: string;
  code?: string;
  folderPath: string;
  title?: string;
  descriptionHtml?: string; // sanitized
  imageUrl?: string;
  videos?: any[];
  questions?: any[];
}

interface LibraryContextValue {
  units: ImportedUnit[];
  importFromZip: (file: File, onProgress?: (p: number) => void) => Promise<void>;
  loadDemo: () => void;
  clear: () => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<ImportedUnit[]>([]);

  const clear = () => setUnits([]);

  const importFromZip = async (file: File, onProgress?: (p: number) => void) => {
    const zip = await JSZip.loadAsync(file, {
      createFolders: false,
    });

    const files = Object.keys(zip.files);
    const candidateJsons = files.filter(
      (p) => p.endsWith("unit_data_full.json") || p.endsWith("excursus.json")
    );

    const collected: ImportedUnit[] = [];
    let processed = 0;

    for (const path of candidateJsons) {
      try {
        const folder = path.substring(0, path.lastIndexOf("/"));
        const jsonStr = await zip.file(path)!.async("string");
        const data = JSON.parse(jsonStr);

        let unitData: any = data;
        if (path.endsWith("excursus.json")) {
          unitData = data?.pageProps?.initialState?.learnstage?.currentLearnUnit?.data;
        }
        if (!unitData) {
          processed++;
          onProgress?.(Math.round((processed / candidateJsons.length) * 100));
          continue;
        }

        const rawHtml = typeof unitData.description === "string" ? unitData.description : "";
        const descriptionHtml = DOMPurify.sanitize(rawHtml);

        const folderName = folder.split("/").pop() || "";
        const folderParts = folderName.split("_");
        const code = unitData.code || (folderParts.length > 1 ? folderParts[0] : undefined);
        const slug = unitData.slug || (folderParts.length > 1 ? folderParts.slice(1).join("_") : folderName);

        let imageUrl: string | undefined;
        const firstImage = (unitData.image || [])[0];
        if (firstImage?.file_name) {
          const imgPath = `${folder}/${firstImage.file_name}`;
          if (zip.file(imgPath)) {
            const blob = await zip.file(imgPath)!.async("blob");
            imageUrl = URL.createObjectURL(blob);
          }
        }

        let videos: any[] | undefined = unitData.videos;
        const videosJsonPath = `${folder}/videos.json`;
        if (!videos && zip.file(videosJsonPath)) {
          try {
            const vStr = await zip.file(videosJsonPath)!.async("string");
            videos = JSON.parse(vStr);
          } catch {}
        }

        let questions: any[] | undefined;
        const questionsJsonPath = `${folder}/questions.json`;
        if (zip.file(questionsJsonPath)) {
          try {
            const qStr = await zip.file(questionsJsonPath)!.async("string");
            questions = JSON.parse(qStr);
          } catch {}
        }

        collected.push({
          slug,
          code,
          folderPath: folder,
          title: unitData.title || unitData?.element?.title || slug,
          descriptionHtml,
          imageUrl,
          videos,
          questions,
        });
      } catch (e) {
        // ignore broken entries
      } finally {
        processed++;
        onProgress?.(Math.round((processed / candidateJsons.length) * 100));
      }
    }

    // Basic deterministic sort
    collected.sort((a, b) => (a.code || "").localeCompare(b.code || "") || a.slug.localeCompare(b.slug));
    setUnits(collected);
  };

  const loadDemo = () => {
    setUnits([demoUnit]);
  };

  const value = useMemo(
    () => ({ units, importFromZip, loadDemo, clear }),
    [units]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};

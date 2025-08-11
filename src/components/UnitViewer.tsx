import { ImportedUnit } from "@/services/DataService";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  unit: ImportedUnit;
}

type VideoFile = { file_name: string };
type VideoItem = { id?: number; files?: VideoFile[]; annotations?: any[] };
type QuestionItem = {
  id: number;
  content: string;
  answer?: string;
  position?: number; // <-- ergänzt
  annotation?: {
    video_id?: number | null;
    start_sec?: number | null;
    end_sec?: number | null;
  } | null;
};

// Hilfsfunktionen
const toMediaUrl = (fileName: string) =>
  `https://media.jura-online.de/media/video/${fileName}`;

const fmtTime = (sec?: number | null) => {
  if (sec == null || isNaN(sec as number)) return "";
  const s = Math.floor((sec as number) % 60).toString().padStart(2, "0");
  const m = Math.floor((sec as number) / 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// Antwort hübsch rendern
function Answer({ text }: { text?: string }) {
  if (!text) return null;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const roman = /^([IVXLCDM]+)\.\s+/;
  const bullet = /^\-\s+/;

  const allRoman = lines.every((l) => roman.test(l));
  const allBullets = lines.every((l) => bullet.test(l));

  if (allRoman) {
    const items = lines.map((l) => l.replace(roman, "").trim());
    return (
      <ol className="list-decimal pl-6" style={{ listStyleType: "upper-roman" as any }}>
        {items.map((t, i) => (
          <li key={i} className="mb-1">{t}</li>
        ))}
      </ol>
    );
  }

  if (allBullets) {
    const items = lines.map((l) => l.replace(bullet, "").trim());
    return (
      <ul className="list-disc pl-6">
        {items.map((t, i) => (
          <li key={i} className="mb-1">{t}</li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-line">{text}</p>;
}

export const UnitViewer = ({ unit }: Props) => {
  const [tab, setTab] = useState<"video" | "text" | "docs" | "questions">("video");

  // --- Video Setup ---
  const videos: VideoItem[] = (unit.videos as VideoItem[] | undefined) ?? [];
  const preparedVideos = useMemo(() => {
    return videos.map((v) => {
      const files = (v.files ?? []).slice();
      const sorted = files.sort((a, b) => {
        const score = (f: VideoFile) =>
          f.file_name.endsWith(".mp4") ? 0 : f.file_name.endsWith(".webm") ? 1 : 2;
        return score(a) - score(b);
      });
      return {
        id: v.id,
        sources: sorted.map((f) => ({
          src: toMediaUrl(f.file_name),
          type: f.file_name.endsWith(".mp4")
            ? "video/mp4"
            : f.file_name.endsWith(".webm")
            ? "video/webm"
            : undefined,
        })),
        annotations: v.annotations || [],
      };
    });
  }, [unit.videos]);

  const [videoIndex, setVideoIndex] = useState(0);
  const activeVideo = preparedVideos[videoIndex];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Remount-Key für <video>, wenn Unit wechselt
  const [videoKey, setVideoKey] = useState(0);

  // Bei Unit-Wechsel: Video pausieren, resetten, neu mounten & Index zurücksetzen
  useEffect(() => {
    setVideoIndex(0);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.load();
      } catch {}
    }
    setVideoKey((k) => k + 1);
  }, [unit.folderPath, unit.slug, unit.code]);

  // Beim Tabwechsel: Video pausieren, wenn nicht sichtbar
  useEffect(() => {
    if (tab !== "video" && videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
  }, [tab]);

  // Wenn die Auswahl des Videos wechselt: Quellen neu laden
  useEffect(() => {
    if (!videoRef.current) return;
    try {
      videoRef.current.pause();
      videoRef.current.load();
    } catch {}
  }, [videoIndex, activeVideo?.sources]);

  // Lernfragen
  const questions: QuestionItem[] = (unit.questions as QuestionItem[] | undefined) ?? [];

  // Mapping: video_id -> index
  const videoIndexById = useMemo(() => {
    const map = new Map<number, number>();
    preparedVideos.forEach((v, i) => {
      if (typeof v.id === "number") map.set(v.id, i);
    });
    return map;
  }, [preparedVideos]);

  // Robust zum Videosegment springen (auch bei Video-/Tab-Wechsel)
  const jumpTo = (videoId?: number | null, start?: number | null) => {
    // ggf. anderes Video wählen
    if (videoId != null && videoIndexById.has(videoId)) {
      const idx = videoIndexById.get(videoId)!;
      if (idx !== videoIndex) setVideoIndex(idx);
    }

    // sicher in den Video-Tab
    if (tab !== "video") setTab("video");

    const seek = () => {
      const el = videoRef.current;
      if (!el || typeof start !== "number") return;
      const doSeek = () => {
        try {
          el.currentTime = Math.max(0, start);
          el.play().catch(() => {});
        } catch {}
      };

      if (el.readyState >= 1) {
        doSeek();
      } else {
        const onLoaded = () => {
          el.removeEventListener("loadedmetadata", onLoaded);
          doSeek();
        };
        el.addEventListener("loadedmetadata", onLoaded);
        try {
          el.load();
        } catch {}
      }
    };

    // kurz warten, bis setState durch ist
    setTimeout(seek, 0);
  };

  return (
    <article className="surface-elevated rounded-xl p-6">
      {/* Header */}
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">
          {unit.title || unit.slug}
          {unit.code ? (
            <span className="ml-2 text-muted-foreground text-base align-middle">[{unit.code}]</span>
          ) : null}
        </h2>
      </header>

      {/* Tabs */}
      <div className="border-b mb-4 flex gap-2 overflow-x-auto">
        {[
          { id: "video", label: "Video" + (preparedVideos.length ? ` (${preparedVideos.length})` : "") },
          { id: "text", label: "Text" },
          { id: "docs", label: "Unterlagen" },
          { id: "questions", label: "Lernfragen" + (questions.length ? ` (${questions.length})` : "") },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={[
              "px-4 py-2 text-sm whitespace-nowrap",
              tab === (t.id as any)
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === "video" && (
        <section className="space-y-4">
          {/* Video-Auswahl, falls mehrere */}
          {preparedVideos.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Video wählen:</label>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={videoIndex}
                onChange={(e) => setVideoIndex(Number(e.target.value))}
              >
                {preparedVideos.map((v, i) => (
                  <option key={i} value={i}>
                    {`Video ${i + 1}`}{v.id ? ` (ID ${v.id})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Player */}
          {activeVideo && activeVideo.sources.length ? (
            <div className="rounded-lg border p-3">
              <video
                key={videoKey}  // Remount bei Unit-Wechsel
                ref={videoRef}
                controls
                preload="metadata"
                className="w-full rounded-md"
              >
                {activeVideo.sources.map((s, i) => (
                  <source key={i} src={s.src} {...(s.type ? { type: s.type } : {})} />
                ))}
                <a href={activeVideo.sources[0]?.src} target="_blank" rel="noreferrer" className="underline">
                  Video öffnen
                </a>
              </video>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Videos vorhanden.</p>
          )}

          {/* Segmente aus annotations des aktiven Videos */}
          {!!activeVideo?.annotations?.length && (
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-2">Segmente</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {activeVideo.annotations.map((a: any, i: number) => (
                  <li key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">
                      {fmtTime(a.start_sec)}{a.end_sec != null ? ` – ${fmtTime(a.end_sec)}` : ""}
                    </span>
                    <button
                      type="button"
                      className="text-sm underline hover:no-underline"
                      onClick={() => jumpTo(activeVideo.id, a.start_sec)}
                    >
                      Anspielen
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "text" && (
        <section className="pt-1">
          {unit.descriptionHtml ? (
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              {/* already sanitized in context */}
              <div dangerouslySetInnerHTML={{ __html: unit.descriptionHtml || "" }} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Kein Text vorhanden.</p>
          )}
        </section>
      )}

      {tab === "docs" && (
        <section className="pt-1">
          {/* Placeholder: sobald du z.B. unit.documents hast, hier verlinken */}
          {unit.imageUrl ? (
            <img
              src={unit.imageUrl}
              alt={`Jura Lerneinheit ${unit.title || unit.slug} – Vorschaubild`}
              className="mb-6 rounded-lg border"
              loading="lazy"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Keine Unterlagen vorhanden.</p>
          )}
        </section>
      )}

      {tab === "questions" && (
        <section className="pt-1">
          {!questions.length ? (
            <p className="text-sm text-muted-foreground">Keine Lernfragen vorhanden.</p>
          ) : (
            <ul className="space-y-3">
              {questions
                .slice()
                .sort((a, b) =>
                  (a.position ?? a.id ?? 0) - (b.position ?? b.id ?? 0)
                )
                .map((q) => {
                  const start = q.annotation?.start_sec ?? null;
                  const end = q.annotation?.end_sec ?? null;
                  const vid = q.annotation?.video_id ?? null;

                  return (
                    <li key={q.id} className="rounded-lg border">
                      <details className="group">
                        <summary className="cursor-pointer list-none px-4 py-3 flex items-start gap-3">
                          <span className="mt-0.5 select-none group-open:rotate-90 transition-transform">▶</span>
                          <div className="flex-1">
                            <div className="font-medium">{q.content}</div>
                            {(start != null || end != null) && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {start != null ? fmtTime(start) : "—"}
                                {end != null ? ` – ${fmtTime(end)}` : ""}
                              </div>
                            )}
                          </div>
                          {(start != null || vid != null) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault(); // verhindert Detail-Toggle beim Sprung
                                jumpTo(vid ?? undefined, start ?? undefined);
                              }}
                              className="text-xs underline hover:no-underline"
                              title="Zum Videosegment springen"
                            >
                              Zum Video
                            </button>
                          )}
                        </summary>
                        <div className="px-4 pb-4">
                          <div className="text-sm">
                            <Answer text={q.answer} />
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>
      )}
    </article>
  );
};

export default UnitViewer;

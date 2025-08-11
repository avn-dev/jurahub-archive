// ---- Types (erweitert) ----
export interface TreeElement {
  id: number | null;
  code?: string | null;
  sort_code?: string | null;
  list_item?: string | null;
  depth?: number | null;
  learn_unit_id?: number | null;
  title?: string | null;
  slug?: string | null;
}

export interface LearnUnitMeta {
  id: number | null;
  title: string | null;
  slug?: string | null;
  seo_keywords?: string | null;
}

export interface TreeNode {
  element?: TreeElement;
  learn_unit?: LearnUnitMeta;
  children?: Array<{ hierarchy_element?: TreeNode } | TreeNode>;
  allowed?: boolean;
  user_has_unit?: boolean;
  repeat_index?: number;
  __parent__?: TreeNode; // intern
}

export interface DataTreeResponse {
  data?: {
    excursus?: { elements?: TreeNode[] };
    questions?: { elements?: TreeNode[] }; // <— NEU: optionaler Questions-Baum
  };
}

export interface ImportedUnit {
  slug: string;
  code?: string;
  folderPath: string;
  title?: string;
  descriptionHtml?: string;
  imageUrl?: string;
  videos?: any[];
  questions?: any[];
}

// ---- Helpers ----
export function sanitizeName(name?: string | null): string {
  if (!name) return "";
  let n = name.trim().toLowerCase();
  n = n.replace(/[^\w\-]+/g, "_");
  return n;
}

export function computeFolderSegment(node: TreeNode): string {
  const code = node.element?.code || "unknown";
  const slug =
    node.learn_unit?.slug ||
    node.element?.slug ||
    sanitizeName(node.element?.title || "unknown");
  return sanitizeName(`${code}_${slug}`);
}

// { hierarchy_element }-Wrapper auflösen
function getChildren(node?: TreeNode): TreeNode[] {
  if (!node?.children) return [];
  return node.children
    .map((c) => ("hierarchy_element" in (c as any) ? (c as any).hierarchy_element : c))
    .filter(Boolean) as TreeNode[];
}

function attachParents(nodes: TreeNode[], parent?: TreeNode) {
  for (const n of nodes) {
    n.__parent__ = parent;
    const kids = getChildren(n);
    if (kids.length) attachParents(kids, n);
  }
}

export function computeFullFolderPath(node: TreeNode): string {
  const segments: string[] = [];
  let cur: TreeNode | undefined = node;
  while (cur) {
    segments.push(computeFolderSegment(cur));
    cur = cur.__parent__;
  }
  return segments.reverse().join("/");
}

function extractQuestions(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.questions)) return payload.data.questions;
  if (Array.isArray(payload?.questions)) return payload.questions;
  return [];
}

// Beibehaltener Kurzname (ein Segment)
export function computeFolderName(node: TreeNode): string {
  return computeFolderSegment(node);
}

// ---- DataService ----
type TreeKey = "excursus" | "questions";

export const DataService = {
  /**
   * Beliebigen Baum laden (excursus ODER questions) und Parent-Referenzen setzen.
   */
  async fetchTree(basePath = "/jura", tree: TreeKey = "excursus"): Promise<TreeNode[]> {
    const resp = await fetch(`${basePath}/data.json`);
    if (!resp.ok) throw new Error(`Konnte data.json nicht laden (${resp.status})`);
    const json: DataTreeResponse = await resp.json();

    const roots =
      (tree === "excursus"
        ? json?.data?.excursus?.elements
        : json?.data?.questions?.elements) || [];

    attachParents(roots, undefined);
    return roots;
  },

  /**
   * Unit-Dateien für einen Knoten laden (excursus.json, videos.json, questions.json)
   * – nutzt den vollständigen Hierarchiepfad.
   */
  async fetchUnitByNode(node: TreeNode, basePath = "/jura"): Promise<ImportedUnit | null> {
    const folderPath = computeFullFolderPath(node);
    const excursusUrl = `${basePath}/output/${folderPath}/excursus.json`;

    try {
      const resp = await fetch(excursusUrl);
      if (!resp.ok) throw new Error("excursus.json nicht gefunden");
      const excursus = await resp.json();
      const unitData = excursus?.pageProps?.initialState?.learnstage?.currentLearnUnit?.data;
      if (!unitData) throw new Error("Unerwartetes excursus.json-Format");

      const title =
        unitData.title || node.learn_unit?.title || node.element?.title || folderPath;

      let imageUrl: string | undefined;
      const firstImage = (unitData.image || [])[0];
      if (firstImage?.file_name) {
        imageUrl = `${basePath}/output/${folderPath}/${firstImage.file_name}`;
      }

      let videos: any[] | undefined;
      try {
        const v = await fetch(`${basePath}/output/${folderPath}/videos.json`);
        if (v.ok) videos = await v.json();
      } catch {}

      let questions: any[] | undefined;
      try {
        const q = await fetch(`${basePath}/output/${folderPath}/questions.json`);
        if (q.ok) {
          const qJson = await q.json();
          questions = extractQuestions(qJson); // <<<< NEU: normalisieren zu Array
        }
      } catch {}

      const descriptionHtml: string | undefined =
        typeof unitData.description === "string" ? unitData.description : undefined;

      return {
        slug: node.learn_unit?.slug || node.element?.slug || computeFolderSegment(node),
        code: node.element?.code || undefined,
        folderPath: `${basePath}/output/${folderPath}`,
        title,
        descriptionHtml,
        imageUrl,
        videos,
        questions,
      };
    } catch (e) {
      console.warn("Unit-Laden fehlgeschlagen:", e);
      return null;
    }
  },

  /**
   * Nur die Fragen (questions.json) für einen Knoten laden.
   * Praktisch, wenn du mit einem eigenen „Questions“-Baum arbeitest
   * und direkt die Fragen einer Unit brauchst.
   */
  async fetchQuestionsByNode(node: TreeNode, basePath = "/jura"): Promise<any[] | null> {
    const folderPath = computeFullFolderPath(node);
    const url = `${basePath}/output/${folderPath}/questions.json`;
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      const qJson = await r.json();
      return extractQuestions(qJson); // <<<< NEU
    } catch {
      return null;
    }
  },
};

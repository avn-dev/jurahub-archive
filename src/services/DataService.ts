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
  slug: string | null;
  seo_keywords?: string | null;
}

export interface TreeNode {
  element?: TreeElement;
  learn_unit?: LearnUnitMeta;
  children?: Array<{ hierarchy_element?: TreeNode } | TreeNode>;
  allowed?: boolean;
  user_has_unit?: boolean;
  repeat_index?: number;
}

export interface DataTreeResponse {
  data?: {
    excursus?: {
      elements?: TreeNode[];
    };
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

// Helpers
export function sanitizeName(name?: string | null): string {
  if (!name) return "";
  let n = name.trim().toLowerCase();
  n = n.replace(/[^\w\-]+/g, "_");
  return n;
}

export function computeFolderName(node: TreeNode): string {
  const code = node.element?.code || "unknown";
  const slug = node.learn_unit?.slug || node.element?.slug || sanitizeName(node.element?.title || "unknown");
  return sanitizeName(`${code}_${slug}`);
}

export const DataService = {
  async fetchTree(basePath = "/jura"): Promise<TreeNode[]> {
    const resp = await fetch(`${basePath}/data.json`);
    if (!resp.ok) throw new Error(`Konnte data.json nicht laden (${resp.status})`);
    const json: DataTreeResponse = await resp.json();
    return json?.data?.excursus?.elements || [];
  },

  async fetchUnitByNode(node: TreeNode, basePath = "/jura"): Promise<ImportedUnit | null> {
    const folder = computeFolderName(node);
    const excursusUrl = `${basePath}/output/${folder}/excursus.json`;

    try {
      const resp = await fetch(excursusUrl);
      if (!resp.ok) throw new Error("excursus.json nicht gefunden");
      const excursus = await resp.json();
      const unitData = excursus?.pageProps?.initialState?.learnstage?.currentLearnUnit?.data;
      if (!unitData) throw new Error("Unerwartetes excursus.json-Format");

      const title = unitData.title || node.learn_unit?.title || node.element?.title || folder;
      let imageUrl: string | undefined;
      const firstImage = (unitData.image || [])[0];
      if (firstImage?.file_name) {
        imageUrl = `${basePath}/output/${folder}/${firstImage.file_name}`;
      }

      let videos: any[] | undefined;
      try {
        const v = await fetch(`${basePath}/output/${folder}/videos.json`);
        if (v.ok) videos = await v.json();
      } catch {}

      let questions: any[] | undefined;
      try {
        const q = await fetch(`${basePath}/output/${folder}/questions.json`);
        if (q.ok) questions = await q.json();
      } catch {}

      const descriptionHtml: string | undefined = typeof unitData.description === "string" ? unitData.description : undefined;

      return {
        slug: node.learn_unit?.slug || node.element?.slug || folder,
        code: node.element?.code || undefined,
        folderPath: `${basePath}/output/${folder}`,
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
};

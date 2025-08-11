import * as React from "react";
import DOMPurify from "dompurify";
import { DataService, ImportedUnit, TreeNode } from "@/services/DataService";

interface LibraryContextValue {
  tree: TreeNode[];
  selected?: ImportedUnit | null;
  loading: boolean;
  error?: string | null;
  loadTree: () => Promise<void>;
  selectNode: (node: TreeNode) => Promise<void>;
}

const LibraryContext = React.createContext<LibraryContextValue | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tree, setTree] = React.useState<TreeNode[]>([]);
  const [selected, setSelected] = React.useState<ImportedUnit | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadTree = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await DataService.fetchTree();
      setTree(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler beim Laden der Navigation");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectNode = React.useCallback(async (node: TreeNode) => {
    setLoading(true);
    setError(null);
    try {
      const unit = await DataService.fetchUnitByNode(node);
      if (unit) {
        // Sanitize description before storing
        unit.descriptionHtml = unit.descriptionHtml ? DOMPurify.sanitize(unit.descriptionHtml) : undefined;
        setSelected(unit);
      } else {
        setSelected(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler beim Laden der Einheit");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({ tree, selected, loading, error, loadTree, selectNode }),
    [tree, selected, loading, error, loadTree, selectNode]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const ctx = React.useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
};

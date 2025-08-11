import { useEffect, useState } from "react";
import { ChevronRight, FolderTree, BookOpen } from "lucide-react";
import type { TreeNode } from "@/services/DataService";
import { useLibrary } from "@/context/LibraryContext";

function isUnit(node: TreeNode) {
  return !!(node.learn_unit && node.learn_unit.id && node.learn_unit.slug);
}

function getChildNodes(node?: TreeNode): TreeNode[] {
  if (!node?.children) return [];
  return node.children
    .map((c) => (("hierarchy_element" in (c as any)) ? (c as any).hierarchy_element : (c as TreeNode)))
    .filter(Boolean) as TreeNode[];
}

export const TreeNav = ({ nodes }: { nodes: TreeNode[] }) => {
  return (
    <nav className="space-y-1">
      {nodes.map((n, idx) => (
        <TreeItem node={n} key={idx} level={0} />
      ))}
    </nav>
  );
};

const TreeItem = ({ node, level }: { node: TreeNode; level: number }) => {
  const [open, setOpen] = useState(level < 1);
  const { selectNode } = useLibrary();

  const children = getChildNodes(node);
  const hasChildren = children.length > 0;

  const title =
    node.learn_unit?.title ||
    node.element?.title ||
    node.learn_unit?.slug ||
    node.element?.slug ||
    "Unbenannt";

  useEffect(() => {
    if (level === 0) setOpen(true);
  }, [level]);

  // Klick auf Chevron: nur togglen
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setOpen((o) => !o);
  };

  // Klick auf Row: Unit selektieren; falls Kinder existieren, beim Selektieren aufklappen
  const handleRowClick = () => {
    if (isUnit(node)) {
      selectNode(node);
      if (hasChildren && !open) setOpen(true); // auto-expand beim Selektieren
    } else if (hasChildren) {
      // Nicht-Unit-Knoten ohne Select: togglen
      setOpen((o) => !o);
    }
  };

  return (
    <div>
      <div
        className="group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted/50 cursor-pointer"
        onClick={handleRowClick}
        role="treeitem"
        aria-expanded={hasChildren ? open : undefined}
      >
        <button
          type="button"
          className={`transition ${hasChildren ? (open ? "rotate-90" : "") : "opacity-0"}`}
          onClick={handleChevronClick}
          aria-label={open ? "Zuklappen" : "Aufklappen"}
        >
          <ChevronRight size={16} />
        </button>

        {isUnit(node) ? <BookOpen size={16} /> : <FolderTree size={16} />}
        <span className="truncate text-sm">{title}</span>
      </div>

      {hasChildren && open && (
        <div className="ml-4 border-l pl-3">
          {children.map((c, idx) => (
            <TreeItem key={idx} node={c} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNav;

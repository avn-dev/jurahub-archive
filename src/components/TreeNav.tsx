import { useEffect, useState } from "react";
import { ChevronRight, FolderTree, BookOpen } from "lucide-react";
import type { TreeNode } from "@/services/DataService";
import { useLibrary } from "@/context/LibraryContext";

function isUnit(node: TreeNode) {
  return !!(node.learn_unit && node.learn_unit.id && node.learn_unit.slug);
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

  const hasChildren = (node.children?.length || 0) > 0;

  const title = node.learn_unit?.title || node.element?.title || node.learn_unit?.slug || node.element?.slug || "Unbenannt";

  useEffect(() => {
    if (level === 0) setOpen(true);
  }, [level]);

  return (
    <div>
      <button
        className="group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted/50"
        onClick={() => (isUnit(node) ? selectNode(node) : setOpen((o) => !o))}
      >
        <span className={`transition ${hasChildren ? (open ? "rotate-90" : "") : "opacity-0"}`}>
          <ChevronRight size={16} />
        </span>
        {isUnit(node) ? <BookOpen size={16} /> : <FolderTree size={16} />}
        <span className="truncate text-sm">{title}</span>
      </button>
      {hasChildren && open && (
        <div className="ml-4 border-l pl-3">
          {node.children!.map((c, idx) => (
            <TreeItem key={idx} node={(c as any).hierarchy_element || (c as TreeNode)} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNav;

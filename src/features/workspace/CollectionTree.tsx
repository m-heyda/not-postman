import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type {
  CollectionTreeNode,
  CollectionFolderNode,
  CollectionRequestNode,
} from "@/domain/models/workspace";
import { MethodBadge } from "./MethodBadge";
import { cn } from "@/lib/utils";

interface CollectionTreeProps {
  collectionName: string;
  nodes: CollectionTreeNode[];
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
}

export function CollectionTree({
  collectionName,
  nodes,
  selectedPath,
  onSelectRequest,
}: CollectionTreeProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      {/* Collection folder header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold hover:bg-accent transition-colors"
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{collectionName}</span>
      </button>

      {open && (
        <div className="ml-2">
          {nodes.map((node) => (
            <TreeNode
              key={node.type === "folder" ? node.name : node.path}
              node={node}
              selectedPath={selectedPath}
              onSelectRequest={onSelectRequest}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeProps {
  node: CollectionTreeNode;
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
  depth: number;
}

function TreeNode({
  node,
  selectedPath,
  onSelectRequest,
  depth,
}: TreeNodeProps) {
  if (node.type === "folder") {
    return (
      <FolderNode
        node={node}
        selectedPath={selectedPath}
        onSelectRequest={onSelectRequest}
        depth={depth}
      />
    );
  }
  return (
    <RequestNode
      node={node}
      isSelected={selectedPath === node.path}
      onSelect={() => onSelectRequest(node.path)}
      depth={depth}
    />
  );
}

function FolderNode({
  node,
  selectedPath,
  onSelectRequest,
  depth,
}: {
  node: CollectionFolderNode;
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {open && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.type === "folder" ? child.name : child.path}
              node={child}
              selectedPath={selectedPath}
              onSelectRequest={onSelectRequest}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestNode({
  node,
  isSelected,
  onSelect,
  depth,
}: {
  node: CollectionRequestNode;
  isSelected: boolean;
  onSelect: () => void;
  depth: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground/80",
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <MethodBadge method={node.method} className="text-[9px] w-[38px]" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

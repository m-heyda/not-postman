import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  MoreHorizontal,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CollectionTreeNode,
  CollectionFolderNode,
  CollectionRequestNode,
} from "@/domain/models/workspace";
import { Button } from "@/components/ui/button";
import { MethodBadge } from "./MethodBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { RenameRequestDialog } from "./RenameRequestDialog";
import { apiDelete } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useWorkspaceStore } from "./workspace.store";
import { cn } from "@/lib/utils";

interface CollectionTreeProps {
  collectionName: string;
  collectionPath: string;
  nodes: CollectionTreeNode[];
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
  onEditCollection: (collectionPath: string) => void;
  onAddRequest: (pathPrefix: string) => void;
  onDeleteCollection: (collectionPath: string) => void;
}

export function CollectionTree({
  collectionName,
  collectionPath,
  nodes,
  selectedPath,
  onSelectRequest,
  onEditCollection,
  onAddRequest,
  onDeleteCollection,
}: CollectionTreeProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-0.5 group/collection">
      <div className="flex items-center rounded-md hover:bg-accent/50 transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-1 px-1.5 py-1 text-[11px] font-medium text-muted-foreground min-w-0 uppercase tracking-wider"
        >
          {open ? (
            <ChevronDown className="size-3 shrink-0" />
          ) : (
            <ChevronRight className="size-3 shrink-0" />
          )}
          <span className="truncate">{collectionName}</span>
        </button>
        <div className="flex items-center gap-0.5 mr-1 opacity-0 group-hover/collection:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="size-5 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onAddRequest(`${collectionPath}/`);
            }}
            title="Add request"
          >
            <Plus className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onEditCollection(collectionPath);
            }}
            title="Edit variables"
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCollection(collectionPath);
            }}
            title="Delete collection"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="ml-1.5">
          {nodes.map((node) => (
            <TreeNode
              key={node.type === "folder" ? node.name : node.path}
              node={node}
              pathPrefix={`${collectionPath}/`}
              collectionPath={collectionPath}
              selectedPath={selectedPath}
              onSelectRequest={onSelectRequest}
              onAddRequest={onAddRequest}
              depth={0}
            />
          ))}
          <AddRequestRow
            depth={0}
            onClick={() => onAddRequest(`${collectionPath}/`)}
          />
        </div>
      )}
    </div>
  );
}

interface TreeNodeProps {
  node: CollectionTreeNode;
  pathPrefix: string;
  collectionPath: string;
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
  onAddRequest: (pathPrefix: string) => void;
  depth: number;
}

function TreeNode({
  node,
  pathPrefix,
  collectionPath,
  selectedPath,
  onSelectRequest,
  onAddRequest,
  depth,
}: TreeNodeProps) {
  if (node.type === "folder") {
    return (
      <FolderNode
        node={node}
        pathPrefix={pathPrefix}
        collectionPath={collectionPath}
        selectedPath={selectedPath}
        onSelectRequest={onSelectRequest}
        onAddRequest={onAddRequest}
        depth={depth}
      />
    );
  }
  return (
    <RequestNode
      node={node}
      collectionPath={collectionPath}
      isSelected={selectedPath === node.path}
      onSelect={() => onSelectRequest(node.path)}
      depth={depth}
    />
  );
}

function FolderNode({
  node,
  pathPrefix,
  collectionPath,
  selectedPath,
  onSelectRequest,
  onAddRequest,
  depth,
}: {
  node: CollectionFolderNode;
  pathPrefix: string;
  collectionPath: string;
  selectedPath: string | null;
  onSelectRequest: (path: string) => void;
  onAddRequest: (pathPrefix: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const myPrefix = `${pathPrefix}${node.name}/`;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 rounded-md py-0.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0" />
        ) : (
          <ChevronRight className="size-3 shrink-0" />
        )}
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {open && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.type === "folder" ? child.name : child.path}
              node={child}
              pathPrefix={myPrefix}
              collectionPath={collectionPath}
              selectedPath={selectedPath}
              onSelectRequest={onSelectRequest}
              onAddRequest={onAddRequest}
              depth={depth + 1}
            />
          ))}
          <AddRequestRow
            depth={depth + 1}
            onClick={() => onAddRequest(myPrefix)}
          />
        </div>
      )}
    </div>
  );
}

function RequestNode({
  node,
  collectionPath,
  isSelected,
  onSelect,
  depth,
}: {
  node: CollectionRequestNode;
  collectionPath: string;
  isSelected: boolean;
  onSelect: () => void;
  depth: number;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const queryClient = useQueryClient();
  const selectedRequestPath = useWorkspaceStore((s) => s.selectedRequestPath);
  const setSelectedRequestPath = useWorkspaceStore(
    (s) => s.setSelectedRequestPath,
  );

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/requests/${node.path}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.collectionTree(collectionPath),
      });
      if (selectedRequestPath === node.path) {
        setSelectedRequestPath(null);
      }
      setDeleteOpen(false);
      toast.success("Request deleted");
    },
    onError: () => {
      toast.error("Failed to delete request");
    },
  });

  return (
    <>
      <div
        className={cn(
          "group/req flex w-full items-center gap-1.5 rounded-md py-0.5 text-xs transition-colors",
          isSelected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 text-foreground/75",
        )}
        style={{ paddingLeft: `${depth * 12 + 6}px`, paddingRight: "2px" }}
      >
        <button
          className="flex flex-1 items-center gap-1.5 min-w-0 py-0.5"
          onClick={onSelect}
        >
          <MethodBadge method={node.method} className="w-[34px] shrink-0" />
          <span className={cn("truncate", isSelected && "font-medium")}>
            {node.name}
          </span>
        </button>
        <div className="flex items-center gap-0 opacity-0 group-hover/req:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setRenameOpen(true); }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Rename"
          >
            <PenLine className="size-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="size-2.5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete request"
        description={`Delete "${node.name}"? This removes the YAML file permanently.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      <RenameRequestDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        requestPath={node.path}
        currentName={node.name}
        collectionPath={collectionPath}
      />
    </>
  );
}

function AddRequestRow({
  depth,
  onClick,
}: {
  depth: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-1 rounded-md py-0.5 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-accent/30 transition-colors"
      style={{ paddingLeft: `${depth * 12 + 6}px`, paddingRight: "6px" }}
    >
      <Plus className="size-2.5 shrink-0" />
      <span>Add request</span>
    </button>
  );
}

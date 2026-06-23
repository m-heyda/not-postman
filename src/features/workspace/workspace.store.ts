import { create } from "zustand";
import type {
  WorkspaceInfo,
  CollectionTreeNode,
} from "@/domain/models/workspace";

interface WorkspaceState {
  workspace: WorkspaceInfo | null;
  trees: Record<string, CollectionTreeNode[]>;
  selectedRequestPath: string | null;

  setWorkspace: (workspace: WorkspaceInfo) => void;
  setTree: (collectionId: string, tree: CollectionTreeNode[]) => void;
  setSelectedRequestPath: (path: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspace: null,
  trees: {},
  selectedRequestPath: null,

  setWorkspace: (workspace) => set({ workspace }),

  setTree: (collectionId, tree) =>
    set((state) => ({
      trees: { ...state.trees, [collectionId]: tree },
    })),

  setSelectedRequestPath: (selectedRequestPath) =>
    set({ selectedRequestPath }),
}));

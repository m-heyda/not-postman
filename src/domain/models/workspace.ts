import type { HttpMethod } from "./request.js";

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export interface CollectionSummary {
  id: string;
  name: string;
  path: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  description?: string;
  collections: CollectionSummary[];
}

export type CollectionTreeNode =
  | CollectionFolderNode
  | CollectionRequestNode;

export interface CollectionFolderNode {
  type: "folder";
  name: string;
  children: CollectionTreeNode[];
}

export interface CollectionRequestNode {
  type: "request";
  name: string;
  path: string;
  method: HttpMethod;
}

export interface EnvironmentSummary {
  id: string;
  name: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface DocsResponse {
  path: string;
  content: string;
}

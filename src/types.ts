export type ChangeKind = "added" | "modified" | "deleted" | "renamed";

export interface FileChange {
  kind: ChangeKind;
  path: string;
  previousPath?: string;
}

export interface Commit {
  hash: string;
  shortHash: string;
  parents: string[];
  author: string;
  email: string;
  date: string;
  subject: string;
  decorations: string[];
  changes: FileChange[];
}

export interface RepositoryAnalysis {
  name: string;
  root: string;
  branch: string;
  commits: Commit[];
  analyzedAt: string;
}

export interface FileState {
  id: string;
  path: string;
  directory: string;
  extension: string;
  changes: number;
  createdAt: number;
  lastChangedAt: number;
  lastKind: ChangeKind;
}

export interface Snapshot {
  files: FileState[];
  changedPaths: Set<string>;
}

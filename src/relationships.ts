import type { Commit, FileState } from "./types";

export interface DirectoryNode {
  id: string;
  files: FileState[];
  changes: number;
}

export interface DirectoryLink {
  source: string;
  target: string;
  weight: number;
}

const directoryOf = (path: string) => path.includes("/") ? path.split("/")[0] : "root";

export function buildDirectoryRelationships(
  files: FileState[],
  commits: Commit[],
): { nodes: DirectoryNode[]; links: DirectoryLink[] } {
  const groups = new Map<string, FileState[]>();
  for (const file of files) {
    groups.set(file.directory, [...(groups.get(file.directory) ?? []), file]);
  }

  const liveDirectories = new Set(groups.keys());
  const weights = new Map<string, number>();

  for (const commit of commits) {
    const touched = [...new Set(commit.changes
      .flatMap((change) => [change.path, change.previousPath].filter(Boolean) as string[])
      .map(directoryOf)
      .filter((directory) => liveDirectories.has(directory)))].sort();

    for (let sourceIndex = 0; sourceIndex < touched.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < touched.length; targetIndex += 1) {
        const key = `${touched[sourceIndex]}\u0000${touched[targetIndex]}`;
        weights.set(key, (weights.get(key) ?? 0) + 1);
      }
    }
  }

  const nodes = [...groups.entries()]
    .map(([id, groupedFiles]) => ({
      id,
      files: groupedFiles,
      changes: groupedFiles.reduce((total, file) => total + file.changes, 0),
    }))
    .sort((a, b) => b.files.length - a.files.length || a.id.localeCompare(b.id));

  const links = [...weights.entries()]
    .map(([key, weight]) => {
      const [source, target] = key.split("\u0000");
      return { source, target, weight };
    })
    .filter((link) => link.weight > 1)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 36);

  return { nodes, links };
}

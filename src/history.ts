import type { Commit, FileState, RepositoryAnalysis, Snapshot } from "./types";

const extensionOf = (path: string) => {
  const name = path.split("/").at(-1) ?? path;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "file";
};

const directoryOf = (path: string) => path.includes("/") ? path.split("/")[0] : "root";

export function snapshotAt(analysis: RepositoryAnalysis, commitIndex: number): Snapshot {
  const files = new Map<string, FileState>();
  const identities = new Map<string, string>();
  let nextId = 0;

  analysis.commits.slice(0, commitIndex + 1).forEach((commit, index) => {
    for (const change of commit.changes) {
      if (change.kind === "deleted") {
        files.delete(change.path);
        identities.delete(change.path);
        continue;
      }

      if (change.kind === "renamed" && change.previousPath) {
        const existing = files.get(change.previousPath);
        files.delete(change.previousPath);
        const id = existing?.id ?? identities.get(change.previousPath) ?? `file-${nextId++}`;
        identities.set(change.path, id);
        files.set(change.path, {
          ...(existing ?? {
            id,
            createdAt: index,
            changes: 0,
          }),
          id,
          path: change.path,
          directory: directoryOf(change.path),
          extension: extensionOf(change.path),
          changes: (existing?.changes ?? 0) + 1,
          lastChangedAt: index,
          lastKind: change.kind,
        });
        continue;
      }

      const existing = files.get(change.path);
      const id = existing?.id ?? identities.get(change.path) ?? `file-${nextId++}`;
      identities.set(change.path, id);
      files.set(change.path, {
        ...(existing ?? { id, createdAt: index, changes: 0 }),
        id,
        path: change.path,
        directory: directoryOf(change.path),
        extension: extensionOf(change.path),
        changes: (existing?.changes ?? 0) + 1,
        lastChangedAt: index,
        lastKind: change.kind,
      });
    }
  });

  return {
    files: [...files.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
    changedPaths: new Set(analysis.commits[commitIndex]?.changes.flatMap((change) => [change.path, change.previousPath ?? ""]) ?? []),
  };
}

export function fileHistory(commits: Commit[], file: FileState): Commit[] {
  const knownPaths = new Set([file.path]);
  for (let index = commits.length - 1; index >= 0; index -= 1) {
    for (const change of commits[index].changes) {
      if (change.kind === "renamed" && knownPaths.has(change.path) && change.previousPath) {
        knownPaths.add(change.previousPath);
      }
    }
  }
  return commits.filter((commit) => commit.changes.some((change) => knownPaths.has(change.path) || Boolean(change.previousPath && knownPaths.has(change.previousPath))));
}

export function compareSnapshots(before: Snapshot, after: Snapshot) {
  const beforeById = new Map(before.files.map((file) => [file.id, file]));
  const afterById = new Map(after.files.map((file) => [file.id, file]));
  return {
    added: after.files.filter((file) => !beforeById.has(file.id)),
    removed: before.files.filter((file) => !afterById.has(file.id)),
    moved: after.files.filter((file) => {
      const previous = beforeById.get(file.id);
      return previous && previous.path !== file.path;
    }),
    modified: after.files.filter((file) => {
      const previous = beforeById.get(file.id);
      return previous && previous.path === file.path && previous.changes !== file.changes;
    }),
  };
}

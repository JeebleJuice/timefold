import type { FileState } from "../types";

interface Props {
  files: FileState[];
  changedPaths: Set<string>;
  selectedId?: string;
  query: string;
  onSelect: (file: FileState) => void;
}

const palette: Record<string, string> = {
  ts: "#5b8cff", tsx: "#7b6cff", js: "#f3cc5b", jsx: "#f3a65b", rs: "#e77c58",
  css: "#d865b0", md: "#76b7a6", json: "#a7b067", html: "#e89564", file: "#788390",
};

export function RepositoryMap({ files, changedPaths, selectedId, query, onSelect }: Props) {
  const filtered = files.filter((file) => file.path.toLowerCase().includes(query.toLowerCase()));
  const groups = new Map<string, FileState[]>();
  for (const file of filtered) groups.set(file.directory, [...(groups.get(file.directory) ?? []), file]);

  if (!filtered.length) {
    return <div className="map-empty"><span>No files at this point in history.</span><small>Move the timeline or clear the path filter.</small></div>;
  }

  return (
    <div className="repository-map" aria-label="Repository file map">
      {[...groups.entries()].map(([directory, group]) => (
        <section className="map-region" key={directory}>
          <header><span>{directory}</span><small>{group.length} {group.length === 1 ? "file" : "files"}</small></header>
          <div className="file-grid">
            {group.map((file) => {
              const active = changedPaths.has(file.path);
              return (
                <button
                  className={`file-tile ${active ? "is-changed" : ""} ${selectedId === file.id ? "is-selected" : ""}`}
                  key={file.id}
                  onClick={() => onSelect(file)}
                  title={`${file.path} · ${file.changes} changes`}
                  style={{ "--file-color": palette[file.extension] ?? palette.file } as React.CSSProperties}
                >
                  <span className="file-mark" />
                  <span className="file-name">{file.path.split("/").at(-1)}</span>
                  <span className="file-count">{file.changes}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

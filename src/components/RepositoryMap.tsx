import type { FileState } from "../types";
import { fileColorStyle } from "./SystemMap";

interface Props {
  files: FileState[];
  changedPaths: Set<string>;
  selectedId?: string;
  query: string;
  onSelect: (file: FileState) => void;
}

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
          <header><span><i />{directory}</span><small>{group.length} {group.length === 1 ? "file" : "files"}</small></header>
          <div className="file-grid">
            {group.map((file) => {
              const active = changedPaths.has(file.path);
              return (
                <button
                  className={`file-tile ${active ? "is-changed" : ""} ${selectedId === file.id ? "is-selected" : ""}`}
                  key={file.id}
                  onClick={() => onSelect(file)}
                  title={`${file.path} · ${file.changes} changes`}
                  style={fileColorStyle(file.extension)}
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

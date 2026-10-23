import type { CSSProperties } from "react";
import type { Commit, FileState } from "../types";
import { buildDirectoryRelationships } from "../relationships";

interface Props {
  files: FileState[];
  commits: Commit[];
  changedPaths: Set<string>;
  selectedId?: string;
  onSelect: (file: FileState) => void;
  onDirectorySelect: (directory: string) => void;
}

const colors: Record<string, string> = {
  ts: "#6394ff", tsx: "#8c7bff", js: "#f3cc5b", jsx: "#f3a65b", rs: "#ed815e",
  css: "#dd6fba", md: "#7bc5ae", json: "#b7bd68", html: "#eaa06f", file: "#7d8996",
};

const nodePositions = (count: number) => {
  if (count === 1) return [{ x: 450, y: 250 }];
  const columns = count <= 6 ? 3 : count <= 12 ? 4 : 5;
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const rowItems = Math.min(columns, count - row * columns);
    const rowOffset = (columns - rowItems) * 90;
    return {
      x: 115 + column * (670 / Math.max(1, columns - 1)) + rowOffset,
      y: rows === 1 ? 250 : 100 + row * (300 / Math.max(1, rows - 1)),
    };
  });
};

export function SystemMap({ files, commits, changedPaths, selectedId, onSelect, onDirectorySelect }: Props) {
  const graph = buildDirectoryRelationships(files, commits);
  const displayNodes = graph.nodes.slice(0, 15);
  const displayedIds = new Set(displayNodes.map((node) => node.id));
  const displayLinks = graph.links.filter((link) => displayedIds.has(link.source) && displayedIds.has(link.target));
  const positions = nodePositions(displayNodes.length);
  const placed = new Map(displayNodes.map((node, index) => [node.id, { ...node, ...positions[index] }]));
  const maxWeight = Math.max(1, ...displayLinks.map((link) => link.weight));
  const selectedDirectory = files.find((file) => file.id === selectedId)?.directory;

  if (!graph.nodes.length) return <div className="map-empty"><span>No modules at this point in history.</span></div>;

  return (
    <div className="system-map-wrap">
      <svg className="system-map" viewBox="0 0 900 500" role="img" aria-label="Repository module co-change map">
        <defs>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="edge-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#506071" /><stop offset=".5" stopColor="#ef8f55" /><stop offset="1" stopColor="#506071" />
          </linearGradient>
        </defs>

        <g className="relationship-lines">
          {displayLinks.map((link) => {
            const source = placed.get(link.source);
            const target = placed.get(link.target);
            if (!source || !target) return null;
            const emphasized = selectedDirectory === source.id || selectedDirectory === target.id;
            return <line key={`${link.source}-${link.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="url(#edge-gradient)" strokeWidth={1 + (link.weight / maxWeight) * 7} opacity={emphasized ? .88 : .16 + (link.weight / maxWeight) * .34}><title>{link.source} and {link.target} changed together in {link.weight} commits</title></line>;
          })}
        </g>

        {displayNodes.map((node, index) => {
          const position = positions[index];
          const radius = Math.min(displayNodes.length > 8 ? 58 : 74, 38 + Math.sqrt(node.files.length) * 6);
          const isSelected = selectedDirectory === node.id;
          const orderedFiles = [...node.files].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
          return (
            <g
              className={`system-node ${isSelected ? "is-selected" : ""}`}
              key={node.id}
              transform={`translate(${position.x} ${position.y})`}
              role="button"
              tabIndex={0}
              aria-label={`Filter to ${node.id}, ${node.files.length} files`}
              onClick={() => onDirectorySelect(node.id)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onDirectorySelect(node.id); }}
            >
              <circle className="node-aura" r={radius + 13} />
              <circle className="node-body" r={radius} filter={isSelected ? "url(#node-glow)" : undefined} />
              <circle className="node-hit" r={radius}><title>Filter to {node.id}</title></circle>
              {orderedFiles.slice(0, 24).map((file, fileIndex) => {
                const angle = fileIndex * 2.399963;
                const distance = 14 + Math.sqrt(fileIndex) * Math.min(9, radius / 6);
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance - 7;
                const changed = changedPaths.has(file.path);
                return <circle key={file.id} className={`node-file ${changed ? "is-changed" : ""} ${selectedId === file.id ? "is-selected" : ""}`} cx={x} cy={y} r={changed ? 4.8 : 3.2} fill={colors[file.extension] ?? colors.file} role="button" tabIndex={0} aria-label={`${file.path}, ${file.changes} changes`} onClick={(event) => { event.stopPropagation(); onSelect(file); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.stopPropagation(); onSelect(file); } }}><title>{file.path} · {file.changes} changes</title></circle>;
              })}
              <text className="node-label" y={radius + 20} textAnchor="middle">{node.id}</text>
              <text className="node-count" y={radius + 34} textAnchor="middle">{node.files.length} files · {node.changes} changes</text>
            </g>
          );
        })}
      </svg>
      <div className="system-map-key"><span><i className="key-line" />Repeated co-change</span><span><i className="key-pulse" />Changed now</span><span>{graph.nodes.length > displayNodes.length ? `Showing ${displayNodes.length} largest modules · ` : ""}Click module to filter · click dot to inspect</span></div>
    </div>
  );
}

export const fileColorStyle = (extension: string) => ({ "--file-color": colors[extension] ?? colors.file } as CSSProperties);

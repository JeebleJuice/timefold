import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Boxes, CircleDot, GitBranch, History, Pause, Play, Search, Sparkles } from "lucide-react";
import { analyzeRepository } from "./bridge";
import { demoAnalysis } from "./demo";
import { compareSnapshots, fileHistory, snapshotAt } from "./history";
import type { FileState, RepositoryAnalysis } from "./types";
import { RepositoryMap } from "./components/RepositoryMap";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export default function App() {
  const [analysis, setAnalysis] = useState<RepositoryAnalysis>(demoAnalysis);
  const [index, setIndex] = useState(analysis.commits.length - 1);
  const [path, setPath] = useState("/home/jeeblejuice/Dev/timefold");
  const [pathQuery, setPathQuery] = useState("");
  const [author, setAuthor] = useState("all");
  const [selected, setSelected] = useState<FileState>();
  const [compareIndex, setCompareIndex] = useState<number>();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = analysis.commits[index];
  const snapshot = useMemo(() => snapshotAt(analysis, index), [analysis, index]);
  const authors = useMemo(() => [...new Set(analysis.commits.map((commit) => commit.author))], [analysis]);
  const visibleFiles = author === "all" ? snapshot.files : snapshot.files.filter((file) => fileHistory(analysis.commits.slice(0, index + 1), file).some((commit) => commit.author === author));
  const selectedState = selected ? snapshot.files.find((file) => file.id === selected.id) : undefined;
  const selectedHistory = selectedState ? fileHistory(analysis.commits.slice(0, index + 1), selectedState).slice().reverse() : [];
  const comparison = compareIndex === undefined ? undefined : compareSnapshots(snapshotAt(analysis, compareIndex), snapshot);

  useEffect(() => {
    if (!playing || index >= analysis.commits.length - 1) {
      if (index >= analysis.commits.length - 1) setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [playing, index, analysis.commits.length]);

  async function openRepository() {
    setLoading(true); setError(""); setPlaying(false);
    try {
      const next = await analyzeRepository(path);
      if (!next.commits.length) throw new Error("The repository has no commits yet.");
      setAnalysis(next); setIndex(next.commits.length - 1); setSelected(undefined); setCompareIndex(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally { setLoading(false); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-symbol"><History size={20} /></div><div><strong>TIMEFOLD</strong><span>Repository archaeology</span></div></div>
        <div className="repo-path"><CircleDot size={15} /><input aria-label="Repository path" value={path} onChange={(event) => setPath(event.target.value)} onKeyDown={(event) => event.key === "Enter" && openRepository()} /><button onClick={openRepository} disabled={loading}>{loading ? "Reading…" : "Open repository"}</button></div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="workspace">
        <aside className="left-panel">
          <div className="eyebrow">Repository</div>
          <h1>{analysis.name}</h1>
          <div className="branch"><GitBranch size={15} /> {analysis.branch}<span>{analysis.commits.length} commits</span></div>

          <div className="panel-section"><label>Filter paths</label><div className="search"><Search size={15} /><input value={pathQuery} onChange={(event) => setPathQuery(event.target.value)} placeholder="src, tests, .rs…" /></div></div>
          <div className="panel-section"><label>Contributor</label><select value={author} onChange={(event) => setAuthor(event.target.value)}><option value="all">Everyone</option>{authors.map((name) => <option key={name}>{name}</option>)}</select></div>

          <div className="panel-section legend"><label>Language</label>{Object.entries({ TypeScript: "#5b8cff", Rust: "#e77c58", Styles: "#d865b0", Docs: "#76b7a6", Other: "#788390" }).map(([name, color]) => <span key={name}><i style={{ background: color }} />{name}</span>)}</div>

          <div className="compare-card">
            <div><Boxes size={16} /><strong>Compare points</strong></div>
            {compareIndex === undefined ? <><p>Pin this moment, then travel to another commit.</p><button onClick={() => setCompareIndex(index)}>Pin {current?.shortHash}</button></> : <><p>From <b>{analysis.commits[compareIndex]?.shortHash}</b> to <b>{current?.shortHash}</b></p><div className="comparison-counts"><span>+{comparison?.added.length}</span><span>−{comparison?.removed.length}</span><span>↝{comparison?.moved.length}</span><span>~{comparison?.modified.length}</span></div><button onClick={() => setCompareIndex(undefined)}>Clear comparison</button></>}
          </div>
        </aside>

        <section className="main-stage">
          <div className="stage-heading"><div><span className="eyebrow">Architectural map</span><h2>{visibleFiles.length} files at {current?.shortHash}</h2></div><div className="commit-badge"><span>{current?.changes.length ?? 0}</span> changed in this commit</div></div>
          <RepositoryMap files={visibleFiles} changedPaths={snapshot.changedPaths} selectedId={selectedState?.id} query={pathQuery} onSelect={setSelected} />

          <div className="timeline-panel">
            <div className="commit-summary"><button className="play" aria-label={playing ? "Pause history" : "Play history"} onClick={() => { if (index >= analysis.commits.length - 1) setIndex(0); setPlaying((value) => !value); }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button><div className="commit-dot" /><div><strong>{current?.subject}</strong><span>{current?.author} · {current && dateLabel(current.date)}</span></div><code>{current?.shortHash}</code></div>
            <div className="range-wrap"><input type="range" min={0} max={Math.max(0, analysis.commits.length - 1)} value={index} onChange={(event) => { setPlaying(false); setIndex(Number(event.target.value)); }} /><div className="range-labels"><span>{analysis.commits[0] && dateLabel(analysis.commits[0].date)}</span><span>{index + 1} / {analysis.commits.length}</span><span>{current && dateLabel(current.date)}</span></div></div>
          </div>
        </section>

        <aside className="inspector">
          {selectedState ? <>
            <div className="eyebrow">File history</div><h2>{selectedState.path.split("/").at(-1)}</h2><p className="full-path">{selectedState.path}</p>
            <div className="file-stats"><div><span>{selectedState.changes}</span>changes</div><div><span>{selectedHistory.length}</span>commits</div></div>
            <div className="history-list">{selectedHistory.map((commit) => {
              const change = commit.changes.find((item) => item.path === selectedState.path || item.previousPath === selectedState.path);
              return <button key={commit.hash} onClick={() => setIndex(analysis.commits.indexOf(commit))}><i className={`change-${change?.kind}`} /><div><strong>{commit.subject}</strong><span>{commit.author} · {dateLabel(commit.date)}</span></div><ArrowRight size={14} /></button>;
            })}</div>
          </> : <div className="empty-inspector"><Sparkles size={27} /><h2>Follow a file</h2><p>Select any tile to trace its changes and moves through the repository.</p></div>}
        </aside>
      </section>
    </main>
  );
}

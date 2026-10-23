# Timefold

Timefold is a local-first desktop application for investigating how a Git repository became what it is. It reconstructs file state at every commit, preserves file identity through detected renames, and presents history as a stable architectural map instead of only a commit list.

This repository currently contains the first vertical slice:

- read-only Git history analysis through the installed `git` command;
- additions, modifications, deletions, and rename tracking;
- an interactive commit timeline with playback;
- a stable, scroll-contained directory-and-file map;
- a module relationship view built from repeated co-change evidence;
- path and contributor filters;
- file history inspection; and
- comparison between two points in history.

The browser build uses a small demo repository because browsers cannot read arbitrary local Git repositories. The Tauri desktop build invokes the native analyzer and never checks out, modifies, or writes to the selected repository.

## Requirements

- Node.js 22 or newer
- npm
- Rust toolchain
- Git
- Tauri 2 system dependencies for desktop development

## Development

```bash
npm install
npm run dev
```

The browser preview opens with demo data. To analyze a real local repository, run the desktop shell:

```bash
npm run desktop
```

Enter an absolute repository path and choose **Open repository**.

## Verification

```bash
npm test
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

## Architecture

```text
Local repository (read-only)
  → git log with name-status and rename detection
  → Rust parser and typed commit model
  → Tauri command boundary
  → React snapshot reconstruction
  → stable map, timeline, comparison, and file inspector
```

The current layout deliberately leaves empty space when files disappear and reuses identity when Git detects a rename. This is the first step toward spatial continuity; a later layout engine will persist coordinates in a cache rather than deriving them during each render.

The relationship view groups files by top-level module and connects modules that repeatedly changed in the same commits. These are deliberately labelled as co-change relationships, not source-code dependencies. The fifteen largest visible modules are shown when a repository has a very wide top level; filters can narrow the graph further.

## Current boundaries

- The active branch's first-parent history is analyzed so each reconstructed state is coherent. Branch switching and merge-parent comparison are not implemented yet.
- Filenames must be valid UTF-8. Paths containing tabs or newlines are outside the initial parser contract.
- Rename identity depends on Git's similarity detection.
- Analysis is recomputed in memory and is not yet cached in SQLite.
- The map represents directories and files, not semantic symbols or imports.
- Packaging is intentionally disabled until application icons and platform checks are ready.

## Next milestones

1. Move snapshot reconstruction into the analysis layer and cache results incrementally in SQLite.
2. Add refs, tags, branch selection, exclusions, and analysis progress for larger repositories.
3. Persist stable spatial coordinates and add zoomable module grouping.
4. Add side-by-side commit comparison with diff metadata.
5. Save milestones and guided project stories.
6. Add privacy-aware self-contained web export.

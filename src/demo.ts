import type { RepositoryAnalysis } from "./types";

export const demoAnalysis: RepositoryAnalysis = {
  name: "timefold-demo",
  root: "Demo repository",
  branch: "main",
  analyzedAt: new Date().toISOString(),
  commits: [
    {
      hash: "19cbe411b8ebdcbec1d6328f91cbd42aa574a823", shortHash: "19cbe41", parents: [], author: "Ada", email: "ada@example.dev", date: "2026-07-02T10:00:00Z", subject: "Create the first repository explorer", decorations: [],
      changes: [
        { kind: "added", path: "src/main.ts" }, { kind: "added", path: "src/git.ts" },
        { kind: "added", path: "README.md" }, { kind: "added", path: "package.json" },
      ],
    },
    {
      hash: "776033f92c0397cdb4bef0e4cc958e8223e7698d", shortHash: "776033f", parents: ["19cbe41"], author: "Mika", email: "mika@example.dev", date: "2026-07-08T14:20:00Z", subject: "Add persistent file identity", decorations: [],
      changes: [{ kind: "modified", path: "src/git.ts" }, { kind: "added", path: "src/history.ts" }, { kind: "added", path: "tests/history.test.ts" }],
    },
    {
      hash: "f5e6b01848b961d0f5f56eed6e6c678c188a34e5", shortHash: "f5e6b01", parents: ["776033f"], author: "Ada", email: "ada@example.dev", date: "2026-07-14T09:45:00Z", subject: "Separate desktop and analysis layers", decorations: ["tag: v0.1.0"],
      changes: [{ kind: "renamed", path: "src/analysis/git.ts", previousPath: "src/git.ts" }, { kind: "renamed", path: "src/analysis/history.ts", previousPath: "src/history.ts" }, { kind: "added", path: "src/desktop/window.ts" }, { kind: "modified", path: "src/main.ts" }],
    },
    {
      hash: "0a5de93cc47e390fb568fbedb9074d9940886d75", shortHash: "0a5de93", parents: ["f5e6b01"], author: "Noor", email: "noor@example.dev", date: "2026-07-19T16:10:00Z", subject: "Build timeline and repository map", decorations: ["HEAD -> main"],
      changes: [{ kind: "added", path: "src/ui/Timeline.tsx" }, { kind: "added", path: "src/ui/RepositoryMap.tsx" }, { kind: "added", path: "src/ui/theme.css" }, { kind: "modified", path: "src/main.ts" }, { kind: "modified", path: "README.md" }, { kind: "deleted", path: "src/desktop/window.ts" }],
    },
  ],
};

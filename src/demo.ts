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
        ...[
          "app/layout.tsx", "app/page.tsx", "app/globals.css", "components/Shell.tsx",
          "components/EmptyState.tsx", "lib/config.ts", "lib/path.ts", "docs/architecture.md",
          "public/mark.svg", ".github/workflows/checks.yml",
        ].map((path) => ({ kind: "added" as const, path })),
      ],
    },
    {
      hash: "776033f92c0397cdb4bef0e4cc958e8223e7698d", shortHash: "776033f", parents: ["19cbe41"], author: "Mika", email: "mika@example.dev", date: "2026-07-08T14:20:00Z", subject: "Add persistent file identity", decorations: [],
      changes: [
        { kind: "modified", path: "src/git.ts" }, { kind: "added", path: "src/history.ts" }, { kind: "added", path: "tests/history.test.ts" },
        ...[
          "app/page.tsx", "components/Shell.tsx", "components/RepositoryPicker.tsx",
          "components/Timeline.tsx", "lib/config.ts", "lib/git/command.ts", "lib/git/parser.ts",
          "lib/history/snapshot.ts", "tests/parser.test.ts", "tests/snapshot.test.ts",
        ].map((path) => ({ kind: "added" as const, path })),
      ],
    },
    {
      hash: "f5e6b01848b961d0f5f56eed6e6c678c188a34e5", shortHash: "f5e6b01", parents: ["776033f"], author: "Ada", email: "ada@example.dev", date: "2026-07-14T09:45:00Z", subject: "Separate desktop and analysis layers", decorations: ["tag: v0.1.0"],
      changes: [
        { kind: "renamed", path: "src/analysis/git.ts", previousPath: "src/git.ts" }, { kind: "renamed", path: "src/analysis/history.ts", previousPath: "src/history.ts" }, { kind: "added", path: "src/desktop/window.ts" }, { kind: "modified", path: "src/main.ts" },
        ...["app/page.tsx", "components/Timeline.tsx", "components/FileInspector.tsx", "lib/git/command.ts", "lib/history/identity.ts", "docs/decisions/history-model.md"].map((path) => ({ kind: "added" as const, path })),
      ],
    },
    {
      hash: "0a5de93cc47e390fb568fbedb9074d9940886d75", shortHash: "0a5de93", parents: ["f5e6b01"], author: "Noor", email: "noor@example.dev", date: "2026-07-19T16:10:00Z", subject: "Build timeline and repository map", decorations: ["HEAD -> main"],
      changes: [
        { kind: "added", path: "src/ui/Timeline.tsx" }, { kind: "added", path: "src/ui/RepositoryMap.tsx" }, { kind: "added", path: "src/ui/theme.css" }, { kind: "modified", path: "src/main.ts" }, { kind: "modified", path: "README.md" }, { kind: "deleted", path: "src/desktop/window.ts" },
        ...["app/globals.css", "components/Shell.tsx", "components/SystemMap.tsx", "components/ViewSwitch.tsx", "lib/history/snapshot.ts", "lib/layout/stable-grid.ts", "lib/metrics/churn.ts", "tests/layout.test.ts"].map((path) => ({ kind: "added" as const, path })),
      ],
    },
    {
      hash: "307a4ebc6dbd6a0a47aeabaf75c75a1626c56791", shortHash: "307a4eb", parents: ["0a5de93"], author: "Mika", email: "mika@example.dev", date: "2026-07-24T11:35:00Z", subject: "Reveal module co-change relationships", decorations: [],
      changes: [
        ...["app/page.tsx", "components/SystemMap.tsx", "components/FileInspector.tsx", "lib/history/snapshot.ts", "lib/metrics/churn.ts", "lib/metrics/cochange.ts", "tests/relationships.test.ts", "docs/architecture.md"].map((path) => ({ kind: path.includes("cochange") || path.includes("relationships") ? "added" as const : "modified" as const, path })),
      ],
    },
    {
      hash: "b898b7c5cce5d32721f268710246218e34934825", shortHash: "b898b7c", parents: ["307a4eb"], author: "Noor", email: "noor@example.dev", date: "2026-07-29T15:50:00Z", subject: "Cache analysis and repository settings", decorations: ["HEAD -> main", "tag: v0.2.0"],
      changes: [
        ...["app/page.tsx", "components/RepositoryPicker.tsx", "components/SystemMap.tsx", "lib/config.ts", "lib/cache/database.ts", "lib/cache/migrations.ts", "lib/git/parser.ts", "prisma/schema.prisma", "prisma/migrations/001_init.sql", "tests/cache.test.ts", "README.md"].map((path) => ({ kind: path.includes("cache/") || path.includes("prisma/") || path.includes("cache.test") ? "added" as const : "modified" as const, path })),
      ],
    },
  ],
};

import { describe, expect, it } from "vitest";
import { compareSnapshots, fileHistory, snapshotAt } from "./history";
import { demoAnalysis } from "./demo";

describe("repository history", () => {
  it("reconstructs files at a point in time", () => {
    expect(snapshotAt(demoAnalysis, 0).files.map((file) => file.path)).toContain("src/git.ts");
    expect(snapshotAt(demoAnalysis, 2).files.map((file) => file.path)).toContain("src/analysis/git.ts");
    expect(snapshotAt(demoAnalysis, 2).files.map((file) => file.path)).not.toContain("src/git.ts");
  });

  it("keeps a file identity across a rename", () => {
    const before = snapshotAt(demoAnalysis, 1).files.find((file) => file.path === "src/git.ts");
    const after = snapshotAt(demoAnalysis, 2).files.find((file) => file.path === "src/analysis/git.ts");
    expect(after?.id).toBe(before?.id);
    expect(fileHistory(demoAnalysis.commits, after!).length).toBe(3);
  });

  it("describes changes between two points", () => {
    const result = compareSnapshots(snapshotAt(demoAnalysis, 1), snapshotAt(demoAnalysis, 3));
    expect(result.added.map((file) => file.path)).toContain("src/ui/Timeline.tsx");
    expect(result.moved.map((file) => file.path)).toContain("src/analysis/git.ts");
  });
});

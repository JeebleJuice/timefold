import { describe, expect, it } from "vitest";
import { demoAnalysis } from "./demo";
import { snapshotAt } from "./history";
import { buildDirectoryRelationships } from "./relationships";

describe("directory relationships", () => {
  it("groups live files by their top-level location", () => {
    const snapshot = snapshotAt(demoAnalysis, demoAnalysis.commits.length - 1);
    const graph = buildDirectoryRelationships(snapshot.files, demoAnalysis.commits);
    expect(graph.nodes.find((node) => node.id === "src")?.files.length).toBeGreaterThan(0);
    expect(graph.nodes.find((node) => node.id === "root")?.files.some((file) => file.path === "README.md")).toBe(true);
  });

  it("only exposes repeated co-change relationships", () => {
    const snapshot = snapshotAt(demoAnalysis, demoAnalysis.commits.length - 1);
    const graph = buildDirectoryRelationships(snapshot.files, demoAnalysis.commits);
    expect(graph.links.every((link) => link.weight > 1)).toBe(true);
  });
});

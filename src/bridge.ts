import { demoAnalysis } from "./demo";
import type { RepositoryAnalysis } from "./types";

export async function analyzeRepository(path: string): Promise<RepositoryAnalysis> {
  if (!("__TAURI_INTERNALS__" in window)) {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    return { ...demoAnalysis, root: path.trim() || demoAnalysis.root };
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<RepositoryAnalysis>("analyze_repository", { path });
}

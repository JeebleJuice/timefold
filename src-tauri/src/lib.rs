use serde::Serialize;
use std::{path::{Path, PathBuf}, process::Command};

const RECORD_SEPARATOR: char = '\u{001e}';
const FIELD_SEPARATOR: char = '\u{001f}';

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RepositoryAnalysis {
    name: String,
    root: String,
    branch: String,
    commits: Vec<Commit>,
    analyzed_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Commit {
    hash: String,
    short_hash: String,
    parents: Vec<String>,
    author: String,
    email: String,
    date: String,
    subject: String,
    decorations: Vec<String>,
    changes: Vec<FileChange>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FileChange {
    kind: ChangeKind,
    path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    previous_path: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
enum ChangeKind { Added, Modified, Deleted, Renamed }

fn git(repo: &Path, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(repo)
        .args(args)
        .output()
        .map_err(|error| format!("Could not start Git: {error}"))?;
    if !output.status.success() {
        let message = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        return Err(if message.is_empty() { "Git could not read this repository.".into() } else { message });
    }
    String::from_utf8(output.stdout).map_err(|_| "Git returned text that is not valid UTF-8.".into())
}

fn parse_change(line: &str) -> Option<FileChange> {
    let mut fields = line.split('\t');
    let status = fields.next()?;
    let first = fields.next()?.to_owned();
    let code = status.chars().next()?;
    match code {
        'A' => Some(FileChange { kind: ChangeKind::Added, path: first, previous_path: None }),
        'D' => Some(FileChange { kind: ChangeKind::Deleted, path: first, previous_path: None }),
        'R' => Some(FileChange { kind: ChangeKind::Renamed, path: fields.next()?.to_owned(), previous_path: Some(first) }),
        'C' => Some(FileChange { kind: ChangeKind::Added, path: fields.next()?.to_owned(), previous_path: None }),
        _ => Some(FileChange { kind: ChangeKind::Modified, path: first, previous_path: None }),
    }
}

fn parse_log(output: &str) -> Result<Vec<Commit>, String> {
    output.split(RECORD_SEPARATOR).filter(|record| !record.trim().is_empty()).map(|record| {
        let record = record.trim_matches('\n');
        let mut lines = record.lines();
        let header = lines.next().ok_or("Git returned an incomplete commit record.")?;
        let fields: Vec<&str> = header.split(FIELD_SEPARATOR).collect();
        if fields.len() != 8 { return Err("Git returned an unexpected commit header.".into()); }
        Ok(Commit {
            hash: fields[0].to_owned(),
            short_hash: fields[1].to_owned(),
            parents: fields[2].split_whitespace().map(str::to_owned).collect(),
            author: fields[3].to_owned(),
            email: fields[4].to_owned(),
            date: fields[5].to_owned(),
            subject: fields[6].to_owned(),
            decorations: fields[7].split(',').map(str::trim).filter(|value| !value.is_empty()).map(str::to_owned).collect(),
            changes: lines.filter(|line| !line.is_empty()).filter_map(parse_change).collect(),
        })
    }).collect()
}

fn repository_root(path: &str) -> Result<PathBuf, String> {
    if path.trim().is_empty() { return Err("Choose a repository path first.".into()); }
    let candidate = Path::new(path).canonicalize().map_err(|_| "That path does not exist or cannot be read.".to_string())?;
    let root = git(&candidate, &["rev-parse", "--show-toplevel"])?;
    Path::new(root.trim()).canonicalize().map_err(|_| "Git reported a repository root that cannot be read.".into())
}

#[tauri::command]
fn analyze_repository(path: String) -> Result<RepositoryAnalysis, String> {
    let root = repository_root(&path)?;
    let branch = git(&root, &["branch", "--show-current"]).map(|value| {
        let value = value.trim().to_owned();
        if value.is_empty() { "detached HEAD".into() } else { value }
    })?;
    let format = format!("{RECORD_SEPARATOR}%H{FIELD_SEPARATOR}%h{FIELD_SEPARATOR}%P{FIELD_SEPARATOR}%an{FIELD_SEPARATOR}%ae{FIELD_SEPARATOR}%aI{FIELD_SEPARATOR}%s{FIELD_SEPARATOR}%D");
    let log = git(&root, &["log", "--first-parent", "--reverse", "--diff-merges=first-parent", "--date=iso-strict", &format!("--format={format}"), "--name-status", "-M"])?;
    let commits = parse_log(&log)?;
    let name = root.file_name().and_then(|value| value.to_str()).unwrap_or("repository").to_owned();
    Ok(RepositoryAnalysis {
        name,
        root: root.to_string_lossy().into_owned(),
        branch,
        commits,
        analyzed_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![analyze_repository])
        .run(tauri::generate_context!())
        .expect("error while running Timefold");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_rename_records() {
        let change = parse_change("R098\told/path.ts\tnew/path.ts").unwrap();
        assert!(matches!(change.kind, ChangeKind::Renamed));
        assert_eq!(change.previous_path.as_deref(), Some("old/path.ts"));
        assert_eq!(change.path, "new/path.ts");
    }

    #[test]
    fn treats_a_copy_as_a_new_file() {
        let change = parse_change("C100\tsource.ts\tcopy.ts").unwrap();
        assert!(matches!(change.kind, ChangeKind::Added));
        assert_eq!(change.path, "copy.ts");
        assert!(change.previous_path.is_none());
    }

    #[test]
    fn parses_a_commit_and_its_files() {
        let source = "\u{1e}abcdef\u{1f}abcdef\u{1f}\u{1f}Ada\u{1f}ada@example.dev\u{1f}2026-01-01T12:00:00Z\u{1f}Initial commit\u{1f}HEAD -> main\n\nA\tsrc/main.ts\nM\tREADME.md\n";
        let commits = parse_log(source).unwrap();
        assert_eq!(commits.len(), 1);
        assert_eq!(commits[0].changes.len(), 2);
        assert_eq!(commits[0].subject, "Initial commit");
    }
}

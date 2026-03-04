const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple watcher: commits changes after a short debounce when files change in project
const DEBOUNCE_MS = 1200;
let timer = null;
const repoRoot = path.resolve(__dirname, '..');

function commitChanges() {
  const now = new Date().toISOString();
  const msg = `autosave: ${now}`;
  exec('git add -A', { cwd: repoRoot }, (err) => {
    if (err) return console.error('git add failed:', err.message);
    exec(`git commit -m "${msg}" --no-verify`, { cwd: repoRoot }, (err2, stdout, stderr) => {
      if (err2) {
        // if no changes to commit, git returns non-zero; ignore this
        if (stderr && stderr.includes('nothing to commit')) {
          console.log('No changes to commit');
          return;
        }
        console.error('git commit failed:', err2.message);
      } else {
        console.log('Committed changes:', msg);
      }
    });
  });
}

function scheduleCommit() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(commitChanges, DEBOUNCE_MS);
}

function walkAndWatch(dir) {
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return;
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (['.git', 'node_modules', 'dist', 'build'].includes(e.name)) continue;
        walkAndWatch(full);
      } else {
        fs.watchFile(full, { interval: 500 }, (curr, prev) => {
          if (curr.mtimeMs !== prev.mtimeMs) scheduleCommit();
        });
      }
    }
  });
}

console.log('Starting autosave-commit watcher (will commit changes after save)...');
walkAndWatch(repoRoot);

process.on('SIGINT', () => {
  console.log('\nWatcher stopped');
  process.exit();
});

/* ============================================
   Manifest generator

   Indexes everything under content/ into content/manifest.json — title, path,
   and the real created / last-modified dates, taken from git history so no
   date is ever typed by hand.

   A .md file counts as a post only when its name matches its parent folder
   ("C/Bitfields/Bitfields.md"), which is what lets a post keep notes and
   images in the same directory without them being mistaken for posts.

   Run: node scripts/generate-manifest.mjs
   ============================================ */

import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, extname, relative, sep } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const SKIP_MD = new Set(['README.md', 'index.md', 'manifest.json', 'prompt.md']);

function git(args) {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// One pass over the whole history: path -> [commit dates, newest first].
function scanHistory() {
    const out = git(['log', '--name-only', '--format=%H|%ci']);
    const history = new Map();
    let current = null;

    for (const line of out.split('\n')) {
        if (line.includes('|')) {
            current = line.split('|').slice(1).join('|').trim();
        } else if (line.trim()) {
            const path = line.trim();
            if (!history.has(path)) history.set(path, []);
            history.get(path).push(current);
        }
    }
    return history;
}

// Renames break the fast scan (the new path only appears once), so fall back
// to --follow, which traverses them.
function followHistory(repoPath) {
    try {
        return git(['log', '--follow', '--format=%ci', '--', repoPath])
            .split('\n')
            .filter(Boolean);
    } catch {
        return [];
    }
}

function walk(dir, files = []) {
    for (const entry of readdirSync(dir)) {
        if (entry.startsWith('.')) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, files);
        else files.push(full);
    }
    return files;
}

function main() {
    const fastHistory = scanHistory();
    const posts = [];
    const svgs = [];

    for (const full of walk(CONTENT)) {
        const name = basename(full);
        if (name.startsWith('__')) continue;

        // path as stored in the manifest — relative to content/, POSIX style
        const path = relative(CONTENT, full).split(sep).join('/');
        const repoPath = `content/${path}`;

        let history = fastHistory.get(repoPath) || [];
        if (history.length <= 1) {
            const followed = followHistory(repoPath);
            if (followed.length) history = followed;
        }

        const created_date = history.length ? history[history.length - 1] : null;
        const last_modified_date = history.length ? history[0] : null;
        const ext = extname(name).toLowerCase();

        if (ext === '.md' && !SKIP_MD.has(name)) {
            // filename must match the folder it lives in
            if (basename(name, '.md') !== basename(dirname(full))) continue;
            posts.push({ title: basename(name, '.md'), path, created_date, last_modified_date });
        } else if (ext === '.svg') {
            svgs.push({ name: basename(name, '.svg'), path, created_date, last_modified_date });
        }
    }

    const byNewest = (a, b) => Date.parse(normalize(b.created_date)) - Date.parse(normalize(a.created_date));
    posts.sort(byNewest);
    svgs.sort(byNewest);

    writeFileSync(join(CONTENT, 'manifest.json'), JSON.stringify({ posts, svgs }, null, 2));
    console.log(`content/manifest.json — ${posts.length} posts, ${svgs.length} svgs`);
}

// "2026-05-31 22:38:32 +0530" -> parseable ISO
function normalize(str) {
    return String(str ?? '').replace(
        /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
        '$1T$2$3:$4'
    );
}

main();

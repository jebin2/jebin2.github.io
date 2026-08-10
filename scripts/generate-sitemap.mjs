/* ============================================
   Sitemap generator

   Rebuilds sitemap.xml from two sources:
     - static pages in this repo, dated by their last git commit
     - posts from the blog manifest, dated by last_modified_date

   Run: node scripts/generate-sitemap.mjs
   No dependencies; intended for the sitemap workflow, but safe to run locally.
   ============================================ */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.voidall.com';

const STATIC_PAGES = [
    { loc: '/',            file: 'index.html',      changefreq: 'weekly',  priority: '1.0' },
    { loc: '/projects',    file: 'projects.html',   changefreq: 'weekly',  priority: '0.9' },
    { loc: '/writing',     file: 'writing/index.html', changefreq: 'weekly',  priority: '0.8' },
    { loc: '/linksilike',  file: 'linksilike.html', changefreq: 'monthly', priority: '0.7' },
];

function xmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Last commit date for a file, as YYYY-MM-DD. Falls back to today when the
// file has no history yet (e.g. a fresh checkout in CI).
function gitLastModified(file) {
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
            cwd: ROOT,
            encoding: 'utf8',
        }).trim();
        return out || today();
    } catch {
        return today();
    }
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// "2026-05-31 22:38:32 +0530" -> "2026-05-31"
function manifestDate(str) {
    if (!str) return today();
    const iso = String(str).replace(
        /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
        '$1T$2$3:$4'
    );
    const d = new Date(iso);
    return isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
}

// The site reads content through jsDelivr for CDN caching, but jsDelivr holds
// branch refs for ~12h. This runs once a day and wants the newest manifest, so
// read the same file straight from the origin instead.
//   cdn.jsdelivr.net/gh/user/repo@ref/path -> raw.githubusercontent.com/user/repo/ref/path
function uncachedUrl(url) {
    return url.replace(
        /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^/@]+)@([^/]+)\//,
        'https://raw.githubusercontent.com/$1/$2/$3/'
    );
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
    return [
        '    <url>',
        `        <loc>${xmlEscape(loc)}</loc>`,
        `        <lastmod>${lastmod}</lastmod>`,
        `        <changefreq>${changefreq}</changefreq>`,
        `        <priority>${priority}</priority>`,
        '    </url>',
    ].join('\n');
}

async function main() {
    const config = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));

    const res = await fetch(uncachedUrl(config.blog_manifest));
    if (!res.ok) throw new Error(`manifest fetch failed → ${res.status}`);
    const posts = (await res.json()).posts || [];

    const entries = [
        ...STATIC_PAGES.map(p => ({
            loc: SITE + p.loc,
            lastmod: gitLastModified(p.file),
            changefreq: p.changefreq,
            priority: p.priority,
        })),
        ...posts.map(p => ({
            loc: `${SITE}/writing?post=${encodeURIComponent(p.path)}`,
            lastmod: manifestDate(p.last_modified_date || p.created_date),
            changefreq: 'monthly',
            priority: '0.6',
        })),
    ];

    const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        entries.map(urlEntry).join('\n') +
        '\n</urlset>\n';

    writeFileSync(join(ROOT, 'sitemap.xml'), xml);
    console.log(`sitemap.xml — ${STATIC_PAGES.length} pages, ${posts.length} posts`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

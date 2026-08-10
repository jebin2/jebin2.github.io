/* ============================================
   Post prerenderer

   Writes writing/<slug>/index.html for every post in content/manifest.json, with
   the markdown already rendered and real per-post metadata in <head>. Social
   unfurlers and non-JS crawlers read the raw HTML, so this is the only way
   they see anything post-specific.

   Run: node scripts/prerender.mjs   (needs `npm i marked` — CI installs it)
   ============================================ */

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { marked } from 'marked';

import { escapeHTML, slugifyTitle } from '../js/utils.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'writing');
const CONTENT = join(ROOT, 'content');
const SITE = 'https://www.voidall.com';
const DEFAULT_IMAGE = `${SITE}/assets/icons/android-chrome-512x512.png`;
const MAX_DESCRIPTION = 160;

function encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
}

// "C/Bitfields/Bitfields.md" -> "C/Bitfields"
function postDir(path) {
    return path.split('/').slice(0, -1).join('/');
}

// The displayed date is built from the literal YYYY-MM-DD in the manifest —
// that is already the author's local date. Formatting the parsed instant would
// depend on the machine's timezone, so CI and a laptop would disagree and
// rewrite these files on every run.
function formatDate(str) {
    const raw = String(str ?? '');
    const iso = raw.replace(
        /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/,
        '$1T$2$3:$4'
    );
    const d = new Date(iso);
    const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isNaN(d.getTime()) || !ymd) return { datetime: '', formatted: raw };

    const [, y, m, day] = ymd;
    const formatted = new Date(Date.UTC(+y, +m - 1, +day)).toLocaleDateString('en-US', {
        month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC',
    });
    return { datetime: d.toISOString(), formatted };
}

// First real paragraph, trimmed to a sensible preview length. The manifest has
// no description field, so this is where post descriptions actually come from.
function extractDescription(md) {
    const text = md
        .replace(/```[\s\S]*?```/g, '')          // fenced code
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')    // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> their text
        .replace(/^#{1,6}\s.*$/gm, '')           // headings: skip, don't unwrap
        .replace(/^\s*(?:[>*+-]|\d+\.)\s+/gm, '') // quote / list markers
        .replace(/^\s*[-*_]{3,}\s*$/gm, '')      // horizontal rules
        .replace(/[*_`]/g, '')
        .split(/\n\s*\n/)
        .map(s => s.replace(/\s+/g, ' ').trim())
        .find(s => s.length > 0) || '';

    if (text.length <= MAX_DESCRIPTION) return text;
    const cut = text.slice(0, MAX_DESCRIPTION);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

// Social unfurlers need an absolute URL, so site-relative asset paths get the
// domain prefixed back on.
function extractFirstImage(md, baseUrl) {
    const m = md.match(/!\[[^\]]*\]\(([^)\s]+)/);
    if (!m) return DEFAULT_IMAGE;
    const src = m[1];
    if (/^https?:\/\//i.test(src)) return src;
    const rel = baseUrl + encodePath(src);
    return rel.startsWith('/') ? SITE + rel : rel;
}

function renderPage({ meta, slug, html, description, image, markdownUrl }) {
    const created = formatDate(meta.created_date);
    const updated = formatDate(meta.last_modified_date || meta.created_date);
    const url = `${SITE}/writing/${slug}/`;
    const title = escapeHTML(meta.title);
    const desc = escapeHTML(description);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | jebin2</title>
    <meta name="author" content="jebin2">
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${url}">

    <meta property="og:type" content="article">
    <meta property="og:site_name" content="jebin2">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${escapeHTML(image)}">
    <meta property="article:published_time" content="${created.datetime}">
    <meta property="article:modified_time" content="${updated.datetime}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${escapeHTML(image)}">

    <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header></header>
    <main>
        <article data-post-path="${escapeHTML(meta.path)}" data-post-title="${title}" data-post-description="${desc}">
            <header>
                <a href="/#${slug}" id="${slug}"><h1>${title}</h1></a>
                <span>Author: <address>jebin2</address></span>
                <span>Published: <time datetime="${created.datetime}" pubdate>${escapeHTML(created.formatted)}</time></span>
                <span>Updated: <time datetime="${updated.datetime}">${escapeHTML(updated.formatted)}</time></span>
            </header>
            <section>
${html}
            </section>
        </article>
    </main>
    <footer></footer>

    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"
            integrity="sha384-F/bZzf7p3Joyp5psL90p/p89AZJsndkSoGwRpXcZhleCWhd8SnRuoYo4d0yirjJp"
            crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script type="module" src="/js/post.js"></script>
    <!-- source: ${escapeHTML(markdownUrl)} -->
</body>
</html>
`;
}

// Remove generated post directories that no longer have a post
function pruneStale(keepSlugs) {
    for (const entry of readdirSync(OUT_DIR)) {
        const dir = join(OUT_DIR, entry);
        if (!statSync(dir).isDirectory() || keepSlugs.has(entry)) continue;
        // Only ever delete directories this script generated
        if (existsSync(join(dir, '.generated'))) {
            rmSync(dir, { recursive: true, force: true });
            console.log(`  removed stale /writing/${entry}/`);
        }
    }
}

function main() {
    const config = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
    const posts = JSON.parse(readFileSync(join(CONTENT, 'manifest.json'), 'utf8')).posts || [];

    // Slugs must be unique — the browser derives them from the title alone, so
    // a collision would make two posts resolve to one page. Fail loudly.
    const bySlug = new Map();
    for (const p of posts) {
        const slug = slugifyTitle(p.title);
        if (!slug) throw new Error(`post title produces an empty slug: ${p.title}`);
        if (bySlug.has(slug)) {
            throw new Error(
                `slug collision "${slug}":\n  ${bySlug.get(slug).path}\n  ${p.path}\n` +
                `Rename one of these posts.`
            );
        }
        bySlug.set(slug, p);
    }

    const slugs = new Set();

    for (const [slug, meta] of bySlug) {
        const mdUrl = config.blog_base_url + encodePath(meta.path);
        const mdFile = join(CONTENT, meta.path);
        if (!existsSync(mdFile)) {
            console.warn(`  skipped ${meta.path} — file missing`);
            continue;
        }
        const md = readFileSync(mdFile, 'utf8');

        // Same transform as the client: drop the duplicated title heading and
        // resolve relative asset links against the post's directory on the CDN.
        const assetBase = `${config.blog_base_url}${encodePath(postDir(meta.path))}/`;
        const stripped = md.replace(/^#\s+.+\n*/m, '');
        const rewritten = stripped.replace(
            /\]\((?!https?:\/\/)([^)]+)\)/g,
            (_, p) => `](${assetBase}${encodePath(p)})`
        );

        const html = marked.parse(rewritten);
        const description = extractDescription(stripped);
        const image = extractFirstImage(stripped, assetBase);

        const dir = join(OUT_DIR, slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), renderPage({
            meta, slug, html, description, image, markdownUrl: mdUrl,
        }));
        // Marker so pruning only ever deletes directories this script created
        writeFileSync(join(dir, '.generated'), '');
        slugs.add(slug);
        console.log(`  /writing/${slug}/`);
    }

    pruneStale(slugs);
    console.log(`prerendered ${slugs.size} post(s)`);
}

try {
    main();
} catch (err) {
    console.error(err);
    process.exit(1);
}

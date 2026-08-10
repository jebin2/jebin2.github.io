/* ============================================
   Blog — listing + post view
   Lives in main site, loaded by blog repo's index.html
   ============================================ */

import { initPage, setPageMeta } from './shared.js';
import { fetchCached, fetchTextCached } from './cache.js';
import { sanitizeRenderedHTML, renderPostListing, buildReadsMap, dailyStatsQuery, escapeHTML, slugifyTitle } from './utils.js';
import { shareButtonsHTML, initShareButtons } from './share.js';
import { trackEvent, trackPageView } from './analytics.js';
import { fetchSupabaseJson } from './supabase.js';

async function init() {
    const params = new URLSearchParams(window.location.search);
    const postPath = params.get('post');
    // Served as 404.html when /writing/<slug>/ has not been prerendered yet —
    // a post is live in the manifest before the build catches up.
    const slug = window.location.pathname.match(/^\/writing\/([^/]+)\/?$/)?.[1];

    if (postPath) {
        await initPostView(p => p.path === decodeURIComponent(postPath));
    } else if (slug) {
        await initPostView(p => slugifyTitle(p.title) === slug);
    } else if (/^\/writing\/?$/.test(window.location.pathname)) {
        await initListingView();
    } else {
        // 404.html loads this module for any unknown URL — don't answer a dead
        // link with a full post listing as if nothing were wrong.
        renderNotFound();
    }
}

/* ============================================
   Listing view  (/blog/)
   ============================================ */
async function initListingView() {
    setPageMeta({ title: 'Writing | jebin2', path: '/writing/' });
    const config = await initPage('blog', { skipTrackPageView: true });
    trackPageView('writing');

    const main = document.querySelector('main');
    main.innerHTML = `<ul id="posts-list"></ul>`;

    let manifestData = [];

    try {
        const [manifest, statsRows, dailyRows] = await Promise.all([
            fetchCached(config.blog_manifest),
            fetchSupabaseJson('rpc/get_stats').catch(() => []),
            fetchSupabaseJson(`rpc/get_stats${dailyStatsQuery()}`).catch(() => [])
        ]);
        manifestData = manifest.posts || [];
        renderPostListing(
            manifestData,
            document.getElementById('posts-list'),
            buildReadsMap(statsRows),
            buildReadsMap(dailyRows)
        );
    } catch (err) {
        console.error(err);
        document.getElementById('posts-list').innerHTML =
            '<li><p>failed to load posts.</p></li>';
    }
}

async function renderNotFound() {
    await initPage('blog', { skipTrackPageView: true });
    setPageMeta({ title: 'Not found | jebin2', path: '/writing/' });
    const main = document.querySelector('main');
    if (main) main.innerHTML = '<p>page not found. <a href="/">back to posts</a></p>';
}

/* ============================================
   Post view — resolves a post from the manifest, then renders it client-side.
   Reached via /writing/?post=<path> or as the 404 fallback for a
   /writing/<slug>/ page that has not been prerendered yet.
   ============================================ */
async function initPostView(matchPost) {
    const config = await initPage('blog', { skipTrackPageView: true });

    const main = document.querySelector('main');
    main.innerHTML = `<p>Loading...</p>`;

    try {
        const manifest = await fetchCached(config.blog_manifest);
        const meta = (manifest.posts || []).find(matchPost);

        if (!meta) {
            renderNotFound();
            return;
        }

        const mdText = await fetchTextCached(config.blog_base_url + meta.path);

        // Canonical points at the prerendered page, so the two URLs for a post
        // consolidate rather than compete.
        setPageMeta({
            title: `${meta.title} | jebin2`,
            description: meta.description,
            path: `/writing/${slugifyTitle(meta.title)}/`,
            type: 'article',
        });
        trackPageView(meta.title);
        trackEvent('post_read', meta.title);

        renderPost(mdText, meta, main, config.blog_base_url);
    } catch (err) {
        console.error(err);
        main.innerHTML = '<p>failed to load post.</p>';
    }
}

// contentBaseUrl comes from config.blog_base_url so the content host is
// configured in one place; relative asset links in the markdown resolve
// against the post's own directory there.
function renderPost(mdText, meta, container, contentBaseUrl = '') {
    const rawDir = meta ? getPostDir(meta.path) : '';
    const baseUrl = meta
        ? `${contentBaseUrl}${rawDir.split('/').map(encodeURIComponent).join('/')}/`
        : '';
    const strippedMd = mdText.replace(/^#\s+.+\n*/m, '');
    const rewritten = baseUrl
        ? strippedMd.replace(/\]\((?!https?:\/\/)([^)]+)\)/g, (_, p) => `](${baseUrl}${p.split('/').map(encodeURIComponent).join('/')})`)
        : strippedMd;
    const htmlContent = sanitizeRenderedHTML(window.marked.parse(rewritten));

    const dt = new Date(meta?.created_date || Date.now());
    let datetimeStr = '';
    let formattedDate = meta?.created_date || '';
    if (!isNaN(dt.getTime())) {
        datetimeStr = dt.toISOString();
        formattedDate = dt.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        });
    }

    const dtUpdated = new Date(meta?.last_modified_date || meta?.created_date || Date.now());
    let datetimeStrUpdated = '';
    let formattedDateUpdated = meta?.last_modified_date || meta?.created_date || '';
    if (!isNaN(dtUpdated.getTime())) {
        datetimeStrUpdated = dtUpdated.toISOString();
        formattedDateUpdated = dtUpdated.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        });
    }

    const articleId = slugifyTitle(meta?.title || 'untitled');
    const shareButtons = shareButtonsHTML(meta);

    container.innerHTML = `
        <article>
            <header>
                <a href="/#${escapeHTML(articleId)}" id="${escapeHTML(articleId)}"><h1>${escapeHTML(meta?.title || 'untitled')}</h1></a>
                <span>Author: <address>jebin2</address></span>
                <span>Published: <time datetime="${escapeHTML(datetimeStr)}" pubdate>${escapeHTML(formattedDate)}</time></span>
                <span>Updated: <time datetime="${escapeHTML(datetimeStrUpdated)}">${escapeHTML(formattedDateUpdated)}</time></span>
                ${shareButtons}
            </header>
            <section>
                ${htmlContent}
            </section>
        </article>
    `;

    initShareButtons({
        title: meta?.title || 'untitled',
        getHtml: () => htmlContent,
        getMarkdown: async () => rewritten,
    });

    if (window.hljs) {
        container.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightElement(block);
        });
    }
}


/* ---- helpers ---- */
// Returns the directory containing the post MD
// e.g. "C/Bitfields/Bitfields.md" → "C/Bitfields"
function getPostDir(path) {
    const parts = path.split('/');
    return parts.slice(0, -1).join('/');
}

init();

/* ============================================
   Blog — listing + post view
   Lives in main site, loaded by blog repo's index.html
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached, fetchTextCached } from './cache.js';
import { sanitizeRenderedHTML } from './utils.js';
import { trackEvent, trackPageView } from './analytics.js';

async function init() {
    const params = new URLSearchParams(window.location.search);
    const postPath = params.get('post');

    if (postPath) {
        await initPostView(decodeURIComponent(postPath));
    } else {
        await initListingView();
    }
}

/* ============================================
   Listing view  (/blog/)
   ============================================ */
async function initListingView() {
    document.title = 'jebin2 — writing';
    const config = await initPage('blog', { skipTrackPageView: true });
    trackPageView('writing');

    const main = document.querySelector('main');
    main.innerHTML = `<ul id="posts-list"></ul>`;

    let manifestData = [];

    try {
        const manifest = await fetchCached(config.blog_manifest);
        manifestData = manifest.posts || [];
        renderListing(manifestData, document.getElementById('posts-list'));
    } catch (err) {
        console.error(err);
        document.getElementById('posts-list').innerHTML =
            '<li><p>failed to load posts.</p></li>';
    }
}

function renderListing(posts, container) {
    if (!container) return;

    if (!posts.length) {
        container.innerHTML = '<li><p>no posts yet.</p></li>';
        return;
    }

    // Sort newest first
    const sorted = posts.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    container.innerHTML = sorted.map((p, i) => {
        const slug = encodeURIComponent(p.path);
        const articleId = p.title.toLowerCase().replace(/\\W+/g, '-');
        const dt = new Date(p.created_date);
        
        let datetimeStr = '';
        let formattedDate = p.created_date;
        if (!isNaN(dt.getTime())) {
            datetimeStr = dt.toISOString();
            formattedDate = dt.toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            });
        }
        
        return `
            <li>
                <article id="${articleId}">
                    <a href="/writing?post=${slug}"><h2>${p.title}</h2></a>
                    <time datetime="${datetimeStr}">${formattedDate}</time>
                    <p>${p.description || ''}</p>
                    <footer>
                        <a href="/writing?post=${slug}">Read more about ${p.title}</a>
                    </footer>
                </article>
            </li>
        `;
    }).join('');
}

/* ============================================
   Post view  (/blog/?post=path/to/post.md)
   ============================================ */
async function initPostView(postPath) {
    const config = await initPage('blog', { skipTrackPageView: true });

    const main = document.querySelector('main');
    main.innerHTML = `<p>Loading...</p>`;

    try {
        const [manifest, mdText] = await Promise.all([
            fetchCached(config.blog_manifest),
            fetchTextCached(config.blog_base_url + postPath)
        ]);

        const posts = manifest.posts || [];
        const meta = posts.find(p => p.path === postPath);

        document.title = meta ? `${meta.title} | jebin2` : 'Writing | jebin2';
        trackPageView(meta?.title || 'writing');
        if (meta?.title) trackEvent('post_read', meta.title);

        renderPost(mdText, meta, main);
    } catch (err) {
        console.error(err);
        main.innerHTML = '<p>failed to load post.</p>';
    }
}

function renderPost(mdText, meta, container) {
    const rawDir = meta ? getPostDir(meta.path) : '';
    const baseUrl = meta
        ? `https://raw.githubusercontent.com/jebin2/blog/main/${rawDir.split('/').map(encodeURIComponent).join('/')}/`
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

    const articleId = meta?.title ? meta.title.toLowerCase().replace(/\W+/g, '-') : 'untitled';
    const linkSlug = meta ? encodeURIComponent(meta.path) : '';
    
    container.innerHTML = `
        <article>
            <header>
                <a href="/#${articleId}" id="${articleId}"><h1>${meta?.title || 'untitled'}</h1></a>
                <span>Author: <address>jebin2</address></span>
                <span>Published: <time datetime="${datetimeStr}" pubdate>${formattedDate}</time></span>
                <span>Updated: <time datetime="${datetimeStrUpdated}">${formattedDateUpdated}</time></span>
            </header>
            <section>
                ${htmlContent}
            </section>
        </article>
    `;

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

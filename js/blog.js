/* ============================================
   Blog — listing + post view
   Lives in main site, loaded by blog repo's index.html
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached, fetchTextCached } from './cache.js';
import { formatDate, formatDateShort } from './utils.js';

async function init() {
    const params   = new URLSearchParams(window.location.search);
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
    const config = await initPage('blog');
    document.title = 'jebin2 — blog';

    const main = document.querySelector('main.container');
    main.innerHTML = `
        <div class="section-label">// writing</div>
        <p class="links-subtitle">notes on things i build and learn.</p>
        <div id="posts-list">${renderSkeletonRows(6)}</div>
    `;

    try {
        const manifest = await fetchCached(config.blog_manifest);
        renderListing(manifest.posts || [], document.getElementById('posts-list'));
    } catch (err) {
        console.error(err);
        document.getElementById('posts-list').innerHTML =
            '<p class="state-msg">failed to load posts.</p>';
    }
}

function renderListing(posts, container) {
    if (!container) return;

    if (!posts.length) {
        container.innerHTML = '<p class="state-msg">no posts yet.</p>';
        return;
    }

    // Sort newest first
    const sorted = posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by folder (category)
    const groups = {};
    sorted.forEach(p => {
        const cat = getCategory(p.path);
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(p);
    });

    container.innerHTML = Object.entries(groups).map(([cat, items]) => `
        <div class="project-group">
            <div class="group-label">— ${cat} —</div>
            <div class="project-group-items">
                ${items.map(p => `
                    <a class="blog-row" href="/writing?post=${encodeURIComponent(p.path)}">
                        <span class="blog-title">${p.title}</span>
                        <span class="blog-meta">
                            <span class="blog-cat">[ ${cat} ]</span>
                            <span class="blog-date">${formatDateShort(p.date)}</span>
                        </span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/* ============================================
   Post view  (/blog/?post=path/to/post.md)
   ============================================ */
async function initPostView(postPath) {
    const config = await initPage('blog');

    const main = document.querySelector('main.container');
    main.innerHTML = `<div class="post-skeleton">${renderSkeletonRows(10)}</div>`;

    try {
        const [manifest, mdText] = await Promise.all([
            fetchCached(config.blog_manifest),
            fetchTextCached(config.blog_base_url + postPath)
        ]);

        const posts      = manifest.posts || [];
        const meta       = posts.find(p => p.path === postPath);
        const idx        = posts.findIndex(p => p.path === postPath);
        const prevPost   = idx < posts.length - 1 ? posts[idx + 1] : null;
        const nextPost   = idx > 0                ? posts[idx - 1] : null;

        document.title = meta ? `jebin2 — ${meta.title}` : 'jebin2 — blog';

        renderPost(mdText, meta, prevPost, nextPost, main);
    } catch (err) {
        console.error(err);
        main.innerHTML = '<p class="state-msg">failed to load post.</p>';
    }
}

function renderPost(mdText, meta, prevPost, nextPost, container) {
    const cat         = meta ? getCategory(meta.path) : '';
    const htmlContent = window.marked.parse(mdText);

    container.innerHTML = `
        <a class="back-link" href="/writing">← writing</a>

        <div class="post-header">
            <h1 class="post-title">${meta?.title || 'untitled'}</h1>
            <div class="post-meta">
                <span class="blog-date">${formatDate(meta?.date || '')}</span>
                ${cat ? `<span class="blog-cat">[ ${cat} ]</span>` : ''}
            </div>
        </div>

        <div class="post-body">${htmlContent}</div>

        <nav class="post-nav">
            <div>
                ${prevPost
                    ? `<a href="?post=${encodeURIComponent(prevPost.path)}">← ${prevPost.title}</a>`
                    : ''}
            </div>
            <div>
                ${nextPost
                    ? `<a href="?post=${encodeURIComponent(nextPost.path)}">${nextPost.title} →</a>`
                    : ''}
            </div>
        </nav>
    `;

    // Syntax-highlight all code blocks
    container.querySelectorAll('pre code').forEach(block => {
        window.hljs?.highlightElement(block);
    });
}

/* ---- helpers ---- */
function getCategory(path) {
    const parts = path.split('/');
    return parts.length > 1 ? parts[0].toLowerCase() : 'misc';
}

init();

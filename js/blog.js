/* ============================================
   Blog — listing + post view
   Lives in main site, loaded by blog repo's index.html
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached, fetchTextCached } from './cache.js';
import { formatDate, formatDateShort, sanitizeRenderedHTML } from './utils.js';
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

    const main = document.querySelector('main.container');
    main.innerHTML = `
        <div class="divider"></div>
        <div class="section-label">Writing</div>
        
        <div class="flex flex-col md:flex-row gap-8 mt-8">
            <div class="flex-1">
                <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                    <p class="links-subtitle text-2xl font-bold opacity-70">notes on things i build and learn.</p>
                    
                    <div class="relative w-full sm:w-64">
                        <input type="text" id="blog-search" 
                               placeholder="search posts..." 
                               class="w-full bg-surface-glass border-3 border-crayon-blue rounded-xl p-2 pl-10 text-lg font-bold outline-none organic-shape"
                               style="filter: url('#crayon-texture');">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-crayon-blue text-xl">search</span>
                    </div>
                </div>

                <div class="divider opacity-30"></div>
                <div id="posts-list">${renderSkeletonRows(6)}</div>
            </div>

            <div class="w-full md:w-64 flex-shrink-0 mt-4 md:mt-12">
                <div class="sticky-note rotate-2">
                    <h3 class="text-xl font-bold mb-2">Notebook</h3>
                    <p>this is where i document my technical deep-dives and creative discoveries.</p>
                    <div class="mt-4 text-sm opacity-60 italic">— jebin</div>
                </div>
            </div>
        </div>
    `;

    const searchEl = document.getElementById('blog-search');
    let manifestData = [];

    try {
        const manifest = await fetchCached(config.blog_manifest);
        manifestData = manifest.posts || [];
        renderListing(manifestData, document.getElementById('posts-list'));

        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = manifestData.filter(p => 
                    p.title.toLowerCase().includes(query)
                );
                renderListing(filtered, document.getElementById('posts-list'));
            });

        }
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
            <div class="section-label" style="font-size: 1.5rem;">${cat}</div>
            <div class="project-group-items">
                ${items.map((p, i) => {
                    const rotate = (i % 2 === 0 ? 0.4 : -0.4) + (Math.random() * 0.2 - 0.1);
                    return `
                        <a class="project-row sketch-card bg-surface" href="/writing?post=${encodeURIComponent(p.path)}" style="--rotate: ${rotate}deg">
                            <div class="flex flex-col flex-grow">
                                <span class="project-name">${p.title}</span>
                                <span class="blog-date text-sm opacity-60">${formatDateShort(p.date)}</span>
                            </div>
                            <span class="material-symbols-outlined text-crayon-blue">edit_note</span>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

/* ============================================
   Post view  (/blog/?post=path/to/post.md)
   ============================================ */
async function initPostView(postPath) {
    const config = await initPage('blog', { skipTrackPageView: true });

    const main = document.querySelector('main.container');
    main.innerHTML = `<div class="post-skeleton">${renderSkeletonRows(10)}</div>`;

    try {
        const [manifest, mdText] = await Promise.all([
            fetchCached(config.blog_manifest),
            fetchTextCached(config.blog_base_url + postPath)
        ]);

        const posts = manifest.posts || [];
        const meta = posts.find(p => p.path === postPath);
        const idx = posts.findIndex(p => p.path === postPath);
        const prevPost = idx < posts.length - 1 ? posts[idx + 1] : null;
        const nextPost = idx > 0 ? posts[idx - 1] : null;

        document.title = meta ? `jebin2 — ${meta.title}` : 'jebin2 — writing';
        trackPageView(meta?.title || 'writing');
        if (meta?.title) trackEvent('post_read', meta.title);

        renderPost(mdText, meta, prevPost, nextPost, main);
    } catch (err) {
        console.error(err);
        main.innerHTML = '<p class="state-msg">failed to load post.</p>';
    }
}

function renderPost(mdText, meta, prevPost, nextPost, container) {
    const cat = meta ? getCategory(meta.path) : '';
    // Rewrite relative links/images to absolute raw GitHub URLs
    const baseUrl = meta
        ? `https://raw.githubusercontent.com/jebin2/blog/main/${getPostDir(meta.path)}/`
        : '';
    const rewritten = baseUrl
        ? mdText.replace(/\]\((?!https?:\/\/)([^)]+)\)/g, `](${baseUrl}$1)`)
        : mdText;
    const htmlContent = sanitizeRenderedHTML(window.marked.parse(rewritten));

    container.innerHTML = `
        <a class="back-link font-accent text-2xl" href="/writing">back to writing</a>

        <div class="post-header organic-shape bg-surface p-8 border-4 border-crayon-blue mb-12 shadow-md">
            <h1 class="post-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">${meta?.title || 'untitled'}</h1>
            <div class="post-meta font-accent text-xl text-crayon-dim">
                <span class="material-symbols-outlined text-crayon-orange">calendar_today</span>
                <span class="mr-4">${formatDate(meta?.date || '')}</span>
                ${cat ? `
                    <span class="material-symbols-outlined text-crayon-purple">folder</span>
                    <span>${cat}</span>
                ` : ''}
            </div>
        </div>

        <article class="post-body bg-surface organic-shape p-8 border-4 border-crayon-light-blue shadow-sm mb-12">${htmlContent}</article>

        <nav class="post-nav flex justify-between gap-4">
            <div class="flex-1">
                ${prevPost
            ? `<a class="crayon-button organic-shape block p-4 bg-surface text-center hover:bg-crayon-blue/10" href="?post=${encodeURIComponent(prevPost.path)}">
                    <div class="text-sm opacity-60 font-accent">Previous</div>
                    <div class="font-bold">${prevPost.title}</div>
               </a>`
            : ''}
            </div>
            <div class="flex-1">
                ${nextPost
            ? `<a class="crayon-button organic-shape block p-4 bg-surface text-center hover:bg-crayon-blue/10" href="?post=${encodeURIComponent(nextPost.path)}">
                    <div class="text-sm opacity-60 font-accent">Next</div>
                    <div class="font-bold">${nextPost.title}</div>
               </a>`
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

// Returns the directory containing the post MD
// e.g. "C/Bitfields/Bitfields.md" → "C/Bitfields"
function getPostDir(path) {
    const parts = path.split('/');
    return parts.slice(0, -1).join('/');
}

init();

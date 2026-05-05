/* ============================================
   Blog — listing + post view
   Lives in main site, loaded by blog repo's index.html
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached, fetchTextCached } from './cache.js';
import { sanitizeRenderedHTML, isAdmin } from './utils.js';
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

    const currentUrl = window.location.origin + window.location.pathname + window.location.search;
    const tweetText = meta?.description
        ? `${meta.title}\n\n${meta.description}\n\n${currentUrl}`
        : `Read: ${meta?.title || 'untitled'}\n\n${currentUrl}`;
    const xIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    const shareButtons = isAdmin() ? `
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="${xIntentUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.25rem 0.75rem; border: 1px solid currentColor; border-radius: 4px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
                Share on X
            </a>
            <button id="prepare-x-article" style="display: inline-block; padding: 0.25rem 0.75rem; border: 1px solid var(--accent); color: var(--accent); background: transparent; border-radius: 4px; text-decoration: none; font-size: 0.875rem; font-weight: 500; cursor: pointer;">
                Post as X Article
            </button>
        </div>
    ` : '';

    container.innerHTML = `
        <article>
            <header>
                <a href="/#${articleId}" id="${articleId}"><h1>${meta?.title || 'untitled'}</h1></a>
                <span>Author: <address>jebin2</address></span>
                <span>Published: <time datetime="${datetimeStr}" pubdate>${formattedDate}</time></span>
                <span>Updated: <time datetime="${datetimeStrUpdated}">${formattedDateUpdated}</time></span>
                ${shareButtons}
            </header>
            <section>
                ${htmlContent}
            </section>
        </article>
    `;

    document.getElementById('prepare-x-article')?.addEventListener('click', () => {
        showXArticleModal(meta?.title || 'untitled', htmlContent, rewritten);
    });

    if (window.hljs) {
        container.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightElement(block);
        });
    }
}


/* ---- X Article Modal Logic ---- */
function showXArticleModal(title, bodyHtml, bodyMarkdown) {
    let overlay = document.querySelector('.x-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'x-modal-overlay';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="x-modal">
            <h2>Prepare X Article</h2>
            <p style="font-size: 0.875rem; color: var(--fg-muted); margin: 0;">
                Copy the title and body below. The body is copied as <b>Rich Text</b> to preserve formatting (headers, bold, etc.) when pasting into X.
            </p>
            
            <div class="x-modal-field">
                <label>1. Article Title</label>
                <div class="field-row">
                    <input type="text" id="x-title" value="${title}" readonly>
                    <button class="x-btn" onclick="copyField('x-title')">Copy Title</button>
                </div>
            </div>

            <div class="x-modal-field">
                <label>2. Article Body</label>
                <div class="field-row" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
                    <div id="x-body-preview" style="width: 100%; height: 100px; overflow-y: auto; background: var(--bg0); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.5rem; font-size: 0.75rem; color: var(--fg-muted);">
                        ${bodyHtml}
                    </div>
                    <button class="x-btn primary" id="copy-rich-btn" style="width: 100%;">Copy Body (Rich Text)</button>
                </div>
            </div>

            <div class="x-modal-actions">
                <button class="x-btn" onclick="document.querySelector('.x-modal-overlay').style.display='none'">Cancel</button>
                <a href="https://x.com/compose/articles" target="_blank" class="x-btn" onclick="document.querySelector('.x-modal-overlay').style.display='none'">Open X Composer</a>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';

    document.getElementById('copy-rich-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        try {
            // Create a temporary div to hold the HTML for copying
            // We want to make sure it's clean for X's editor
            const blob = new Blob([bodyHtml], { type: 'text/html' });
            const plainBlob = new Blob([bodyMarkdown], { type: 'text/plain' });
            const data = [new ClipboardItem({ 
                'text/html': blob,
                'text/plain': plainBlob
            })];
            
            await navigator.clipboard.write(data);
            
            const oldText = btn.innerText;
            btn.innerText = 'Copied Rich Text!';
            setTimeout(() => btn.innerText = oldText, 2000);
        } catch (err) {
            console.error('Failed to copy rich text:', err);
            btn.innerText = 'Failed to copy';
        }
    });
}

// Global helper for the inline onclicks
window.copyField = (id) => {
    const el = document.getElementById(id);
    el.select();
    document.execCommand('copy');
    const btn = el.nextElementSibling;
    const oldText = btn.innerText;
    btn.innerText = 'Copied!';
    setTimeout(() => btn.innerText = oldText, 2000);
};

/* ---- helpers ---- */
// Returns the directory containing the post MD
// e.g. "C/Bitfields/Bitfields.md" → "C/Bitfields"
function getPostDir(path) {
    const parts = path.split('/');
    return parts.slice(0, -1).join('/');
}

init();

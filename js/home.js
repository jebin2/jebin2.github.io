/* ============================================
   Homepage
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached } from './cache.js';
import { formatDateShort } from './utils.js';

async function init() {
    const config = await initPage('');

    const featuredEl = document.getElementById('featured-list');
    const blogEl     = document.getElementById('blog-list');

    // Show skeletons while loading
    if (featuredEl) featuredEl.innerHTML = renderSkeletonRows(5);
    if (blogEl)     blogEl.innerHTML     = renderSkeletonRows(3);

    try {
        const [projects, manifest] = await Promise.all([
            fetchCached(config.projects),
            fetchCached(config.blog_manifest).catch(() => ({ posts: [] }))
        ]);

        renderFeatured(projects, featuredEl);
        renderLatestPosts(manifest, blogEl);
    } catch (err) {
        console.error(err);
        if (featuredEl) featuredEl.innerHTML = '<p class="state-msg">failed to load projects.</p>';
        if (blogEl)     blogEl.innerHTML     = '<p class="state-msg">failed to load posts.</p>';
    }
}

function renderFeatured(projects, container) {
    if (!container) return;

    const featured = projects.filter(p => p.featured).slice(0, 5);

    if (!featured.length) {
        container.innerHTML = '<p class="state-msg">no featured projects.</p>';
        return;
    }

    container.innerHTML = featured.map((p, i) => `
        <a class="project-row" href="${p.url}" target="_blank" rel="noopener noreferrer"
           title="${p.description}">
            <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
            <span class="project-name">${p.title}</span>
            <span class="project-desc">${p.description}</span>
            <span class="project-tag">[ ${p.category} ]</span>
        </a>
    `).join('');
}

function renderLatestPosts(manifest, container) {
    if (!container) return;

    const posts = (manifest.posts || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    if (!posts.length) {
        container.innerHTML = '<p class="state-msg">no posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(p => {
        const slug = encodeURIComponent(p.path);
        return `
            <a class="blog-row" href="/writing?post=${slug}">
                <span class="blog-title">${p.title}</span>
                <span class="blog-meta">
                    <span class="blog-date">${formatDateShort(p.date)}</span>
                </span>
            </a>
        `;
    }).join('');
}

init();

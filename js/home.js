/* ============================================
   Homepage
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached } from './cache.js';
import { formatDateShort } from './utils.js';
import { trackEvent } from './analytics.js';

const SUPABASE_URL = 'https://bfqcfhvpauvvakgmeuhr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yH1CSzF3YQ8FpU-hF-QEtg_ZWaKDLsR';
const HEADERS = {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
};

async function fetchStats(view) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${view}?select=*`, { headers: HEADERS });
        if (!res.ok) return [];
        return res.json();
    } catch { return []; }
}

async function fetchRecentEvents(eventType) {
    try {
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const url = `${SUPABASE_URL}/rest/v1/events?select=label&event_type=eq.${eventType}&created_at=gte.${twoWeeksAgo}`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return {};
        const rows = await res.json();
        // Count occurrences per label
        return rows.reduce((acc, r) => {
            acc[r.label] = (acc[r.label] || 0) + 1;
            return acc;
        }, {});
    } catch { return {}; }
}

// Smart sort: slots 1-2 = recent (last 2 weeks), slots 3-5 = all-time
// If no recent data, all 5 = all-time
function smartSort(items, recentCounts, allTimeCounts, labelKey) {
    const recentItems = items
        .filter(item => recentCounts[item[labelKey]] > 0)
        .sort((a, b) => (recentCounts[b[labelKey]] || 0) - (recentCounts[a[labelKey]] || 0));

    if (!recentItems.length) {
        // No recent data — sort all by all-time count
        return items
            .slice()
            .sort((a, b) => (allTimeCounts[b[labelKey]] || 0) - (allTimeCounts[a[labelKey]] || 0))
            .slice(0, 5);
    }

    const top2 = recentItems.slice(0, 2);
    const top2Labels = new Set(top2.map(i => i[labelKey]));

    const top3 = items
        .filter(item => !top2Labels.has(item[labelKey]))
        .sort((a, b) => (allTimeCounts[b[labelKey]] || 0) - (allTimeCounts[a[labelKey]] || 0))
        .slice(0, 3);

    return [...top2, ...top3];
}

async function init() {
    const config = await initPage('');

    const featuredEl = document.getElementById('featured-list');
    const blogEl     = document.getElementById('blog-list');

    if (featuredEl) featuredEl.innerHTML = renderSkeletonRows(5);
    if (blogEl)     blogEl.innerHTML     = renderSkeletonRows(3);

    try {
        const [projects, manifest, projectStats, postStats, recentProjects, recentPosts] = await Promise.all([
            fetchCached(config.projects),
            fetchCached(config.blog_manifest).catch(() => ({ posts: [] })),
            fetchStats('stats_project_clicks'),
            fetchStats('stats_post_reads'),
            fetchRecentEvents('project_click'),
            fetchRecentEvents('post_read')
        ]);

        // Build all-time lookup maps
        const projectAllTime = {};
        projectStats.forEach(r => { projectAllTime[r.project] = r.clicks; });

        const postAllTime = {};
        postStats.forEach(r => { postAllTime[r.post] = r.reads; });

        renderFeatured(projects, featuredEl, recentProjects, projectAllTime);
        renderLatestPosts(manifest, blogEl, recentPosts, postAllTime);
    } catch (err) {
        console.error(err);
        if (featuredEl) featuredEl.innerHTML = '<p class="state-msg">failed to load projects.</p>';
        if (blogEl)     blogEl.innerHTML     = '<p class="state-msg">failed to load posts.</p>';
    }
}

function renderFeatured(projects, container, recentCounts, allTimeCounts) {
    if (!container) return;

    const featured = projects.filter(p => p.featured);

    if (!featured.length) {
        container.innerHTML = '<p class="state-msg">no featured projects.</p>';
        return;
    }

    const sorted = smartSort(featured, recentCounts, allTimeCounts, 'title');

    container.innerHTML = sorted.map((p, i) => `
        <a class="project-row" href="${p.url}" target="_blank" rel="noopener noreferrer"
           title="${p.description}" data-track="${p.title}">
            <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
            <span class="project-name">${p.title}</span>
            <span class="project-desc">${p.description}</span>
            <span class="project-tag">[ ${p.category} ]</span>
        </a>
    `).join('');

    container.addEventListener('click', e => {
        const row = e.target.closest('[data-track]');
        if (row) trackEvent('project_click', row.dataset.track);
    });
}

function renderLatestPosts(manifest, container, recentCounts, allTimeCounts) {
    if (!container) return;

    const posts = manifest.posts || [];

    if (!posts.length) {
        container.innerHTML = '<p class="state-msg">no posts yet.</p>';
        return;
    }

    const sorted = smartSort(posts, recentCounts, allTimeCounts, 'title');

    container.innerHTML = sorted.map((p, i) => {
        const slug = encodeURIComponent(p.path);
        return `
            <a class="project-row" href="/writing?post=${slug}" data-track="${p.title}">
                <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
                <span class="project-name">${p.title}</span>
                <span class="blog-date">${formatDateShort(p.date)}</span>
            </a>
        `;
    }).join('');

    container.addEventListener('click', e => {
        const row = e.target.closest('[data-track]');
        if (row) trackEvent('post_read', row.dataset.track);
    });
}

init();

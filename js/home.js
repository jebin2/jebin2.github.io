/* ============================================
   Homepage
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached } from './cache.js';
import { formatDateShort } from './utils.js';
import { fetchSupabaseJson } from './supabase.js';

async function fetchStats(view) {
    try {
        return await fetchSupabaseJson(`${view}?select=*`);
    } catch { return []; }
}

async function fetchRecentEvents(eventType) {
    try {
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const rows = await fetchSupabaseJson(
            `events?select=label&event_type=eq.${eventType}&created_at=gte.${twoWeeksAgo}`
        );
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
    const blogEl = document.getElementById('blog-list');

    if (featuredEl) featuredEl.innerHTML = renderSkeletonRows(5);
    if (blogEl) blogEl.innerHTML = renderSkeletonRows(3);

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
        if (blogEl) blogEl.innerHTML = '<p class="state-msg">failed to load posts.</p>';
    }
}

function renderFeatured(projects, container, recentCounts, allTimeCounts) {
    if (!container) return;

    if (!projects.length) {
        container.innerHTML = '<p class="state-msg">no projects.</p>';
        return;
    }

    const sorted = smartSort(projects, recentCounts, allTimeCounts, 'title');

    container.innerHTML = `
        <div class="project-group-items">
            ${sorted.map((p, i) => {
                const rotate = (i % 2 === 0 ? 0.5 : -0.5) + (Math.random() * 0.4 - 0.2);
                const tape = i === 0 ? '<div class="tape"></div>' : '';
                return `
                    <a class="project-row sketch-card bg-surface" href="${p.url}" target="_blank" rel="noopener noreferrer"
                       title="${p.description}" style="--rotate: ${rotate}deg">
                        ${tape}
                        <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
                        <div class="flex flex-col flex-grow">
                            <span class="project-name">${p.title}</span>
                            <span class="project-desc">${p.description}</span>
                        </div>
                        <span class="project-tag">${p.category}</span>
                    </a>
                `;
            }).join('')}
        </div>
    `;
}

function renderLatestPosts(manifest, container, recentCounts, allTimeCounts) {
    if (!container) return;

    const posts = manifest.posts || [];

    if (!posts.length) {
        container.innerHTML = '<p class="state-msg">no posts yet.</p>';
        return;
    }

    const sorted = smartSort(posts, recentCounts, allTimeCounts, 'title');

    container.innerHTML = `
        <div class="project-group-items">
            ${sorted.map((p, i) => {
                const slug = encodeURIComponent(p.path);
                const rotate = (i % 2 === 0 ? -0.5 : 0.5) + (Math.random() * 0.4 - 0.2);
                const tape = i === 1 ? '<div class="tape"></div>' : '';
                return `
                    <a class="project-row sketch-card bg-surface" href="/writing?post=${slug}" style="--rotate: ${rotate}deg">
                        ${tape}
                        <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
                        <div class="flex flex-col flex-grow">
                            <span class="project-name">${p.title}</span>
                            <span class="blog-date text-sm opacity-60">${formatDateShort(p.date)}</span>
                        </div>
                        <span class="material-symbols-outlined text-crayon-purple">arrow_forward</span>
                    </a>
                `;
            }).join('')}
        </div>
    `;
}

init();

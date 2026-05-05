/* ============================================
   Homepage
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';
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
            .sort((a, b) => (allTimeCounts[b[labelKey]] || 0) - (allTimeCounts[a[labelKey]] || 0));
    }

    const top2 = recentItems.slice(0, 2);
    const top2Labels = new Set(top2.map(i => i[labelKey]));

    const top3 = items
        .filter(item => !top2Labels.has(item[labelKey]))
        .sort((a, b) => (allTimeCounts[b[labelKey]] || 0) - (allTimeCounts[a[labelKey]] || 0));

    return [...top2, ...top3];
}

async function init() {
    const config = await initPage('');

    const blogEl = document.getElementById('blog-list');

    try {
        const [manifest, postStats, recentPosts] = await Promise.all([
            fetchCached(config.blog_manifest).catch(() => ({ posts: [] })),
            fetchStats('stats_post_reads'),
            fetchRecentEvents('post_read')
        ]);

        const postAllTime = {};
        postStats.forEach(r => { postAllTime[r.post] = r.reads; });

        renderLatestPosts(manifest, blogEl, recentPosts, postAllTime);
    } catch (err) {
        console.error(err);
        if (blogEl) blogEl.innerHTML = '<li><p>failed to load posts.</p></li>';
    }
}

function renderLatestPosts(manifest, container, recentCounts, allTimeCounts) {
    if (!container) return;

    const posts = manifest.posts || [];

    if (!posts.length) {
        container.innerHTML = '<li><p>no posts yet.</p></li>';
        return;
    }

    const sorted = smartSort(posts, recentCounts, allTimeCounts, 'title');

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

init();


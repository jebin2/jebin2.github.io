/* ============================================
   Homepage
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';
import { fetchSupabaseJson } from './supabase.js';
import { renderPostListing, buildReadsMap, dailyStatsQuery } from './utils.js';

async function init() {
    const config = await initPage('');
    const blogEl = document.getElementById('blog-list');

    try {
        const [manifest, statsRows, dailyRows] = await Promise.all([
            fetchCached(config.blog_manifest).catch(() => ({ posts: [] })),
            fetchSupabaseJson('rpc/get_stats').catch(() => []),
            fetchSupabaseJson(`rpc/get_stats${dailyStatsQuery()}`).catch(() => [])
        ]);

        renderPostListing(
            manifest.posts || [],
            blogEl,
            buildReadsMap(statsRows),
            buildReadsMap(dailyRows)
        );
    } catch (err) {
        console.error(err);
        if (blogEl) blogEl.innerHTML = '<li><p>failed to load posts.</p></li>';
    }
}

init();

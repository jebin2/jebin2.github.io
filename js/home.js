/* ============================================
   Homepage
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';
import { fetchSupabaseJson } from './supabase.js';
import { renderPostListing } from './utils.js';

async function init() {
    const config = await initPage('');
    const blogEl = document.getElementById('blog-list');

    try {
        const [manifest, statsRows] = await Promise.all([
            fetchCached(config.blog_manifest).catch(() => ({ posts: [] })),
            fetchSupabaseJson('rpc/get_stats').catch(() => [])
        ]);

        const readsMap = {};
        statsRows
            .filter(r => r.section === 'post_read')
            .forEach(r => { readsMap[r.label] = Number(r.count); });

        renderPostListing(manifest.posts || [], blogEl, readsMap);
    } catch (err) {
        console.error(err);
        if (blogEl) blogEl.innerHTML = '<li><p>failed to load posts.</p></li>';
    }
}

init();

/* ============================================
   Stats Page — reads from Supabase views
   ============================================ */

import { initPage } from './shared.js';
import { fetchSupabaseJson } from './supabase.js';

async function fetchView(view) {
    return fetchSupabaseJson(`${view}?select=*`);
}

async function init() {
    await initPage('');

    showSkeletons();

    try {
        const [pages, projects, posts] = await Promise.all([
            fetchView('stats_page_views'),
            fetchView('stats_project_clicks'),
            fetchView('stats_post_reads')
        ]);

        renderSummary(pages, projects, posts);
        renderRows('stats-pages',    pages,    'page',    'views');
        renderRows('stats-projects', projects, 'project', 'clicks');
        renderRows('stats-posts',    posts,    'post',    'reads');
    } catch (err) {
        console.error(err);
        ['stats-summary', 'stats-pages', 'stats-projects', 'stats-posts'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p class="state-msg">failed to load stats.</p>';
        });
    }
}

/* ---- Summary totals ---- */
function renderSummary(pages, projects, posts) {
    const el = document.getElementById('stats-summary');
    if (!el) return;

    const totalViews    = pages.reduce((s, r) => s + r.views, 0);
    const totalClicks   = projects.reduce((s, r) => s + r.clicks, 0);
    const totalReads    = posts.reduce((s, r) => s + r.reads, 0);

    el.innerHTML = [
        { value: totalViews,  label: 'page views' },
        { value: totalClicks, label: 'project clicks' },
        { value: totalReads,  label: 'post reads' },
    ].map(s => `
        <li>${s.label}: ${s.value.toLocaleString()}</li>
    `).join('');
}

/* ---- Ranked rows with bar ---- */
function renderRows(containerId, rows, labelKey, valueKey) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!rows.length) {
        el.innerHTML = '<li><p>no data yet.</p></li>';
        return;
    }

    el.innerHTML = rows.map((r, i) => {
        return `
            <li>${i + 1}. ${r[labelKey] || '—'}: ${r[valueKey]}</li>
        `;
    }).join('');
}

/* ---- Skeleton while loading ---- */
function showSkeletons() {
    // Left empty for wwj.dev style
}

init();

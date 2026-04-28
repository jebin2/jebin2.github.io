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
        { value: totalViews,  label: 'page views', color: 'var(--crayon-blue)' },
        { value: totalClicks, label: 'project clicks', color: 'var(--crayon-purple)' },
        { value: totalReads,  label: 'post reads', color: 'var(--crayon-orange)' },
    ].map(s => `
        <div class="stat-card organic-shape bg-surface p-6 border-4 shadow-md" style="border-color: ${s.color};">
            <span class="stat-card-value text-3xl font-bold block" style="color: ${s.color};">${s.value.toLocaleString()}</span>
            <span class="stat-card-label font-accent text-xl opacity-80">${s.label}</span>
        </div>
    `).join('');
}

/* ---- Ranked rows with bar ---- */
function renderRows(containerId, rows, labelKey, valueKey) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!rows.length) {
        el.innerHTML = '<p class="state-msg">no data yet.</p>';
        return;
    }

    const max = Math.max(...rows.map(r => r[valueKey]));

    el.innerHTML = rows.map((r, i) => {
        const pct = max > 0 ? (r[valueKey] / max) * 100 : 0;
        const rotate = (Math.random() * 0.4 - 0.2);
        return `
            <div class="project-row sketch-card bg-surface" style="--rotate: ${rotate}deg; padding: 1rem 1.5rem; margin-bottom: 0.75rem;">
                <span class="project-num" style="min-width: 2.5rem;">${String(i + 1).padStart(2, '0')}.</span>
                <div class="flex flex-col flex-grow gap-2">
                    <span class="project-name text-lg">${r[labelKey] || '—'}</span>
                    <div class="h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-crayon-light-blue crayon-filter">
                        <div class="h-full bg-crayon-blue opacity-40" style="width:${pct.toFixed(1)}%"></div>
                    </div>
                </div>
                <span class="font-accent text-2xl text-crayon-blue font-bold ml-4">${r[valueKey]}</span>
            </div>
        `;
    }).join('');
}

/* ---- Skeleton while loading ---- */
function showSkeletons() {
    const widths = [160, 120, 180, 140, 100];

    ['stats-summary'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = [60, 45, 50].map(w =>
            `<div class="stat-card">
                <span class="skeleton" style="width:${w}px;height:2rem;display:block"></span>
                <span class="skeleton" style="width:80px;height:0.68rem;display:block;margin-top:0.4rem"></span>
            </div>`
        ).join('');
    });

    ['stats-pages', 'stats-projects', 'stats-posts'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = widths.map(w => `
            <div class="stat-row">
                <span class="skeleton" style="width:${w}px;height:0.875rem"></span>
                <div class="stat-bar-wrap"><div class="skeleton" style="width:${30 + Math.random() * 60}%;height:2px;display:block"></div></div>
                <span class="skeleton" style="width:24px;height:0.875rem"></span>
            </div>
        `).join('');
    });
}

init();

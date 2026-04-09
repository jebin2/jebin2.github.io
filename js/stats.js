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
        <div class="stat-card">
            <span class="stat-card-value">${s.value.toLocaleString()}</span>
            <span class="stat-card-label">${s.label}</span>
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
        return `
            <div class="stat-row">
                <span class="stat-row-label" title="${r[labelKey]}">
                    <span style="color:var(--tertiary);margin-right:0.5rem">${String(i + 1).padStart(2, '0')}.</span>${r[labelKey] || '—'}
                </span>
                <div class="stat-bar-wrap">
                    <div class="stat-bar" style="width:${pct.toFixed(1)}%"></div>
                </div>
                <span class="stat-row-value">${r[valueKey]}</span>
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

/* ============================================
   Stats Page — reads from Supabase views
   ============================================ */

import { initPage } from './shared.js';
import { fetchSupabaseJson } from './supabase.js';

const RANGES = [
    { label: '7d',  days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: 'all', days: null },
];

const PARAM_KEY = 'range';

function getActiveRange() {
    const param = new URLSearchParams(window.location.search).get(PARAM_KEY);
    return RANGES.find(r => r.label === param) ?? RANGES[RANGES.length - 1];
}

let activeRange = getActiveRange();

function setRange(r) {
    activeRange = r;
    const url = new URL(window.location.href);
    if (r.days === null) {
        url.searchParams.delete(PARAM_KEY);
    } else {
        url.searchParams.set(PARAM_KEY, r.label);
    }
    history.replaceState(null, '', url);
}

async function fetchStats() {
    const since = activeRange.days
        ? new Date(Date.now() - activeRange.days * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const qs = since ? `?since_date=${encodeURIComponent(since)}` : '';
    const rows = await fetchSupabaseJson(`rpc/get_stats${qs}`);

    function extract(section, labelKey, valueKey) {
        return rows
            .filter(r => r.section === section)
            .map(r => ({ [labelKey]: r.label, [valueKey]: Number(r.count) }))
            .sort((a, b) => b[valueKey] - a[valueKey]);
    }

    return {
        pages:    extract('page_view',     'page',    'views'),
        projects: extract('project_click', 'project', 'clicks'),
        posts:    extract('post_read',     'post',    'reads'),
    };
}

function renderFilters() {
    const el = document.getElementById('stats-filter');
    if (!el) return;
    el.innerHTML = RANGES.map(r => {
        const active = r === activeRange ? ' stats-range-active' : '';
        return `<button class="stats-range-btn${active}" data-label="${r.label}">${r.label}</button>`;
    }).join('');
    el.querySelectorAll('.stats-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setRange(RANGES.find(r => r.label === btn.dataset.label) ?? RANGES[RANGES.length - 1]);
            loadStats();
        });
    });
}

async function loadStats() {
    renderFilters();

    try {
        const { pages, projects, posts } = await fetchStats();
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

async function init() {
    await initPage('');
    loadStats();
}

init();

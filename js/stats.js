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

async function fetchView(view) {
    return fetchSupabaseJson(`${view}?select=*`);
}

async function fetchStats() {
    if (!activeRange.days) {
        const [pages, projects, posts] = await Promise.all([
            fetchView('stats_page_views'),
            fetchView('stats_project_clicks'),
            fetchView('stats_post_reads')
        ]);
        return { pages, projects, posts };
    }

    const since = new Date();
    since.setDate(since.getDate() - activeRange.days);
    const isoDate = since.toISOString();

    const rows = await fetchSupabaseJson(
        `events?select=event_type,label&created_at=gte.${isoDate}&limit=2000`
    );

    function agg(type, labelKey, valueKey) {
        const counts = {};
        for (const row of rows) {
            if (row.event_type === type && row.label) {
                counts[row.label] = (counts[row.label] || 0) + 1;
            }
        }
        return Object.entries(counts)
            .map(([name, count]) => ({ [labelKey]: name, [valueKey]: count }))
            .sort((a, b) => b[valueKey] - a[valueKey]);
    }

    return {
        pages:    agg('page_view',     'page',    'views'),
        projects: agg('project_click', 'project', 'clicks'),
        posts:    agg('post_read',     'post',    'reads'),
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

/* ============================================
   Projects Page
   ============================================ */

import { initPage, renderSkeletonRows } from './shared.js';
import { fetchCached } from './cache.js';

const GROUPS = [
    { key: 'ai', label: '— ai —' },
    { key: 'tool', label: '— tools —' },
    { key: 'dev', label: '— dev —' },
    { key: 'util', label: '— utilities —' },
];

let allProjects = [];

async function init() {
    const config = await initPage('projects');
    const listEl = document.getElementById('project-list');

    if (listEl) listEl.innerHTML = renderSkeletonRows(8);

    try {
        allProjects = await fetchCached(config.projects);
        render('all');
        initFilter();
    } catch (err) {
        console.error(err);
        if (listEl) listEl.innerHTML = '<p class="state-msg">failed to load projects.</p>';
    }
}

/* ---- Render list for a given filter ---- */
function render(activeFilter) {
    const listEl = document.getElementById('project-list');
    if (!listEl) return;

    const filtered = activeFilter === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === activeFilter);

    if (!filtered.length) {
        listEl.innerHTML = '<p class="state-msg">no projects in this category.</p>';
        return;
    }

    if (activeFilter === 'all') {
        // Grouped view
        listEl.innerHTML = GROUPS.map(group => {
            const items = allProjects.filter(p => p.category === group.key);
            if (!items.length) return '';
            return `
                <div class="project-group" data-group="${group.key}">
                    <div class="group-label">${group.label}</div>
                    <div class="project-group-items">
                        ${items.map(projectRow).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Flat filtered view — no group labels
        listEl.innerHTML = `
            <div class="project-group-items">
                ${filtered.map(projectRow).join('')}
            </div>
        `;
    }
}

/* ---- Build a single project row ---- */
function projectRow(p) {
    return `
        <a class="project-row"
           href="${p.url}"
           target="_blank"
           rel="noopener noreferrer"
           title="${p.description}">
            <span class="project-name">${p.title}</span>
            <span class="project-desc">${p.description}</span>
            <span class="project-tag">[ ${p.category} ]</span>
        </a>
    `;
}

/* ---- Filter buttons ---- */
function initFilter() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render(btn.dataset.filter);
        });
    });
}

init();

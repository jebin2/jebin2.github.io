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
let activeFilter = 'all';
let searchQuery = '';

async function init() {
    const config = await initPage('projects');
    const listEl = document.getElementById('project-list');
    const searchEl = document.getElementById('project-search');

    if (listEl) listEl.innerHTML = renderSkeletonRows(8);

    try {
        allProjects = await fetchCached(config.projects);
        render();
        initFilter();

        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                render();
            });

        }
    } catch (err) {
        console.error(err);
        if (listEl) listEl.innerHTML = '<p class="state-msg">failed to load projects.</p>';
    }
}

/* ---- Render list based on current filters ---- */
function render() {
    const listEl = document.getElementById('project-list');
    if (!listEl) return;

    let filtered = allProjects;

    // Apply category filter
    if (activeFilter !== 'all') {
        filtered = filtered.filter(p => p.category === activeFilter);
    }

    // Apply search query
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchQuery) || 
            p.description.toLowerCase().includes(searchQuery)
        );
    }

    if (!filtered.length) {
        listEl.innerHTML = '<p class="state-msg">no projects found matching your criteria.</p>';
        return;
    }

    if (activeFilter === 'all' && !searchQuery) {
        // Grouped view
        listEl.innerHTML = GROUPS.map(group => {
            const items = filtered.filter(p => p.category === group.key);
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
        // Flat filtered view
        listEl.innerHTML = `
            <div class="project-group-items">
                ${filtered.map(projectRow).join('')}
            </div>
        `;
    }
}

/* ---- Build a single project row ---- */
function projectRow(p, i) {
    const rotate = (Math.random() * 0.8 - 0.4);
    return `
        <a class="project-row sketch-card bg-surface"
           href="${p.url}"
           target="_blank"
           rel="noopener noreferrer"
           title="${p.description}"
           style="--rotate: ${rotate}deg">
            <div class="flex flex-col flex-grow">
                <span class="project-name">${p.title}</span>
                <span class="project-desc">${p.description}</span>
            </div>
            <span class="project-tag">${p.category}</span>
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
            activeFilter = btn.dataset.filter;
            render();
        });
    });
}

init();

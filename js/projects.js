/* ============================================
   Projects Page
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';

let allProjects = [];

async function init() {
    const config = await initPage('projects');
    const listEl = document.getElementById('project-list');

    try {
        allProjects = await fetchCached(config.projects);
        render();
    } catch (err) {
        console.error(err);
        if (listEl) listEl.innerHTML = '<li><p>failed to load projects.</p></li>';
    }
}

/* ---- Render list ---- */
function render() {
    const listEl = document.getElementById('project-list');
    if (!listEl) return;

    if (!allProjects.length) {
        listEl.innerHTML = '<li><p>no projects found.</p></li>';
        return;
    }

    listEl.innerHTML = allProjects.map(projectRow).join('');
}

/* ---- Build a single project row ---- */
function projectRow(p) {
    const articleId = p.title.toLowerCase().replace(/\\W+/g, '-');
    return `
        <li>
            <article id="${articleId}">
                <a href="${p.url}" target="_blank" rel="noopener noreferrer"><h2>${p.title}</h2></a>
                <p>${p.description}</p>
                <footer>
                    <a href="${p.url}" target="_blank" rel="noopener noreferrer">View ${p.title}</a>
                </footer>
            </article>
        </li>
    `;
}

init();

/* ============================================
   Projects Page
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';
import { escapeHTML, escapeURL } from './utils.js';

async function init() {
    const config = await initPage('projects');
    const listEl = document.getElementById('project-list');

    try {
        render(await fetchCached(config.projects), listEl);
    } catch (err) {
        console.error(err);
        if (listEl) listEl.innerHTML = '<li><p>failed to load projects.</p></li>';
    }
}

/* ---- Render list ---- */
function render(projects, listEl) {
    if (!listEl) return;

    if (!projects.length) {
        listEl.innerHTML = '<li><p>no projects found.</p></li>';
        return;
    }

    listEl.innerHTML = projects.map(projectRow).join('');
}

/* ---- Build a single project row ---- */
function projectRow(p) {
    const articleId = escapeHTML(p.title.toLowerCase().replace(/\W+/g, '-'));
    const title = escapeHTML(p.title);
    const url = escapeURL(p.url);
    return `
        <li>
            <article id="${articleId}">
                <a href="${url}" target="_blank" rel="noopener noreferrer"><h2>${title}</h2></a>
                <p>${escapeHTML(p.description)}</p>
                <footer>
                    <a href="${url}" target="_blank" rel="noopener noreferrer">View ${title}</a>
                </footer>
            </article>
        </li>
    `;
}

init();

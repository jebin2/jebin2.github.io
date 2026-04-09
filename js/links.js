/* ============================================
   Links Page
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';

async function init() {
    const config  = await initPage('links');
    const listEl  = document.getElementById('links-list');

    if (listEl) listEl.innerHTML = renderSkeleton();

    try {
        const links = await fetchCached(config.links);
        render(links, listEl);
    } catch (err) {
        console.error(err);
        if (listEl) listEl.innerHTML = '<p class="state-msg">failed to load links.</p>';
    }
}

function render(links, container) {
    if (!container) return;

    if (!links.length) {
        container.innerHTML = '<p class="state-msg">nothing here yet.</p>';
        return;
    }

    container.innerHTML = links.map((link, i) => {
        const sep = i < links.length - 1
            ? '<span class="tag-sep" aria-hidden="true">·</span>'
            : '';
        return `<a class="tag-link"
                   href="${link.url}"
                   target="_blank"
                   rel="noopener noreferrer"
                   title="${link.title}"
                >${link.emoji} ${link.title}</a>${sep}`;
    }).join('');
}

function renderSkeleton() {
    const widths = [90, 70, 110, 80, 100, 75, 95, 85, 120, 65, 105, 88];
    return widths.map((w, i) => {
        const sep = i < widths.length - 1
            ? '<span class="tag-sep" aria-hidden="true">·</span>'
            : '';
        return `<span class="skeleton" style="width:${w}px; height:0.875rem; vertical-align:middle;"></span>${sep}`;
    }).join('');
}

init();

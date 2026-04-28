/* ============================================
   Links Page
   ============================================ */

import { initPage } from './shared.js';
import { fetchCached } from './cache.js';

async function init() {
    const config  = await initPage('links');
    const listEl  = document.getElementById('links-list');
    const searchEl = document.getElementById('links-search');

    if (listEl) listEl.innerHTML = renderSkeleton();

    try {
        const links = await fetchCached(config.links);
        
        // Initial render
        render(links, listEl);

        // Search listener
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filtered = links.filter(l => 
                    l.title.toLowerCase().includes(query) || 
                    l.url.toLowerCase().includes(query)
                );
                render(filtered, listEl);
            });
        }
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

    container.innerHTML = `
        <div class="flex flex-wrap gap-4 mt-8">
            ${links.map((link, i) => {
                const rotate = (Math.random() * 2 - 1).toFixed(1);
                const colors = ['var(--crayon-blue)', 'var(--crayon-green)', 'var(--crayon-red)', 'var(--crayon-purple)', 'var(--crayon-orange)'];
                const color = colors[i % colors.length];
                return `
                    <a class="crayon-button organic-shape px-4 py-2 bg-surface text-lg font-bold link-tag"
                       href="${link.url}"
                       target="_blank"
                       rel="noopener noreferrer"
                       style="--rotate: ${rotate}deg; border-color: ${color}; color: ${color};"
                    >
                        <span class="project-name">${link.emoji} ${link.title}</span>
                    </a>
                `;
            }).join('')}
        </div>
    `;
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

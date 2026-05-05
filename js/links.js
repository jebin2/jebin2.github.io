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
        container.innerHTML = '<li><p>nothing here yet.</p></li>';
        return;
    }

    container.innerHTML = links.map((link) => {
        return `
            <li>
                <a class="link-box" href="${link.url}" target="_blank" rel="noopener noreferrer">
                    <span class="emoji">${link.emoji}</span>
                    <span class="title">${link.title}</span>
                </a>
            </li>
        `;
    }).join('');
}

function renderSkeleton() {
    return '';
}

init();

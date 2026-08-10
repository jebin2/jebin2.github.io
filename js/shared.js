/* ============================================
   Shared — header, footer, nav, skeletons
   ============================================ */

import { fetchCached } from './cache.js';
import { trackPageView } from './analytics.js';

let _config = null;

export async function loadConfig() {
    if (_config) return _config;
    _config = await fetchCached('/config.json');
    return _config;
}

/* ---- Header ---- */
export function renderHeader(activePage = '', config = {}) {
    const sponsorUrl = config.sponsor || 'https://github.com/sponsors/jebin2';
    return `
        <nav>
            <a href="/">jebin2</a>
            <ul>
                <li><a ${activePage === '' || activePage === 'blog' ? 'aria-current="page"' : ''} href="/">Blog</a></li>
                <li><a ${activePage === 'projects' ? 'aria-current="page"' : ''} href="/projects">Projects</a></li>
                <li><a ${activePage === 'links' ? 'aria-current="page"' : ''} href="/linksilike.html">Links</a></li>
                <li><a href="${sponsorUrl}" target="_blank" rel="noopener noreferrer">Sponsor</a></li>
            </ul>
        </nav>
    `;
}

/* ---- Footer ---- */
export function renderFooter() {
    return `
        <p style="text-align: center; font-size: 0.875rem; color: var(--fg-muted); margin: 0;">
            theme from <a href="https://wwj.dev" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">wwj.dev</a>
        </p>
    `;
}

/* ---- Inject header + footer ---- */
export async function initPage(activePage = '', options = {}) {
    const config = await loadConfig();
    const { skipTrackPageView = false } = options;

    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');

    if (headerEl) headerEl.innerHTML = renderHeader(activePage, config);
    if (footerEl) footerEl.innerHTML = renderFooter();

    if (!skipTrackPageView) trackPageView();
    return config;
}

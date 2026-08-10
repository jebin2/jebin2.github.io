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

/* ---- Per-view metadata ----
   Only helps crawlers that execute JS (Googlebot does). Social unfurlers
   read the raw HTML, so they still see writing/index.html's defaults —
   fixing that properly needs prerendered pages per post. */
const SITE_URL = 'https://www.voidall.com';

function setAttr(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
}

export function setPageMeta({ title, description, path, type = 'website' }) {
    if (title) {
        document.title = title;
        setAttr('meta[property="og:title"]', 'content', title);
        setAttr('meta[name="twitter:title"]', 'content', title);
    }

    if (description) {
        setAttr('meta[name="description"]', 'content', description);
        setAttr('meta[property="og:description"]', 'content', description);
        setAttr('meta[name="twitter:description"]', 'content', description);
    }

    if (path) {
        const url = SITE_URL + path;
        setAttr('link[rel="canonical"]', 'href', url);
        setAttr('meta[property="og:url"]', 'content', url);
    }

    setAttr('meta[property="og:type"]', 'content', type);
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

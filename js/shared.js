/* ============================================
   Shared — header, footer, nav, skeletons
   ============================================ */

import { fetchCached } from './cache.js';

let _config = null;

export async function loadConfig() {
    if (_config) return _config;
    _config = await fetchCached('/config.json');
    return _config;
}

/* ---- Header ---- */
export function renderHeader(activePage = '') {
    const links = [
        { key: 'projects',   href: '/projects',   label: 'projects' },
        { key: 'links',      href: '/linksilike',  label: 'links' },
        { key: 'blog',       href: '/writing',     label: 'writing' },
        { key: 'sponsor',    href: 'https://github.com/sponsors/jebin2', label: 'sponsor ↗' },
    ];

    const navItems = links.map(l =>
        `<li><a href="${l.href}"${l.key === activePage ? ' class="active"' : ''}>${l.label}</a></li>`
    ).join('');

    return `
        <header class="site-header">
            <nav class="nav-inner">
                <a href="/" class="nav-logo">jebin2</a>
                <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">menu</button>
                <ul class="nav-links" id="navLinks">${navItems}</ul>
            </nav>
        </header>
    `;
}

/* ---- Footer ---- */
export function renderFooter(config) {
    const gh      = config?.github  || 'https://github.com/jebin2';
    const sponsor = config?.sponsor || 'https://github.com/sponsors/jebin2';
    return `
        <footer class="site-footer">
            <div class="footer-inner">
                <span class="footer-name">jebin2</span>
                <a href="${gh}" target="_blank" rel="noopener noreferrer">github ↗</a>
                <a href="${sponsor}" target="_blank" rel="noopener noreferrer">sponsor ↗</a>
            </div>
        </footer>
    `;
}

/* ---- Mobile nav toggle ---- */
export function initNav() {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.textContent = open ? 'close' : 'menu';
        toggle.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
            links.classList.remove('open');
            toggle.textContent = 'menu';
        }
    });
}

/* ---- Skeleton rows ---- */
export function renderSkeletonRows(count = 5) {
    const widths = [140, 180, 120, 160, 130];
    return Array.from({ length: count }, (_, i) => `
        <div class="skeleton-row">
            <span class="skeleton" style="width:${widths[i % widths.length]}px"></span>
            <span class="skeleton" style="width:${220 + (i % 3) * 30}px; flex-grow:1"></span>
            <span class="skeleton" style="width:38px"></span>
        </div>
    `).join('');
}

/* ---- Inject header + footer and init nav ---- */
export async function initPage(activePage = '') {
    const config = await loadConfig();

    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');

    if (headerEl) headerEl.innerHTML = renderHeader(activePage);
    if (footerEl) footerEl.innerHTML = renderFooter(config);

    initNav();
    return config;
}

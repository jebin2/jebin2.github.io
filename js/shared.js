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
            <div class="container relative">
                <nav class="nav-inner organic-shape shadow-lg bg-surface">
                    <a href="/" class="nav-logo crayon-filter">jebin2</a>
                    <button class="nav-toggle mobile-menu-btn flex items-center justify-center" id="navToggle" aria-label="Toggle navigation">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <ul class="nav-links" id="navLinks">${navItems}</ul>
                </nav>
                
                <!-- Header Sketches -->
                <div class="absolute -left-12 -top-4 rotate-12 opacity-80 pointer-events-none hidden md:block">
                    <span class="material-symbols-outlined text-4xl text-crayon-yellow crayon-heavy animate-pulse">star</span>
                </div>
                <div class="absolute -right-8 -bottom-4 -rotate-12 opacity-60 pointer-events-none hidden md:block">
                    <span class="material-symbols-outlined text-5xl text-crayon-blue crayon-heavy">cloud</span>
                </div>
            </div>
        </header>
    `;
}

/* ---- Footer ---- */
export function renderFooter(config) {
    const gh      = config?.github  || 'https://github.com/jebin2';
    const sponsor = config?.sponsor || 'https://github.com/sponsors/jebin2';
    return `
        <footer class="site-footer">
            <div class="container relative">
                <div class="footer-inner organic-shape shadow-lg bg-surface">
                    <span class="footer-name">jebin2</span>
                    <div class="flex gap-8 items-center ml-auto">
                        <a href="${gh}" target="_blank" rel="noopener noreferrer" class="hover:text-crayon-green transition-colors">github ↗</a>
                        <a href="${sponsor}" target="_blank" rel="noopener noreferrer" class="hover:text-crayon-green transition-colors">sponsor ↗</a>
                    </div>
                </div>
                
                <!-- Footer Sketches -->
                <div class="absolute -right-12 -top-6 rotate-12 opacity-70 pointer-events-none hidden md:block">
                    <span class="material-symbols-outlined text-4xl text-crayon-red crayon-heavy">favorite</span>
                </div>
            </div>
        </footer>
    `;
}

/* ---- Mobile nav toggle ---- */
export function initNav() {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from firing immediately
        const open = links.classList.toggle('open');
        toggle.innerHTML = open 
            ? '<span class="material-symbols-outlined">close</span>' 
            : '<span class="material-symbols-outlined">menu</span>';
        toggle.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
            links.classList.remove('open');
            toggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
        }
    });
}

/* ---- Skeleton rows ---- */
export function renderSkeletonRows(count = 3) {
    return Array(count).fill(0).map(() => `
        <div class="skeleton-row sketch-card bg-surface opacity-50">
            <div class="skeleton w-8 h-8 rounded-full"></div>
            <div class="flex-grow">
                <div class="skeleton w-1/3 h-4 mb-2"></div>
                <div class="skeleton w-2/3 h-3"></div>
            </div>
            <div class="skeleton w-16 h-6"></div>
        </div>
    `).join('');
}

/* ---- Inject header + footer and init nav ---- */
export async function initPage(activePage = '', options = {}) {
    const config = await loadConfig();
    const { skipTrackPageView = false } = options;

    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');

    if (headerEl) headerEl.innerHTML = renderHeader(activePage);
    if (footerEl) footerEl.innerHTML = renderFooter(config);

    initNav();
    initParallaxDoodles();
    if (!skipTrackPageView) trackPageView();
    return config;
}
/**
 * Injects floating doodles that move slightly on scroll
 */
function initParallaxDoodles() {
    const symbols = ['star', 'favorite', 'cloud', 'lightbulb', 'brush', 'bolt', 'rocket', 'auto_awesome'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:-5;';
    
    for (let i = 0; i < 8; i++) {
        const span = document.createElement('span');
        span.className = 'material-symbols-outlined parallax-doodle';
        span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const speed = 0.05 + Math.random() * 0.1;
        const size = 24 + Math.random() * 48;
        
        span.style.cssText = `
            top: ${top}%;
            left: ${left}%;
            font-size: ${size}px;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            span.style.transform = `translateY(${y * speed}px) rotate(${Math.random() * 5}deg)`;
        });
        
        container.appendChild(span);
    }
    document.body.appendChild(container);
}

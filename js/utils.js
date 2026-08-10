/* ============================================
   Utils
   ============================================ */

export function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

export function sanitizeHTML(str) {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
}

export function sanitizeRenderedHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    const allowedTags = new Set([
        'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'HR', 'IMG', 'LI', 'OL', 'P', 'PRE', 'SPAN', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH',
        'THEAD', 'TR', 'UL'
    ]);
    const allowedAttrs = {
        A: new Set(['href', 'title', 'target', 'rel']),
        IMG: new Set(['src', 'alt', 'title']),
        CODE: new Set(['class']),
        SPAN: new Set(['class']),
        TH: new Set(['colspan', 'rowspan']),
        TD: new Set(['colspan', 'rowspan'])
    };

    const nodes = [...template.content.querySelectorAll('*')];
    nodes.forEach(node => {
        if (!allowedTags.has(node.tagName)) {
            node.replaceWith(...node.childNodes);
            return;
        }

        [...node.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            const value = attr.value.trim();
            const tagAllowedAttrs = allowedAttrs[node.tagName] || new Set();

            if (name.startsWith('on') || !tagAllowedAttrs.has(attr.name)) {
                node.removeAttribute(attr.name);
                return;
            }

            if ((name === 'href' || name === 'src') && !isSafeUrl(value)) {
                node.removeAttribute(attr.name);
            }
        });

        if (node.tagName === 'A' && node.hasAttribute('href')) {
            node.setAttribute('rel', 'noopener noreferrer');
            if (/^https?:\/\//i.test(node.getAttribute('href'))) {
                node.setAttribute('target', '_blank');
            }
        }
    });

    return template.innerHTML;
}

function isSafeUrl(value) {
    return /^(https?:\/\/|\/|#|\.\.?\/)/i.test(value);
}

export function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// "2026-05-31 22:38:32 +0530" → "2026-05-31T22:38:32+05:30" (ISO 8601)
export function parsePostDate(str) {
    if (!str) return new Date(0);
    const d = new Date(
        str.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/, '$1T$2$3:$4')
    );
    return isNaN(d.getTime()) ? new Date(0) : d;
}

// Query string for get_stats scoped to the last 24 hours
export function dailyStatsQuery() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return `?since_date=${encodeURIComponent(since)}`;
}

export function buildReadsMap(statsRows) {
    const map = {};
    statsRows
        .filter(r => r.section === 'post_read')
        .forEach(r => { map[r.label] = Number(r.count); });
    return map;
}

export function renderPostListing(posts, container, readsMap = {}, dailyReadsMap = {}) {
    if (!container) return;

    if (!posts.length) {
        container.innerHTML = '<li><p>no posts yet.</p></li>';
        return;
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo  = now -  7 * 24 * 60 * 60 * 1000;

    const recent = posts.filter(p => parsePostDate(p.created_date).getTime() >= thirtyDaysAgo);
    const older  = posts.filter(p => parsePostDate(p.created_date).getTime() <  thirtyDaysAgo);

    recent.sort((a, b) => parsePostDate(b.created_date).getTime() - parsePostDate(a.created_date).getTime());
    older.sort((a, b) => (readsMap[b.title] || 0) - (readsMap[a.title] || 0));

    function postItem(p) {
        const slug = encodeURIComponent(p.path);
        const articleId = p.title.toLowerCase().replace(/\W+/g, '-');
        const dt = parsePostDate(p.created_date);
        const isNew = dt.getTime() >= sevenDaysAgo;

        let datetimeStr = '';
        let formattedDate = p.created_date;
        if (dt.getTime() !== 0) {
            datetimeStr = dt.toISOString();
            formattedDate = dt.toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            });
        }

        const newLabel = isNew ? `<span class="post-new-label">new</span>` : '';

        const daily = dailyReadsMap[p.title] || 0;
        const dailyLabel = daily
            ? ` <span class="post-daily-reads" title="${daily} reads in the last 24h">${daily}</span>`
            : '';

        return `
            <li>
                <article id="${articleId}">
                    <a href="/writing?post=${slug}"><h2>${p.title}${dailyLabel}</h2></a>
                    ${newLabel}
                    <time datetime="${datetimeStr}">${formattedDate}</time>
                    <p>${p.description || ''}</p>
                    <footer>
                        <a href="/writing?post=${slug}">Read more about ${p.title}</a>
                    </footer>
                </article>
            </li>
        `;
    }

    const divider = recent.length && older.length
        ? `<li class="posts-section-divider" aria-hidden="true"></li>`
        : '';

    container.innerHTML =
        recent.map(postItem).join('') +
        divider +
        older.map(postItem).join('');
}

export function isAdmin() {
    return localStorage.getItem('blog_admin') === 'true' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
}

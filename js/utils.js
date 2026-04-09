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

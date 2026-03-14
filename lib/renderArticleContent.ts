/**
 * Lightweight Markdown-to-HTML renderer for blog article content.
 *
 * Supported syntax (matching the admin editor toolbar):
 *   ## H2, ### H3, #### H4
 *   **bold**, *italic*
 *   [text](url), ![alt](url)
 *   - unordered list, 1. ordered list
 *   > blockquote
 *   --- horizontal rule
 *   ```code blocks```
 *   inline `code`
 *
 * The function returns sanitised HTML wrapped in semantic tags.
 * It is designed to work with the `.article-content` CSS class
 * defined in styles.css.
 */

// ── helpers ────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Process inline markdown: bold, italic, code, links, images */
function inlineMarkdown(text: string): string {
    let out = text;

    // Images: ![alt](url)
    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
        return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ''}</figure>`;
    });

    // Links: [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
        const isExternal = /^https?:\/\//.test(href) && !href.includes('dermatocheck.com');
        const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(href)}"${attrs}>${text}</a>`;
    });

    // Inline code: `code`
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold + Italic: ***text***
    out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

    // Bold: **text**
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    out = out.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    return out;
}

// ── block parser ───────────────────────────────────────────────────

interface Block {
    type: 'p' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'ul' | 'ol' | 'hr' | 'code' | 'figure';
    content: string;
    lang?: string;
}

function parseBlocks(raw: string): Block[] {
    const lines = raw.split('\n');
    const blocks: Block[] = [];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        // Empty line — skip
        if (line.trim() === '') {
            i++;
            continue;
        }

        // Fenced code block
        if (line.trim().startsWith('```')) {
            const lang = line.trim().slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing ```
            blocks.push({ type: 'code', content: codeLines.join('\n'), lang });
            continue;
        }

        // Horizontal rule
        if (/^---+\s*$/.test(line.trim())) {
            blocks.push({ type: 'hr', content: '' });
            i++;
            continue;
        }

        // Headings
        if (line.trim().startsWith('#### ')) {
            blocks.push({ type: 'h4', content: line.trim().slice(5) });
            i++;
            continue;
        }
        if (line.trim().startsWith('### ')) {
            blocks.push({ type: 'h3', content: line.trim().slice(4) });
            i++;
            continue;
        }
        if (line.trim().startsWith('## ')) {
            blocks.push({ type: 'h2', content: line.trim().slice(3) });
            i++;
            continue;
        }

        // Blockquote (consecutive > lines)
        if (line.trim().startsWith('> ')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('> ')) {
                quoteLines.push(lines[i].trim().slice(2));
                i++;
            }
            blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
            continue;
        }

        // Unordered list (- item)
        if (/^\s*[-*]\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
                i++;
            }
            blocks.push({ type: 'ul', content: items.join('\n') });
            continue;
        }

        // Ordered list (1. item)
        if (/^\s*\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
                i++;
            }
            blocks.push({ type: 'ol', content: items.join('\n') });
            continue;
        }

        // Standalone image line
        if (/^!\[.*\]\(.*\)\s*$/.test(line.trim())) {
            blocks.push({ type: 'figure', content: line.trim() });
            i++;
            continue;
        }

        // Default: paragraph — collect consecutive non-empty lines that don't match other patterns
        const paraLines: string[] = [line];
        i++;
        while (
            i < lines.length &&
            lines[i].trim() !== '' &&
            !lines[i].trim().startsWith('## ') &&
            !lines[i].trim().startsWith('### ') &&
            !lines[i].trim().startsWith('#### ') &&
            !lines[i].trim().startsWith('> ') &&
            !lines[i].trim().startsWith('```') &&
            !/^---+\s*$/.test(lines[i].trim()) &&
            !/^\s*[-*]\s/.test(lines[i]) &&
            !/^\s*\d+\.\s/.test(lines[i]) &&
            !/^!\[.*\]\(.*\)\s*$/.test(lines[i].trim())
        ) {
            paraLines.push(lines[i]);
            i++;
        }
        blocks.push({ type: 'p', content: paraLines.join(' ') });
    }

    return blocks;
}

// ── render ─────────────────────────────────────────────────────────

function renderBlock(block: Block): string {
    switch (block.type) {
        case 'h2':
            return `<h2>${inlineMarkdown(block.content)}</h2>`;
        case 'h3':
            return `<h3>${inlineMarkdown(block.content)}</h3>`;
        case 'h4':
            return `<h4>${inlineMarkdown(block.content)}</h4>`;
        case 'p':
            return `<p>${inlineMarkdown(block.content)}</p>`;
        case 'blockquote':
            return `<blockquote><p>${inlineMarkdown(block.content)}</p></blockquote>`;
        case 'hr':
            return '<hr />';
        case 'ul':
            return `<ul>${block.content.split('\n').map(li => `<li>${inlineMarkdown(li)}</li>`).join('')}</ul>`;
        case 'ol':
            return `<ol>${block.content.split('\n').map(li => `<li>${inlineMarkdown(li)}</li>`).join('')}</ol>`;
        case 'code':
            return `<pre><code${block.lang ? ` class="language-${escapeHtml(block.lang)}"` : ''}>${escapeHtml(block.content)}</code></pre>`;
        case 'figure':
            return inlineMarkdown(block.content);
        default:
            return `<p>${inlineMarkdown(block.content)}</p>`;
    }
}

/**
 * Converts markdown content to semantic HTML for the article content zone.
 */
export function renderArticleContent(markdown: string): string {
    if (!markdown) return '';
    const blocks = parseBlocks(markdown.trim());
    return blocks.map(renderBlock).join('\n');
}

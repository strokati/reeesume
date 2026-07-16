import DOMPurify from 'isomorphic-dompurify';

/**
 * Cover-letter / Tiptap HTML allow-list. Anything outside this set is stripped
 * before the HTML reaches headless Chromium (which runs --no-sandbox inside
 * Docker) and before it is rendered via dangerouslySetInnerHTML in the
 * /export-preview route.
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'span',
  'div',
  'blockquote',
  'hr',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export function sanitizeCoverLetterHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

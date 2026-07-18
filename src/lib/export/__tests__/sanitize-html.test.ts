import { describe, it, expect } from 'vitest';
import { sanitizeCoverLetterHtml } from '../sanitize-html';

describe('sanitizeCoverLetterHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeCoverLetterHtml('')).toBe('');
  });

  it('strips <script> tags', () => {
    const out = sanitizeCoverLetterHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).toContain('<p>hi</p>');
    expect(out.toLowerCase()).not.toContain('<script');
    expect(out).not.toContain('alert');
  });

  it('strips inline event handlers', () => {
    const out = sanitizeCoverLetterHtml('<p onclick="evil()">hi</p>');
    expect(out).not.toContain('onclick');
    expect(out).toContain('hi');
  });

  it('strips <iframe>', () => {
    const out = sanitizeCoverLetterHtml('<iframe src="https://evil"></iframe><p>ok</p>');
    expect(out.toLowerCase()).not.toContain('<iframe');
    expect(out).toContain('ok');
  });

  it('strips <style> and <link>', () => {
    const out = sanitizeCoverLetterHtml(
      '<style>body{background:red}</style><link rel="stylesheet" href="x" /><p>ok</p>'
    );
    expect(out.toLowerCase()).not.toContain('<style');
    expect(out.toLowerCase()).not.toContain('<link');
  });

  it('strips data: URLs in href', () => {
    const out = sanitizeCoverLetterHtml('<a href="data:text/html,evil">x</a>');
    expect(out.toLowerCase()).not.toContain('data:');
  });

  it('strips javascript: URLs in href', () => {
    const out = sanitizeCoverLetterHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('preserves allowed formatting tags', () => {
    const out = sanitizeCoverLetterHtml('<strong>bold</strong><em>italic</em>');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>italic</em>');
  });

  it('preserves safe links with rel/target attributes', () => {
    const out = sanitizeCoverLetterHtml(
      '<a href="https://example.com" target="_blank" rel="noopener">link</a>'
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener"');
  });
});

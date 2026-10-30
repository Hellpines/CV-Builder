import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPdfHtml, slugify } from './pdf';

describe('slugify', () => {
  it('slugifies text and strips edge dashes', () => {
    expect(slugify('  Hello, CV Builder!  ')).toBe('hello-cv-builder');
  });

  it('uses fallback for empty values', () => {
    expect(slugify('')).toBe('cv');
    expect(slugify(undefined)).toBe('cv');
    expect(slugify('@@@', 'resume')).toBe('resume');
  });
});

describe('buildPdfHtml', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('embeds element html and collected page styles', () => {
    const style = document.createElement('style');
    style.textContent = '.preview { color: red; }';
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.setAttribute('data-pdf-root', '');
    root.textContent = 'CV';
    document.body.appendChild(root);

    const html = buildPdfHtml(root);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('data-pdf-root');
    expect(html).toContain('CV');
    expect(html).toContain('.preview { color: red; }');
    expect(html).toContain('max-width: none !important');
  });

  it('skips stylesheets that throw on cssRules access', () => {
    const safeSheet = {
      cssRules: [{ cssText: '.ok {}' }],
    } as unknown as CSSStyleSheet;
    const blockedSheet = {
      get cssRules(): CSSRuleList {
        throw new Error('cross-origin');
      },
    } as unknown as CSSStyleSheet;

    vi.spyOn(document, 'styleSheets', 'get').mockReturnValue([
      safeSheet,
      blockedSheet,
    ] as unknown as StyleSheetList);

    const root = document.createElement('section');
    root.textContent = 'Body';

    const html = buildPdfHtml(root);

    expect(html).toContain('.ok {}');
    expect(html).toContain('Body');
  });
});

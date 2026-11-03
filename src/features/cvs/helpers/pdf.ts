export function slugify(value: string | undefined, fallback = 'cv'): string {
  const slug = (value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function collectPageStyles(): string {
  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      chunks.push(
        Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      );
    } catch {}
  }

  return chunks.join('\n');
}

export function buildPdfHtml(element: HTMLElement): string {
  const overrides = `
    html, body { margin: 0; background: #fff; font-family: Roboto, Arial, sans-serif; }
    [data-pdf-root] { max-width: none !important; background: #fff !important; padding: 0 !important; margin: 0 !important; }
  `;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${collectPageStyles()}</style><style>${overrides}</style></head><body>${element.outerHTML}</body></html>`;
}

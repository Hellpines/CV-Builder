export function getPageItems(current: number, total: number): (number | string)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items: (number | string)[] = [];
  sorted.forEach((page, index) => {
    const prev = sorted[index - 1];
    if (prev !== undefined) {
      if (page - prev === 2) items.push(prev + 1);
      else if (page - prev > 2) items.push(`ellipsis-${page}`);
    }
    items.push(page);
  });

  return items;
}

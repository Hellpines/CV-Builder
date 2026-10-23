export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    const ms = trimmed.length <= 10 ? Number(trimmed) * 1000 : Number(trimmed);
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : startOfDay(date);
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toISODate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}

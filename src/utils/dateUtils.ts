function isValidDate(x: unknown): x is Date {
  return x instanceof Date && !isNaN(x.getTime());
}

function toDate(input: Date | string | number | null | undefined): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return isValidDate(input) ? input : null;
  const d = new Date(input);
  return isValidDate(d) ? d : null;
}

export function mergeTime(base: Date, time: Date) {
  const d = new Date(base);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d;
}

export function toValidDate(input: unknown): Date | null {
  if (input instanceof Date) return input;
  if (typeof input === 'string' || typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatTime(
  input: Date | string | number | null | undefined,
  is24Hour?: boolean,
) {
  const d = toDate(input);
  if (!d) return 'Select time';

  const hour12 = is24Hour === undefined ? undefined : !is24Hour;

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12,
    }).format(d);
  } catch {
    // Fallback manual formatter (works even if Intl hiccups)
    const hh = d.getHours();
    const mm = d.getMinutes();
    if (hour12 === false) {
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
    const h12 = hh % 12 || 12;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return `${String(h12).padStart(2, '0')}:${String(mm).padStart(
      2,
      '0',
    )} ${ampm}`;
  }
}

export const thirtyMinsBefore = (d: Date) =>
  new Date(d.getTime() - 30 * 60_000);

export function isPast(
  when: Date,
  opts: { inclusive?: boolean; toleranceMs?: number } = {},
): boolean {
  if (!(when instanceof Date) || Number.isNaN(when.getTime())) {
    throw new Error('Invalid Date');
  }
  const { inclusive = true, toleranceMs = 0 } = opts;
  const now = Date.now() - Math.max(0, toleranceMs);
  const t = when.getTime();
  return inclusive ? t <= now : t < now;
}

export const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);

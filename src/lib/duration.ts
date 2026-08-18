export type DurationTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function formatDuration(t: DurationTranslator, minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(t(hours === 1 ? 'hour' : 'hours', { value: hours }));
  if (mins > 0) parts.push(t(mins === 1 ? 'minute' : 'minutes', { value: mins }));
  if (parts.length === 0) parts.push(t('minutes', { value: 0 }));
  return parts.join(` ${t('and')} `);
}
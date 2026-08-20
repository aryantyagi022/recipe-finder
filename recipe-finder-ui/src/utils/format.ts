export function formatMeta(...parts: (string | undefined | null)[]): string {
  return parts.filter(part => part && part.trim()).join(' · ');
}

export function truncate(value: string, max: number): string {
  if (!value || value.length <= max) {
    return value ?? '';
  }
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

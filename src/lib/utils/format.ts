/**
 * format.ts
 * Formatting utilities for scores, dates, sizes, and labels.
 */

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '--';
  return `${Math.round(score)}%`;
}

export function formatAlignmentLevel(level: string): { label: string; color: string; bgColor: string } {
  switch (level) {
    case 'very_high':
      return {
        label: 'Alineación muy alta',
        color: 'text-brand-green-600',
        bgColor: 'bg-brand-green-600/10 border-brand-green-600/30',
      };
    case 'good':
      return {
        label: 'Buena alineación',
        color: 'text-brand-green-400',
        bgColor: 'bg-brand-green-400/10 border-brand-green-400/30',
      };
    case 'medium':
      return {
        label: 'Alineación media',
        color: 'text-semantic-warning',
        bgColor: 'bg-semantic-warning/10 border-semantic-warning/30',
      };
    case 'low':
    default:
      return {
        label: 'Divergencias importantes',
        color: 'text-semantic-danger',
        bgColor: 'bg-semantic-danger/10 border-semantic-danger/30',
      };
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Sin fecha';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

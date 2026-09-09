/**
 * Date / time helpers — small utilities used across screens.
 */

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day > 1 ? 's' : ''} ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk} wk${wk > 1 ? 's' : ''} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} mo${month > 1 ? 's' : ''} ago`;
  const year = Math.floor(day / 365);
  return `${year} yr${year > 1 ? 's' : ''} ago`;
}

export function formatDate(
  dateStr: string,
  opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', opts);
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}

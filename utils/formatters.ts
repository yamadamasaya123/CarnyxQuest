/**
 * Formats seconds into HH:MM:SS or string representation.
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

/**
 * Format string as human UTC dates.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Formats decimal numbers cleanly.
 */
export function formatDecimal(val: number, decimals: number = 1): string {
  if (isNaN(val)) return "0";
  return val.toFixed(decimals);
}

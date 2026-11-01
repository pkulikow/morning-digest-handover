import type { RunStatus, StatusCounts } from './types.js';

// Pure: number of log lines per status. Every status is present, zero when absent.
export function countStatuses(statuses: readonly RunStatus[]): StatusCounts {
  const counts: StatusCounts = { ok: 0, retry: 0, fail: 0 };
  for (const s of statuses) counts[s]++;
  return counts;
}

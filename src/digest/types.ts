export type RunStatus = 'ok' | 'retry' | 'fail';

export type StatusCounts = Record<RunStatus, number>;

export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

export type Night = {
  rows: DigestRow[];
  badLines: number;
  counts: StatusCounts;
};

// Reads runs/<night>.jsonl. Returns null when the night has no file; a bad line is counted, never thrown.
export type ReadNight = (runsDir: string, night: string) => Night | null;

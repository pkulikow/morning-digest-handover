import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

let runsDir: string;
const app = () =>
  createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });

beforeAll(() => {
  runsDir = mkdtempSync(join(tmpdir(), 'rig-runs-'));
  writeFileSync(join(runsDir, '2026-01-01.jsonl'), '');
  writeFileSync(
    join(runsDir, '2026-01-02.jsonl'),
    [
      '{"at":"2026-01-02T01:00:00+01:00","job":"b/job","status":"ok","owner":"rook"}',
      'not json',
      '{"at":"2026-01-02T02:00:00+01:00","job":"a/job","status":"fail","owner":null,"error":"boom"}',
    ].join('\n'),
  );
});

describe.each([
  ['page', (n: string) => `/digest/${n}`],
  ['json', (n: string) => `/api/digest/${n}`],
])('%s', (_name, path) => {
  it('200 for a night with a file', async () => {
    expect((await app().request(path('2026-01-02'))).status).toBe(200);
  });

  it('404 for a night with no file', async () => {
    expect((await app().request(path('2026-02-02'))).status).toBe(404);
  });
});

describe('empty night', () => {
  it('page says nothing ran', async () => {
    const res = await app().request('/digest/2026-01-01');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('json has no rows', async () => {
    const body = await (await app().request('/api/digest/2026-01-01')).json();
    expect(body).toMatchObject({ rows: [], badLines: 0 });
  });
});

describe('night with a bad line', () => {
  it('still renders the page, with — for a null owner', async () => {
    const html = await (await app().request('/digest/2026-01-02')).text();
    expect(html).toContain('a/job');
    expect(html).toContain('—');
  });

  it('json counts the bad line and keeps the rows in page order', async () => {
    const body = (await (await app().request('/api/digest/2026-01-02')).json()) as {
      rows: { job: string }[];
      badLines: number;
    };
    expect(body.badLines).toBe(1);
    expect(body.rows.map((r) => r.job)).toEqual(['a/job', 'b/job']);
    const html = await (await app().request('/digest/2026-01-02')).text();
    expect(html.indexOf('a/job')).toBeLessThan(html.indexOf('b/job'));
  });
});

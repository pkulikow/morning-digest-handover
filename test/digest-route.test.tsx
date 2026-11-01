import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const config = { adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: 'runs' };

describe('GET /digest/:night', () => {
  it('renders the night as one table sorted by job', async () => {
    const res = await createApp(config).request('/digest/2026-10-28');
    const html = await res.text();
    expect(res.status).toBe(200);
    const jobs = [...html.matchAll(/<td>(digest\/render|fixtures\/refresh|lane\/sync|notes\/backup|rig\/rotate-logs)<\/td>/g)].map((m) => m[1]);
    expect(jobs).toEqual(['digest/render', 'fixtures/refresh', 'lane/sync', 'notes/backup', 'rig/rotate-logs']);
    expect(html).toContain('class="warn"');
  });

  it('404s for a night with no file', async () => {
    expect((await createApp(config).request('/digest/1999-01-01')).status).toBe(404);
  });

  it('404s for a malformed night', async () => {
    expect((await createApp(config).request('/digest/2026-1-1')).status).toBe(404);
  });
});

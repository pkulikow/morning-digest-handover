import type { DigestRow } from '../digest/types.js';

const dash = (v: string | null) => (v === null ? '—' : v);

export function DigestTable({ night, rows }: { night: string; rows: DigestRow[] }) {
  return (
    <>
      <h1>digest · {night}</h1>
      {rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>last status</th>
              <th>last error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const warn = r.retries >= 3 || r.lastStatus === 'fail';
              return (
                <tr class={warn ? 'warn' : undefined}>
                  <td>{r.job}</td>
                  <td>{dash(r.owner)}</td>
                  <td>{r.runs}</td>
                  <td>{r.retries}</td>
                  <td>{r.lastStatus}</td>
                  <td>{dash(r.lastError)}</td>
                  <td>{r.firstAt}</td>
                  <td>{r.lastAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

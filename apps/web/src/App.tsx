import { healthResponseSchema, type HealthResponse } from '@teamdocs/contracts';
import { useEffect, useState } from 'react';
import './App.css';

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ready'; value: HealthResponse }
  | { kind: 'error'; message: string };

async function requestHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch('/api/health', { signal });
  const body: unknown = await response.json();
  const parsed = healthResponseSchema.safeParse(body);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  if (!parsed.success) {
    throw new Error('API returned a response that violates the shared contract');
  }

  return parsed.data;
}

function App() {
  const [health, setHealth] = useState<HealthState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    void requestHealth(controller.signal)
      .then((value) => setHealth({ kind: 'ready', value }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setHealth({
          kind: 'error',
          message: error instanceof Error ? error.message : 'Unknown request error',
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <p className="eyebrow">TeamDocs · foundation ready</p>
      <h1>Vite + NestJS + TypeScript ESM</h1>
      <p className="intro">
        Этот первый vertical slice использует <code>@teamdocs/contracts</code> и проверяет
        HTTP-ответ схемой до того, как данные попадут в UI.
      </p>

      <section className="status-card" aria-live="polite">
        <h2>API health</h2>
        {health.kind === 'loading' && <p>Проверяем API…</p>}
        {health.kind === 'ready' && (
          <dl>
            <div>
              <dt>Статус</dt>
              <dd>{health.value.status}</dd>
            </div>
            <div>
              <dt>Сервис</dt>
              <dd>{health.value.service}</dd>
            </div>
            <div>
              <dt>Время ответа</dt>
              <dd>{new Date(health.value.timestamp).toLocaleString()}</dd>
            </div>
          </dl>
        )}
        {health.kind === 'error' && <p className="error">{health.message}</p>}
      </section>

      <section className="architecture" aria-label="Project structure">
        <h2>Контрактная граница</h2>
        <ol>
          <li>NestJS создаёт ответ и валидирует его через shared Zod schema.</li>
          <li>Vite proxy передаёт запрос <code>/api/health</code> на API.</li>
          <li>React получает <code>unknown</code> из <code>response.json()</code>.</li>
          <li>Только successful schema parse делает данные <code>HealthResponse</code>.</li>
        </ol>
      </section>
    </main>
  );
}

export default App;

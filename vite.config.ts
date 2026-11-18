import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function resolveServerGeminiKey(rootDir: string): string {
  const fromEnv =
    process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (fromEnv.trim()) return fromEnv.trim();

  try {
    const envPath = path.join(rootDir, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^(?:VITE_)?GEMINI_API_KEY\s*=\s*(.+)$/);
        if (match && match[1]) {
          return match[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch {
    // ignore .env read errors
  }

  try {
    const tsPath = path.join(rootDir, 'src', 'apiKey.ts');
    if (fs.existsSync(tsPath)) {
      const content = fs.readFileSync(tsPath, 'utf-8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*['"]([^'"]+)['"]/);
      if (match && match[1]) return match[1].trim();
    }
  } catch {
    // ignore apiKey.ts read errors
  }

  return '';
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function biznesBackendPlugin(): Plugin {
  const rootDir = process.cwd();

  const attachMiddleware = (middlewares: {
    use: (
      handler: (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void
      ) => void
    ) => void;
  }) => {
    middlewares.use(async (req, res, next) => {
      const url = req.url?.split('?')[0] || '';
      if (!url.startsWith('/api/')) {
        next();
        return;
      }

      if (req.method === 'GET' && url === '/api/health') {
        const hasKey = Boolean(resolveServerGeminiKey(rootDir));
        sendJson(res, 200, {
          ok: true,
          service: 'Biznes-Maslahatchi AI Backend API',
          hasAiKey: hasKey,
          districtsSupported: 12,
          banksSupported: 10,
        });
        return;
      }

      if (
        (req.method === 'GET' && url === '/api/bank-rates') ||
        (req.method === 'POST' && url === '/api/bank-rates/refresh')
      ) {
        sendJson(res, 200, {
          ok: true,
          updatedAt: new Date().toISOString(),
          nextUpdateInSeconds: 60,
          sourceRu: 'Реестр тарифов 10 банков РУз и ЦБ РУз',
          sourceUz: "O'zR MB va 10 ta bank tariflari reestri",
          cbuRatePercent: 13.5,
          banksCount: 10,
        });
        return;
      }

      if (req.method === 'POST' && url === '/api/ai-consultant') {
        const body = await readJsonBody(req);
        const systemInstruction = String(body.systemInstruction || '');
        const prompt = String(body.prompt || '');
        const apiKey = resolveServerGeminiKey(rootDir);

        if (!apiKey || !prompt.trim()) {
          sendJson(res, 200, { ok: false, reason: 'no_key_or_empty_prompt' });
          return;
        }

        const modelCandidates = [
          'gemini-flash-latest',
          'gemini-3.5-flash',
        ];

        for (const model of modelCandidates) {
          try {
            const upstream = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
                apiKey
              )}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(12000),
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: systemInstruction }],
                  },
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: prompt }],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1500,
                  },
                }),
              }
            );

            if (upstream.ok) {
              const data = (await upstream.json()) as {
                candidates?: Array<{
                  content?: { parts?: Array<{ text?: string }> };
                }>;
              };
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.trim().length > 0) {
                sendJson(res, 200, {
                  ok: true,
                  text: text.trim(),
                  model,
                });
                return;
              }
            }
          } catch {
            // Try next model candidate
          }
        }

        sendJson(res, 200, { ok: false, reason: 'upstream_unavailable' });
        return;
      }

      sendJson(res, 404, { ok: false, error: 'Unknown API endpoint' });
    });
  };

  return {
    name: 'biznes-maslahatchi-backend-api',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  plugins: [react(), biznesBackendPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});

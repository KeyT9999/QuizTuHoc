import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { ServerResponse } from 'node:http';
import askAIHandler from './api/ask-ai.js';

const MAX_LOCAL_BODY_BYTES = 128 * 1024;

function createJsonResponse(res: ServerResponse) {
  let statusCode = 200;
  const response = {
    setHeader(name: string, value: string | number) {
      res.setHeader(name, String(value));
      return response;
    },
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(body: unknown) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
    },
    end() {
      res.statusCode = statusCode;
      res.end();
    },
  };

  return response;
}

function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on('data', (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size <= MAX_LOCAL_BODY_BYTES) chunks.push(buffer);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function localApiPlugin(): Plugin {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/ask-ai', async (req, res) => {
        try {
          const body = await readRequestBody(req);
          const response = createJsonResponse(res);
          await askAIHandler({
            method: req.method,
            body,
            headers: req.headers,
          }, response);
        } catch {
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: { code: 'LOCAL_API_ERROR', message: 'Không thể xử lý API AI ở môi trường local.' } }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (env.XKIRO_API_KEY && !process.env.XKIRO_API_KEY) {
    process.env.XKIRO_API_KEY = env.XKIRO_API_KEY;
  }
  if (env.XKIRO_MODEL && !process.env.XKIRO_MODEL) {
    process.env.XKIRO_MODEL = env.XKIRO_MODEL;
  }

  return {
    plugins: [react(), localApiPlugin()],
  };
});

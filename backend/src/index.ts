import { env, validateEnv } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function bootstrap() {
  validateEnv();
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[Server] QUIZTUHOC Backend đang chạy tại http://localhost:${env.port}`);
    console.log(`[Server] Frontend URL: ${env.frontendUrl}`);
    console.log(`[Server] CORS Origins: ${env.corsOrigins.join(', ')}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[Server] Nhận tín hiệu ${signal}, đang dừng an toàn...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[Bootstrap Error]', error);
  process.exit(1);
});

require('dotenv').config();

import path from 'path';
import Redis from 'ioredis';
import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import chalk from 'chalk';

import books from './routes/books';
import anime from './routes/anime';
import manga from './routes/manga';
import comics from './routes/comics';
import lightnovels from './routes/light-novels';
import movies from './routes/movies';
import meta from './routes/meta';
import news from './routes/news';
import Utils from './utils';

export const redis =
  process.env.REDIS_HOST &&
  new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

export const REDIS_TTL = Number(process.env.REDIS_TTL) || 3600;

const fastify = Fastify({
  maxParamLength: 1000,
  logger: true,
});

export const tmdbApi = process.env.TMDB_KEY;

async function start() {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  await fastify.register(FastifyCors, {
    origin: '*',
    methods: ['GET', 'POST'],
  });

  await fastify.register(FastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
    index: ['index.html'],
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Consumet API',
        description: 'Self-hosted Consumet API documentation',
        version: '1.0.0',
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/swagger',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  console.log(chalk.green(`Starting server on port ${PORT}... ���`));

  if (!process.env.REDIS_HOST) {
    console.warn(chalk.yellowBright('Redis not found. Cache disabled.'));
  } else {
    console.log(chalk.green(`Redis connected. Default Cache TTL: ${REDIS_TTL} seconds`));
  }

  if (!process.env.TMDB_KEY) {
    console.warn(chalk.yellowBright('TMDB api key not found. TMDB meta route may not work.'));
  }

  await fastify.register(books, { prefix: '/books' });
  await fastify.register(anime, { prefix: '/anime' });
  await fastify.register(manga, { prefix: '/manga' });
  await fastify.register(comics, { prefix: '/comics' });
  await fastify.register(lightnovels, { prefix: '/light-novels' });
  await fastify.register(movies, { prefix: '/movies' });
  await fastify.register(meta, { prefix: '/meta' });
  await fastify.register(news, { prefix: '/news' });
  await fastify.register(Utils, { prefix: '/utils' });

  fastify.get('/health', (_, reply) => {
    reply.status(200).send({
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: 'Endpoint not found' });
  });

  const shutdown = async () => {
    console.log(chalk.yellow('Shutting down...'));
    await fastify.close();
    if (redis) await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(chalk.green(`Server listening at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));
    console.log(chalk.green(`Swagger docs available at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/swagger`));
    console.log(chalk.green(`Admin dashboard at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/admin`));
    console.log(chalk.green(`API docs at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/docs`));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

export default async function handler(req: any, res: any) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
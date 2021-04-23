import createFastify, { FastifyInstance } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCors from 'fastify-cors';
import { AddressInfo } from 'net';
import path from 'path';
import { delay } from './time';

let server: TestServer;

export type TestServer = FastifyInstance & {
  port: number;
  url: string;
  hostname: string;
};

export const createTestServer = async (_options = {}): Promise<TestServer> => {
  const fastify = createFastify();
  fastify.register(fastifyCors, {
    // put your options here
  });
  fastify.addHook('onRequest', async (request) => {
    console.log(`${request.method} ${request.url}`);
  });
  fastify.get('/', (_request, reply) => {
    reply.type('text/html').send('<html><body><h1>Hello World</h1></body></html>');
  });
  fastify.all<{ Headers: any }>('/echo/headers', async (request, _reply) => {
    return request.headers;
  });
  fastify.all<{ Querystring: { delay?: string }; Body: any }>('/echo/body', async (request, _reply) => {
    if (request.query.delay) {
      await delay(parseInt(request.query.delay, 10));
    }
    return request.body;
  });
  fastify.all<{ Querystring: { delay?: string }; Body: any; Headers: any }>('/echo', async (request, _reply) => {
    if (request.query.delay) {
      await delay(parseInt(request.query.delay, 10));
    }
    return {
      body: request.body,
      headers: request.headers,
      method: request.method,
      query: request.query,
      params: request.params,
      url: request.url,
    };
  });
  fastify.register(fastifyStatic, {
    root: path.resolve(__dirname, '../../lib'),
    prefix: '/lib/',
  });
  // @ts-expect-error
  await fastify.listen();
  const address = fastify.server.address() as AddressInfo;
  return Object.assign(fastify, {
    port: address.port,
    url: `http://localhost:${address.port}`,
    hostname: 'localhost',
  }) as TestServer;
};

beforeAll(async () => {
  server = await createTestServer();
});
afterAll(async () => {
  await server.close();
});

export { server };

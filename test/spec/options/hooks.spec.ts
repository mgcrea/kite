import kite from 'src/client';
import { AfterResponseHook, BeforeRequestHook } from 'src/index';
import { server } from 'test/utils/server';
import { delay } from 'test/utils/time';

describe('hooks option', () => {
  const json = {
    foo: true,
    bar: 'string',
    baz: 1,
  };
  it('should work with an empty object', async () => {
    const body = await kite.post(`${server.url}/echo/body`, { json, hooks: {} }).json();
    expect(body).toEqual(json);
  });
  describe('afterResponse', () => {
    it('should properly be called along arguments', async () => {
      const beforeRequest: BeforeRequestHook = (request, options) => {
        expect(request instanceof Request).toBeTruthy();
        expect(options).toBeTruthy();
      };
      const beforeRequestSpy = jest.fn(beforeRequest);
      await kite.post(`${server.url}/echo/body`, { json, hooks: { beforeRequest: [beforeRequestSpy] } }).json();
      expect(beforeRequestSpy).toHaveBeenCalledTimes(1);
    });
    it('should allow request modification', async () => {
      const beforeRequest: BeforeRequestHook = (request, options) => {
        const json = { ...options.json!, foo: false };
        return new Request(request, { body: JSON.stringify(json) });
      };
      const beforeRequestSpy = jest.fn(beforeRequest);
      const body = await kite
        .post(`${server.url}/echo/body`, { json, hooks: { beforeRequest: [beforeRequestSpy] } })
        .json();
      expect(beforeRequestSpy).toHaveBeenCalledTimes(1);
      expect(body).toEqual({ ...json, foo: false });
    });
    it('should support async function', async () => {
      const beforeRequest: BeforeRequestHook = async (request, options) => {
        await delay(100);
        const json = { ...options.json!, foo: false };
        return new Request(request, { body: JSON.stringify(json) });
      };
      const beforeRequestSpy = jest.fn(beforeRequest);
      const body = await kite
        .post(`${server.url}/echo/body`, { json, hooks: { beforeRequest: [beforeRequestSpy] } })
        .json();
      expect(beforeRequestSpy).toHaveBeenCalledTimes(1);
      expect(body).toEqual({ ...json, foo: false });
    });
  });
  describe('afterResponse', () => {
    it('should properly be called along arguments', async () => {
      const afterResponse: AfterResponseHook = (request, options, response) => {
        expect(request instanceof Request).toBeTruthy();
        expect(options).toBeTruthy();
        expect(response instanceof Response).toBeTruthy();
      };
      const afterResponseSpy = jest.fn(afterResponse);
      await kite.post(`${server.url}/echo/body`, { json, hooks: { afterResponse: [afterResponseSpy] } }).json();
      expect(afterResponseSpy).toHaveBeenCalledTimes(1);
    });
    it('should allow response modification', async () => {
      const afterResponse: AfterResponseHook = (_request, options, _response) => {
        const json = { ...options.json!, foo: false };
        return new Response(JSON.stringify(json), { status: 400 });
      };
      const afterResponseSpy = jest.fn(afterResponse);
      const res = await kite.post(`${server.url}/echo/body`, { json, hooks: { afterResponse: [afterResponseSpy] } });
      expect(afterResponseSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toEqual(400);
      const body = await res.json();
      expect(body).toEqual({ ...json, foo: false });
    });
    it('should support async function', async () => {
      const afterResponse: AfterResponseHook = async (_request, options, _response) => {
        await delay(100);
        const json = { ...options.json!, foo: false };
        return new Response(JSON.stringify(json), { status: 400 });
      };
      const afterResponseSpy = jest.fn(afterResponse);
      const res = await kite.post(`${server.url}/echo/body`, { json, hooks: { afterResponse: [afterResponseSpy] } });
      expect(afterResponseSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toEqual(400);
      const body = await res.json();
      expect(body).toEqual({ ...json, foo: false });
    });
  });
});

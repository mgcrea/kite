import { server } from 'test/utils/server';
import kite from 'src/client';
import { BeforeRequestHook } from 'src/index';
import { delay } from 'test/utils/time';

describe('hooks option', () => {
  const json = {
    foo: true,
  };
  it('should work with an empty object', async () => {
    const body = await kite.post(`${server.url}/echo/body`, { json, hooks: {} }).json();
    expect(body).toEqual({ foo: true });
  });
  describe('beforeRequest', () => {
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
        const bodyJson = JSON.parse(options.body as string);
        bodyJson.foo = false;
        return new Request(request, { body: JSON.stringify(bodyJson) });
      };
      const beforeRequestSpy = jest.fn(beforeRequest);
      const body = await kite
        .post(`${server.url}/echo/body`, { json, hooks: { beforeRequest: [beforeRequestSpy] } })
        .json();
      expect(beforeRequestSpy).toHaveBeenCalledTimes(1);
      expect(body).toEqual({ foo: false });
    });
    it('should support async function', async () => {
      const beforeRequest: BeforeRequestHook = async (request, options) => {
        await delay(100);
        const bodyJson = JSON.parse(options.body as string);
        bodyJson.foo = false;
        return new Request(request, { body: JSON.stringify(bodyJson) });
      };
      const beforeRequestSpy = jest.fn(beforeRequest);
      const body = await kite
        .post(`${server.url}/echo/body`, { json, hooks: { beforeRequest: [beforeRequestSpy] } })
        .json();
      expect(beforeRequestSpy).toHaveBeenCalledTimes(1);
      expect(body).toEqual({ foo: false });
    });
  });
});

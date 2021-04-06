import { BeforeRequestHook } from 'src/index';
import { page } from 'test/utils/browser';

describe('hooks option', () => {
  describe('beforeRequest', () => {
    it('should support async function', async () => {
      const handle = await page.evaluateHandle(async () => {
        const json = {
          foo: true,
        };
        const beforeRequest: BeforeRequestHook[] = [
          async (request, options) => {
            await window.delay(100);
            console.warn(request, options.json);
            const bodyJson = JSON.parse(options.body as string);
            bodyJson.foo = false;
            return new Request(request, { body: JSON.stringify(bodyJson) });
          },
        ];
        return await window.kite.post('/echo/body', { json, hooks: { beforeRequest } });
      });
      expect(await page.evaluate((res) => res.status, handle)).toEqual(200);
      const body = await page.evaluate(async (res) => await res.json(), handle);
      expect(body).toEqual('value');
    });
  });
});

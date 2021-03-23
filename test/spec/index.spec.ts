import { page, server } from 'test/utils/browser';

describe('module', () => {
  it('should be loaded', async () => {
    const promiseHandle = await page.evaluateHandle(() => window.kite.get('/404'));
    // expect(await page.evaluate((res) => res instanceof window.KitePromise, promiseHandle)).toBeTruthy();
    const responseHandle = await page.evaluateHandle(async (promise) => await promise, promiseHandle);
    expect(await page.evaluate((res) => res.url, responseHandle)).toEqual(`${server.url}/404`);
    expect(await page.evaluate((res) => res.status, responseHandle)).toEqual(404);
    expect(await page.evaluate((res) => res.statusText, responseHandle)).toEqual('Not Found');
  });
});

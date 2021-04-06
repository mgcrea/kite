import { page, server } from 'test/utils/browser';

describe('prefixUrl option', () => {
  it('should support string input', async () => {
    const handle = await page.evaluateHandle(async () => {
      const prefixUrl = '/api';
      return await window.kite.post('/echo', { prefixUrl });
    });
    expect(await page.evaluate((res) => res.url, handle)).toEqual(`${server.url}/api/echo`);
  });
  it('should support URL input', async () => {
    const url = server.url.replace('localhost', '127.0.0.1');
    const handle = await page.evaluateHandle(async (url) => {
      const prefixUrl = new URL(`${url}/api`);
      return await window.kite.post('/echo', { prefixUrl });
    }, url);
    expect(await page.evaluate((res) => res.url, handle)).toEqual(`${url}/api/echo`);
  });
});

import { page } from 'test/utils/browser';

describe('json option', () => {
  it('should support object input', async () => {
    const handle = await page.evaluateHandle(async () => {
      const json = { foo: 'bar' };
      return await window.kite.post('/echo', { json });
    });
    expect(await page.evaluate((res) => res.status, handle)).toEqual(200);
    const reply = await page.evaluate(async (res) => await res.json(), handle);
    expect(reply.body).toEqual({ foo: 'bar' });
    expect(reply.headers['content-type']).toEqual('application/json');
  });
});

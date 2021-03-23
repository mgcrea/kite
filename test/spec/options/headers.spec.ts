import { page } from 'test/utils/browser';

describe('headers option', () => {
  it('should support object input', async () => {
    const handle = await page.evaluateHandle(async () => {
      return await window.kite.get('/echo/headers', { headers: { 'x-request-id': 'value' } });
    });
    expect(await page.evaluate((res) => res.status, handle)).toEqual(200);
    const headers = await page.evaluate(async (res) => await res.json(), handle);
    expect(headers['x-request-id']).toEqual('value');
  });
  it('should override provided `accept-encoding`', async () => {
    const handle = await page.evaluateHandle(async () => {
      return await window.kite.get('/echo/headers', { headers: { 'accept-encoding': 'gzip' } });
    });
    expect(await page.evaluate((res) => res.status, handle)).toEqual(200);
    const headers = await page.evaluate(async (res) => await res.json(), handle);
    expect(headers['accept-encoding']).toEqual('gzip, deflate, br');
  });
  it('should transform headers to lowercase', async () => {
    const headers = await page.evaluate(async () => {
      return await window.kite.get('/echo/headers', { headers: { 'X-Request-Id': 'value' } }).json();
    });
    expect(headers['X-Request-Id']).toBeUndefined();
    expect(headers['x-request-id']).toEqual('value');
  });
  it('should ignore undefined headers', async () => {
    const headers = await page.evaluate(async () => {
      return await window.kite
        .get('/echo/headers', { headers: { 'x-request-id': 'value', 'x-foo': undefined } })
        .json();
    });
    expect('x-request-id' in headers).toBeTruthy();
    expect('x-foo' in headers).toBeFalsy();
  });
  it('should remove undefined headers', async () => {
    const headers = await page.evaluate(async () => {
      const client = window.kite.create({ headers: { 'x-foo': 'bar' } });
      return await client.get('/echo/headers', { headers: { 'x-request-id': 'value', 'x-foo': undefined } }).json();
    });
    expect('x-request-id' in headers).toBeTruthy();
    expect('x-foo' in headers).toBeFalsy();
  });
  it('should set `accept` header with `json` method', async () => {
    const headers = await page.evaluate(async () => {
      return await window.kite.get('/echo/headers').json();
    });
    expect(headers['accept']).toEqual('application/json');
  });
});

import kite from 'src/client';
import { TimeoutError } from 'src/errors/TimeoutError';
import { server } from 'test/utils/server';

describe('timeout option', () => {
  it('should work with a zero value', async () => {
    await kite.get(`${server.url}/echo/body?delay=500`, { timeout: 0 }).json();
  });
  it('should throw a TimeoutError', async () => {
    await expect(async () => {
      await kite.get(`${server.url}/echo/body?delay=500`, { timeout: 100 });
    }).rejects.toThrowError(TimeoutError);
  });
});

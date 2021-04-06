import { server } from 'test/utils/server';
import kite from 'src/client';

describe('module', () => {
  it('should be loaded', async () => {
    const res = await kite.get(`${server.url}/404`);
    expect(res.url).toEqual(`${server.url}/404`);
    expect(res.status).toEqual(404);
    expect(res.statusText).toEqual('Not Found');
  });
});

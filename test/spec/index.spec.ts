import { server } from 'test/utils/server';
import kite from 'src/client';

describe('ky', () => {
  it('should support async usage', async () => {
    const res = await kite.get(`${server.url}/404`);
    expect(res.url).toEqual(`${server.url}/404`);
    expect(res.status).toEqual(404);
    expect(res.statusText).toEqual('Not Found');
  });
  it('should support promise usage', async () => {
    await kite.get(`${server.url}/404`).then((res) => {
      expect(res.url).toEqual(`${server.url}/404`);
      expect(res.status).toEqual(404);
      expect(res.statusText).toEqual('Not Found');
    });
  });
  // it('should support void usage', async () => {
  //   const res = kite.get(`${server.url}/404`);
  // });
});

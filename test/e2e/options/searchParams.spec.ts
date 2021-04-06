import { page } from 'test/utils/browser';

describe('searchParams option', () => {
  it('should support URLSearchParams input', async () => {
    const reply = await page.evaluate(async () => {
      const urlSearchParams = new URLSearchParams([
        ['cats', 'meow'],
        ['dogs', 'true'],
        ['opossums', 'false'],
      ]);
      return await window.kite.post('/echo', { searchParams: urlSearchParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats=meow&dogs=true&opossums=false`);
  });
  it('should support array input', async () => {
    const reply = await page.evaluate(async () => {
      const arrayParams = [
        ['cats', 'meow'],
        ['dogs', 'true'],
        ['opossums', 'false'],
      ];
      return await window.kite.post('/echo', { searchParams: arrayParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats=meow&dogs=true&opossums=false`);
  });
  it('should support object input', async () => {
    const reply = await page.evaluate(async () => {
      const objectParams = {
        cats: 'meow',
        dogs: 'true',
        opossums: 'false',
      };
      return await window.kite.post('/echo', { searchParams: objectParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats=meow&dogs=true&opossums=false`);
  });
  it('should support string input', async () => {
    const reply = await page.evaluate(async () => {
      const stringParams = '?cats=meow&dogs=true&opossums=false';
      return await window.kite.post('/echo', { searchParams: stringParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats=meow&dogs=true&opossums=false`);
  });
  it('should support custom string input', async () => {
    const reply = await page.evaluate(async () => {
      const stringParams = '?cats&dogs[0]=true&dogs[1]=false';
      return await window.kite.post('/echo', { searchParams: stringParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats&dogs[0]=true&dogs[1]=false`);
  });
  it('should replace existing searchParams', async () => {
    const reply = await page.evaluate(async () => {
      const stringParams = '?cats=meow&dogs=true&opossums=false';
      return await window.kite.post('/echo?foo=bar', { searchParams: stringParams }).json();
    });
    expect(reply.url).toEqual(`/echo?cats=meow&dogs=true&opossums=false`);
  });
});

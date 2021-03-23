import type { KiteRequest } from './KiteRequest.js';

// https://developer.mozilla.org/en-US/docs/Web/API/Body#methods
type JSONValue = Record<string, unknown>;

export class KitePromise implements PromiseLike<Response> {
  private constructor(private request: KiteRequest) {}
  static create(request: KiteRequest): KitePromise {
    return new KitePromise(request);
  }
  then<TResult1 = Response, TResult2 = never>(
    onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.request.fetch().then(onfulfilled, onrejected);
  }
  async arrayBuffer(): Promise<ArrayBuffer> {
    return (await this.request.fetch()).arrayBuffer();
  }
  async blob(): Promise<Blob> {
    return (await this.request.fetch()).blob();
  }
  async formData(): Promise<FormData> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'multipart/form-data');
    }
    return (await this.request.fetch()).formData();
  }
  async json(): Promise<JSONValue> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'application/json');
    }
    return (await this.request.fetch()).json();
  }
  async text(): Promise<string> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'text/*');
    }
    return (await this.request.fetch()).text();
  }
}

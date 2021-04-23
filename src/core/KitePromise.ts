import { HTTPError } from '../errors/HTTPError.js';
import { TimeoutError } from '../errors/TimeoutError.js';
import type { JSONValue, KiteNormalizedOptions } from './KiteClient.js';
import type { KiteRequest } from './KiteRequest.js';

export type KitePromiseOptions = Pick<
  KiteNormalizedOptions,
  'hooks' | 'fetch' | 'timeout' | 'parseJson' | 'throwHttpErrors'
>;

export class KitePromise implements PromiseLike<Response> {
  #value: Promise<Response>;
  private constructor(private readonly request: KiteRequest, private readonly options: KitePromiseOptions) {
    this.#value = this.resolve();
  }
  static create(request: KiteRequest, options: KitePromiseOptions): KitePromise {
    return new KitePromise(request, options);
  }
  private async fetch(input: Request): Promise<Response> {
    const { request, options } = this;
    const { hooks } = options;
    let resolvedRequest = input;
    for (const hook of hooks.beforeRequest) {
      const result = await hook(input, request.init);
      if (result instanceof Request) {
        resolvedRequest = result;
        break;
      }
      if (result instanceof Response) {
        return result;
      }
    }
    const res = await this.fetchWithTimeout(resolvedRequest);
    return res;
  }
  private async fetchWithTimeout(resolvedRequest: Request): Promise<Response> {
    const { request, options } = this;
    const { timeout } = options;
    const fetch = options.fetch ?? globalThis.fetch;
    if (!timeout) {
      return fetch(resolvedRequest);
    }
    return new Promise<Response>((resolve, reject) => {
      const timeoutID = setTimeout(() => {
        if (request.abortController) {
          request.abortController.abort();
        }
        reject(new TimeoutError(resolvedRequest));
      }, options.timeout);

      fetch(resolvedRequest)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          clearTimeout(timeoutID);
        });
    });
  }
  private async resolve(): Promise<Response> {
    const { request, options } = this;
    const { hooks, throwHttpErrors } = options;
    const inputRequest = request.toRequest();
    let resolvedResponse = this.decorateResponse(await this.fetch(inputRequest));
    for (const hook of hooks.afterResponse) {
      const result = await hook(inputRequest, request.init, resolvedResponse);
      if (result instanceof Response) {
        resolvedResponse = this.decorateResponse(result);
      }
    }
    if (!resolvedResponse.ok && throwHttpErrors) {
      throw new HTTPError(resolvedResponse, inputRequest, request.init);
    }
    return resolvedResponse;
  }
  private decorateResponse(response: Response): Response {
    const { parseJson } = this.options;
    if (parseJson) {
      response.json = async () => {
        return parseJson(await response.text());
      };
    }
    return response;
  }
  public then<TResult1 = Response, TResult2 = never>(
    onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.#value.then(onfulfilled, onrejected);
  }
  public async arrayBuffer(): Promise<ArrayBuffer> {
    return (await this.#value).arrayBuffer();
  }
  public async blob(): Promise<Blob> {
    return (await this.#value).blob();
  }
  public async formData(): Promise<FormData> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'multipart/form-data');
    }
    return (await this.#value).formData();
  }
  public async json(): Promise<JSONValue> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'application/json');
    }
    return (await this.#value).json();
  }
  public async text(): Promise<string> {
    const { headers } = this.request;
    if (!headers.has('accept')) {
      headers.set('accept', 'text/*');
    }
    return (await this.#value).text();
  }
}

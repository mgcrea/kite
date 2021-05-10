import { MAX_SAFE_TIMEOUT } from 'src/utils/support.js';
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
  private async fetch(inputRequest: Request): Promise<Response> {
    const { request, options } = this;
    const { hooks, throwHttpErrors, timeout, fetch } = options;
    let resolvedRequest = inputRequest;
    for (const hook of hooks.beforeRequest) {
      const result = await hook(inputRequest, request.init);
      if (result instanceof Request) {
        resolvedRequest = result;
        break;
      }
      if (result instanceof Response) {
        return result;
      }
    }
    const res = await fetchWithTimeout(resolvedRequest, timeout, { fetch, abortController: request.abortController });
    if (!res.ok && throwHttpErrors) {
      throw new HTTPError(res, resolvedRequest, request.init);
    }
    return res;
  }
  private async resolve(): Promise<Response> {
    const { request, options } = this;
    const { hooks } = options;
    const inputRequest = request.toRequest();
    const response = await retryWithDelay(() => this.fetch(inputRequest));
    let resolvedResponse = this.decorateResponse(response);
    for (const hook of hooks.afterResponse) {
      const result = await hook(inputRequest, request.init, resolvedResponse);
      if (result instanceof Response) {
        resolvedResponse = this.decorateResponse(result);
      }
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

type FetchWithTimeoutOptions = {
  abortController?: AbortController;
  fetch?: typeof fetch;
};

const fetchWithTimeout = async (
  request: Request,
  timeout = 0,
  { fetch = globalThis.fetch, abortController }: FetchWithTimeoutOptions
): Promise<Response> => {
  if (!timeout) {
    return fetch(request);
  }
  if (timeout > MAX_SAFE_TIMEOUT) {
    throw new RangeError(`The \`timeout\` option cannot be greater than ${MAX_SAFE_TIMEOUT}`);
  }
  return new Promise<Response>((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      reject(new TimeoutError(request));
    }, timeout);

    fetch(request)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        clearTimeout(timeoutID);
      });
  });
};

const retryWithDelay = async <T extends () => Promise<Response>>(operation: T): Promise<Response> => {
  try {
    return await operation();
  } catch (error) {
    console.dir({ error });
    return new Response();
  }
};

import { KiteRequest, KiteRequestInit } from './KiteRequest.js';
import { KitePromiseOptions } from './KitePromise.js';
import { KitePromise } from './KitePromise.js';
import { mergeOptions } from '../utils/merge.js';

// https://developer.mozilla.org/en-US/docs/Web/API/Body#methods
export type JSONValue = Record<string, unknown>;

export type BeforeRequestHook = (
  request: Request,
  options: Readonly<KiteRequestInit>
) => Request | Response | void | Promise<Request | Response | void>;

export type AfterResponseHook = (
  request: Request,
  options: Readonly<KiteRequestInit>,
  response: Response
) => Response | void | Promise<Response | void>;

export type KiteHooks = {
  beforeRequest: BeforeRequestHook[];
  afterResponse: AfterResponseHook[];
};

export type KiteHeadersInit = Headers | string[][] | Record<string, string | undefined>;

export type KiteOptions = Omit<KiteRequestInit, 'headers'> & {
  fetch?: typeof fetch;
  headers?: KiteHeadersInit;
  hooks?: Partial<KiteHooks>;
  parseJson?: (text: string) => JSONValue;
  throwHttpErrors?: boolean;
  timeout?: number;
};

export type KiteNormalizedOptions = Omit<KiteOptions, 'hooks' | 'headers'> & { hooks: KiteHooks; headers: Headers };

export class KiteClient {
  private constructor(public readonly options: KiteNormalizedOptions) {}
  public static create(options?: KiteOptions): KiteClient {
    return new KiteClient(mergeOptions({}, options));
  }
  public create(options?: KiteOptions): KiteClient {
    return KiteClient.create(options);
  }
  public extend(options?: KiteOptions): KiteClient {
    const mergedOptions = mergeOptions(this.options, options);
    return KiteClient.create(mergedOptions);
  }
  public fetch(input: string, init?: KiteOptions): KitePromise {
    const mergedOptions = mergeOptions(this.options, init);
    const [requestInit, promiseOptions] = splitOptions(mergedOptions);
    const request = new KiteRequest(input, requestInit);
    return KitePromise.create(request, promiseOptions);
  }
  public get(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'GET', ...init });
  }
  public head(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'HEAD', ...init });
  }
  public post(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'POST', ...init });
  }
  public put(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'PUT', ...init });
  }
  public patch(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'PATCH', ...init });
  }
  public delete(input: string, init?: Omit<KiteOptions, 'method'>): KitePromise {
    return this.fetch(input, { method: 'DELETE', ...init });
  }
}

const splitOptions = (options: KiteNormalizedOptions): [KiteRequestInit, KitePromiseOptions] => {
  const { fetch, hooks, parseJson, throwHttpErrors, timeout, ...requestInit } = options;
  return [requestInit, { fetch, hooks, parseJson, throwHttpErrors, timeout }];
};

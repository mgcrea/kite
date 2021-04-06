import { KiteRequest } from './KiteRequest.js';
import { KitePromise } from './KitePromise.js';
import { mergeOptions } from '../utils/merge.js';

export type BeforeRequestHook = (
  request: Request,
  options: RequestInit
) => Request | Response | void | Promise<Request | Response | void>;

export type AfterResponseHook = (
  request: Request,
  options: RequestInit,
  response: Response
) => Response | void | Promise<Response | void>;

export type KiteHooks = {
  beforeRequest: BeforeRequestHook[];
  afterResponse: AfterResponseHook[];
};

export type URLSearchParamsInit = ConstructorParameters<typeof URLSearchParams>[0];

export type KiteHeadersInit = Headers | string[][] | Record<string, string | undefined>;

export type KiteRequestInit = Omit<RequestInit, 'headers'> & {
  fetch?: typeof fetch;
  prefixUrl?: string | URL;
  json?: unknown;
  searchParams?: URLSearchParamsInit;
  hooks?: Partial<KiteHooks>;
  headers?: KiteHeadersInit;
};

export type KiteOptions = Omit<KiteRequestInit, 'hooks'> & { hooks: KiteHooks; headers: Headers };

export type KiteNormalizedOptions = Omit<RequestInit, 'headers'> & {
  headers: Headers;
};

export class KiteClient {
  private constructor(public options: KiteOptions) {}
  public static create(options?: KiteRequestInit): KiteClient {
    return new KiteClient(mergeOptions({}, options));
  }
  public create(options?: KiteRequestInit): KiteClient {
    return KiteClient.create(options);
  }
  public extend(options?: KiteRequestInit): KiteClient {
    const mergedOptions = mergeOptions(this.options, options);
    return KiteClient.create(mergedOptions);
  }
  public fetch(input: string, init?: KiteRequestInit): KitePromise {
    const mergedOptions = mergeOptions(this.options, init);
    const request = new KiteRequest(input, mergedOptions);
    return KitePromise.create(request);
  }
  public get(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'GET', ...init });
  }
  public head(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'HEAD', ...init });
  }
  public post(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'POST', ...init });
  }
  public put(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'PUT', ...init });
  }
  public patch(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'PATCH', ...init });
  }
  public delete(input: string, init?: Omit<KiteRequestInit, 'method'>): KitePromise {
    return this.fetch(input, { method: 'DELETE', ...init });
  }
}

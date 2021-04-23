import { SUPPORTS_ABORT_CONTROLLER } from '../utils/support';

export type URLSearchParamsInit = ConstructorParameters<typeof URLSearchParams>[0];

export type KiteRequestInit = RequestInit & {
  json?: Readonly<unknown>;
  prefixUrl?: string | URL;
  searchParams?: URLSearchParamsInit;
};

export class KiteRequest {
  public readonly headers: Headers;
  public readonly abortController?: AbortController;
  constructor(public readonly input: string, public readonly init: Readonly<KiteRequestInit>) {
    this.headers = new Headers(init.headers);
    // Add timeout support via AbortController API
    if (SUPPORTS_ABORT_CONTROLLER) {
      this.abortController = new globalThis.AbortController();
      if (init.signal) {
        // Forward abort event
        init.signal.addEventListener('abort', () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.abortController!.abort();
        });
      }
    }
  }
  public toRequest(): Request {
    return new Request(this.buildInput(), this.buildInit());
  }
  private buildInput(): string {
    const { input } = this;
    const parts = [this.normalizePrefixUrl()];
    const searchParams = this.normalizeSearchParams();
    if (searchParams) {
      const inputWithoutSearchParams = input.split('?')[0];
      parts.push(inputWithoutSearchParams, `?${searchParams}`);
    } else {
      parts.push(input);
    }
    return parts.join('');
  }
  private buildInit(): RequestInit {
    const { headers } = this;
    const method = this.normalizeMethod();
    const body = this.normalizeBody();
    const signal = this.abortController?.signal;
    return { ...this.init, headers, method, body, signal };
  }
  private normalizePrefixUrl(): string {
    const { input, init } = this;
    if (!init.prefixUrl) {
      return '';
    }
    const prefixUrl = init.prefixUrl.toString();
    if (!prefixUrl.endsWith('/') && !input.startsWith('/')) {
      return `${prefixUrl}/`;
    }
    return prefixUrl;
  }
  private normalizeSearchParams(): string {
    const { searchParams } = this.init;
    if (!searchParams) {
      return '';
    }
    if (typeof searchParams === 'string') {
      return searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    }
    return new URLSearchParams(searchParams).toString();
  }
  private normalizeMethod(): RequestInit['method'] {
    const { method } = this.init;
    return method ? method.toUpperCase() : 'GET';
  }
  private normalizeBody(): RequestInit['body'] {
    const { json, body } = this.init;
    if (json) {
      this.headers.set('content-type', 'application/json');
    }
    return json ? JSON.stringify(json) : body;
  }
}

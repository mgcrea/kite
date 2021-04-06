import type { KiteHooks, KiteOptions } from './KiteClient.js';

export class KiteRequest {
  public readonly headers: Headers;
  private readonly hooks: KiteHooks;
  private init: RequestInit;
  constructor(private input: string, private readonly options: KiteOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { headers, hooks, ...otherInit } = options;
    this.headers = new Headers(headers);
    this.hooks = hooks;
    this.init = this.buildInit(otherInit);
  }
  public async fetch(): Promise<Response> {
    const { beforeRequest } = this.hooks;
    let request = this.build();
    for (const hook of beforeRequest) {
      const result = await hook(request, this.init);
      if (result instanceof Request) {
        request = result;
        break;
      }
      if (result instanceof Response) {
        return result;
      }
    }
    return (this.options.fetch ?? window.fetch)(request);
  }
  private build(): Request {
    return new Request(this.buildInput(), this.init);
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
  private buildInit(otherInit: Partial<RequestInit>): RequestInit {
    const { headers } = this;
    const method = this.normalizeMethod();
    const body = this.normalizeBody();
    return { ...otherInit, headers, method, body };
  }
  private normalizePrefixUrl(): string {
    const { options, input } = this;
    if (!options.prefixUrl) {
      return '';
    }
    const prefixUrl = options.prefixUrl.toString();
    if (!prefixUrl.endsWith('/') && !input.startsWith('/')) {
      return `${prefixUrl}/`;
    }
    return prefixUrl;
  }
  private normalizeSearchParams(): string {
    const { searchParams } = this.options;
    if (!searchParams) {
      return '';
    }
    if (typeof searchParams === 'string') {
      return searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    }
    return new URLSearchParams(searchParams).toString();
  }
  private normalizeMethod(): RequestInit['method'] {
    const { options } = this;
    const method = options.method ? options.method.toUpperCase() : 'GET';
    return method;
  }
  private normalizeBody(): RequestInit['body'] {
    const { options, headers } = this;
    const { json, body } = options;
    if (json) {
      headers.set('content-type', 'application/json');
    }
    return json ? JSON.stringify(json) : body;
  }
}

import type { KiteHooks, KiteOptions } from './KiteClient.js';

export class KiteRequest {
  public readonly headers: Headers;
  private readonly hooks: KiteHooks;
  constructor(private input: string, private readonly init: KiteOptions) {
    const { headers, hooks } = init;
    this.headers = new Headers(headers);
    this.hooks = hooks;
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
    return (this.init.fetch ?? window.fetch)(request);
  }
  private buildInput(): string {
    const { input } = this;
    const parts = [this.buildPrefixUrl()];
    const searchParams = this.buildSearchParams();
    if (searchParams) {
      const inputWithoutSearchParams = input.split('?')[0];
      parts.push(inputWithoutSearchParams, `?${searchParams}`);
    } else {
      parts.push(input);
    }
    return parts.join('');
  }
  private buildInit(): RequestInit {
    const { init, headers } = this;
    const method = this.buildMethod();
    const body = this.buildBody();
    return { ...init, headers, method, body };
  }
  private buildPrefixUrl(): string {
    const { init, input } = this;
    if (!init.prefixUrl) {
      return '';
    }
    const prefixUrl = init.prefixUrl.toString();
    if (!prefixUrl.endsWith('/') && !input.startsWith('/')) {
      return `${prefixUrl}/`;
    }
    return prefixUrl;
  }
  private buildSearchParams(): string {
    const { searchParams } = this.init;
    if (!searchParams) {
      return '';
    }
    if (typeof searchParams === 'string') {
      return searchParams.startsWith('?') ? searchParams.slice(1) : searchParams;
    }
    return new URLSearchParams(searchParams).toString();
  }
  private buildMethod(): RequestInit['method'] {
    const { init } = this;
    const method = init.method ? init.method.toUpperCase() : 'GET';
    return method;
  }
  private buildBody(): RequestInit['body'] {
    const { init, headers } = this;
    const { json, body } = init;
    if (json) {
      headers.set('content-type', 'application/json');
    }
    return json ? JSON.stringify(json) : body;
  }
  private build(): Request {
    return new Request(this.buildInput(), this.buildInit());
  }
}

// /** This Fetch API interface represents a resource request. */
// interface Request extends Body {
//   /**
//    * Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching.
//    */
//   readonly cache: RequestCache;
//   /**
//    * Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL.
//    */
//   readonly credentials: RequestCredentials;
//   /**
//    * Returns the kind of resource requested by request, e.g., "document" or "script".
//    */
//   readonly destination: RequestDestination;
//   /**
//    * Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header.
//    */
//   readonly headers: Headers;
//   /**
//    * Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI]
//    */
//   readonly integrity: string;
//   /**
//    * Returns a boolean indicating whether or not request is for a history navigation (a.k.a. back-foward navigation).
//    */
//   readonly isHistoryNavigation: boolean;
//   /**
//    * Returns a boolean indicating whether or not request is for a reload navigation.
//    */
//   readonly isReloadNavigation: boolean;
//   /**
//    * Returns a boolean indicating whether or not request can outlive the global in which it was created.
//    */
//   readonly keepalive: boolean;
//   /**
//    * Returns request's HTTP method, which is "GET" by default.
//    */
//   readonly method: string;
//   /**
//    * Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs.
//    */
//   readonly mode: RequestMode;
//   /**
//    * Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default.
//    */
//   readonly redirect: RequestRedirect;
//   /**
//    * Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init, the empty string to indicate no referrer, and "about:client" when defaulting to the global's default. This is used during fetching to determine the value of the `Referer` header of the request being made.
//    */
//   readonly referrer: string;
//   /**
//    * Returns the referrer policy associated with request. This is used during fetching to compute the value of the request's referrer.
//    */
//   readonly referrerPolicy: ReferrerPolicy;
//   /**
//    * Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler.
//    */
//   readonly signal: AbortSignal;
//   /**
//    * Returns the URL of request as a string.
//    */
//   readonly url: string;
//   clone(): Request;
// }

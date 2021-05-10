export interface RetryOptions {
  /**
	The number of times to retry failed requests.
	@default 2
	*/
  limit?: number;
  /**
	The HTTP methods allowed to retry.
	@default ['get', 'put', 'head', 'delete', 'options', 'trace']
	*/
  methods?: string[];
  /**
	The HTTP status codes allowed to retry.
	@default [408, 413, 429, 500, 502, 503, 504]
	*/
  statusCodes?: number[];
  /**
	The HTTP status codes allowed to retry with a `Retry-After` header.
	@default [413, 429, 503]
	*/
  afterStatusCodes?: number[];
  /**
	If the `Retry-After` header is greater than `maxRetryAfter`, the request will be canceled.
	@default Infinity
	*/
  maxRetryAfter?: number;
}

const DEFAULT_RETRY_METHODS = ['get', 'put', 'head', 'delete', 'options', 'trace'];

const DEFAULT_RETRY_STATUS_CODES = [408, 413, 429, 500, 502, 503, 504];

const DEFAULT_RETRY_AFTER_STATUS_CODES = [413, 429, 503];

export const KITE_DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  limit: 2,
  methods: DEFAULT_RETRY_METHODS,
  statusCodes: DEFAULT_RETRY_STATUS_CODES,
  afterStatusCodes: DEFAULT_RETRY_AFTER_STATUS_CODES,
  maxRetryAfter: Number.POSITIVE_INFINITY,
};

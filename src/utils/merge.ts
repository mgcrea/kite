import { KiteOptions, KiteNormalizedOptions, KiteHooks, KiteHeadersInit } from 'src/core/KiteClient.js';
import { KITE_DEFAULT_RETRY_OPTIONS, RetryOptions } from './retry';

// type RequiredKeys<T, K extends keyof T = keyof T> = Pick<T, Exclude<keyof T, K>> & {[P in K]: NonNullable<T[P]>};

export const mergeArray = <T>(array?: T[], source?: T[]): T[] => (array ? array.slice() : []).concat(source ?? []);

export const mergeHooks = (hooks: Partial<KiteHooks> = {}, source: Partial<KiteHooks> = {}): KiteHooks => {
  return {
    beforeRequest: mergeArray(hooks.beforeRequest, source.beforeRequest),
    afterResponse: mergeArray(hooks.afterResponse, source.afterResponse),
  };
};

export const mergeHeaders = (headersInit: KiteHeadersInit = {}, source: KiteHeadersInit = {}): Headers => {
  const headers = new Headers(headersInit as HeadersInit);
  if (!source) {
    return headers;
  }
  const sourceHeaders = source instanceof Headers ? source : new Headers(source as HeadersInit);
  for (const [key, value] of sourceHeaders.entries()) {
    if (value === 'undefined') {
      headers.delete(key);
    } else {
      headers.set(key, value);
    }
  }
  return headers;
};

export const mergeOptions = (
  options: Partial<KiteNormalizedOptions>,
  source: KiteOptions = {}
): KiteNormalizedOptions => {
  const hooks = mergeHooks(options.hooks, source.hooks);
  const headers = mergeHeaders(options.headers, source.headers);
  const retry = mergeRetry(options.retry, source.retry);
  return { ...options, ...source, hooks, headers, retry };
};

export const mergeRetry = (
  retry: Required<RetryOptions> = KITE_DEFAULT_RETRY_OPTIONS,
  source: number | RetryOptions = {}
): Required<RetryOptions> => {
  if (typeof source === 'number') {
    return {
      ...retry,
      limit: source,
    };
  }

  if (retry.methods && !Array.isArray(retry.methods)) {
    throw new Error('retry.methods must be an array');
  }
  if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
    throw new Error('retry.statusCodes must be an array');
  }

  return {
    ...retry,
    ...source,
  };
};

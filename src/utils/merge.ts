import { KiteRequestInit, KiteOptions, KiteHooks, KiteHeadersInit } from 'src/core/KiteClient.js';

export const mergeOptions = (options: KiteRequestInit, source: KiteRequestInit = {}): KiteOptions => {
  const hooks = mergeHooks(options.hooks, source.hooks);
  const headers = mergeHeaders(options.headers, source.headers);
  return { ...options, ...source, hooks, headers };
};

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
  sourceHeaders.forEach((value, key) => {
    if (value === 'undefined') {
      headers.delete(key);
    } else {
      headers.set(key, value);
    }
  });
  return headers;
};
